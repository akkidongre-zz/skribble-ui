import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Note } from './models/note.model';
import { NotesService } from './notes.service';

import { NoteDetailsComponent } from './note-details/note-details.component';
import { NgxMasonryComponent } from 'ngx-masonry';
import { CommonService } from '../shared/common.service';

import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {
  private notesUpdatedSub: Subscription;
  private searchSub: Subscription;

  searchKey = '';

  // Store of notes
  myNotes: Note[] = [];
  myOtherNotes: Note[] = [];
  pinnedNotes: Note[] = [];

  // Display note lists. Vary based on filter
  myFilteredNotes: Note[] = [];
  myFilteredOtherNotes: Note[] = [];
  myFilteredPinnedNotes: Note[] = [];

  deviceWidth = window.screen.width;

  private allowedImageFormats = ['png', 'jpg', 'jpeg', 'webp'];

  @HostListener("window:resize", ["$event"])
  onResize(event: Event) {
    this.deviceWidth = (event.currentTarget as Window).innerWidth;
  }

  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent;

  constructor(
    private notesService: NotesService,
    private commonService: CommonService,
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.notesUpdatedSub = this.notesService.notesUpdated.subscribe((_) => {
      this.myNotes = this.notesService.getMyNotes();
      this.differentiateNotes();
      this.setFilteredNotes();
    });

    this.searchSub = this.commonService.searchQuery.pipe(debounceTime(300)).subscribe((key) => {
      this.searchKey = key;
      this.setFilteredNotes();
    });
  }

  differentiateNotes() {
    this.myOtherNotes = [];
    this.pinnedNotes = [];
    for (let i = 0; i < this.myNotes.length; i++) {
      if (this.myNotes[i].isPinned) {
        this.pinnedNotes.push(this.myNotes[i]);
      } else {
        this.myOtherNotes.push(this.myNotes[i]);
      }
    }
    
  }

  setFilteredNotes() {
    this.myFilteredNotes = [];
    this.myFilteredPinnedNotes = [];
    this.myFilteredOtherNotes = [];
    
    for (let i = 0; i < this.myNotes.length; i++) {
      const lowerKey = this.searchKey.trim().toLowerCase();

      let include = false;

      if (this.myNotes[i].title?.toLowerCase().includes(lowerKey) ||
        this.myNotes[i].content?.toLowerCase().includes(lowerKey) ||
        this.myNotes[i].type.toLowerCase().includes(lowerKey)
      ) {
        include = true;
      } else if (this.myNotes[i].type === "todo") {
        for (let item of this.myNotes[i].todo) {
          if (item?.todoTitle?.toLowerCase().includes(lowerKey)) {
            include = true;
          }
        }
      }

      if (include) {
        this.deepCopyNotes(this.myNotes[i]);
      }
    }
    // if (this.masonry) {
    //   this.masonry.reloadItems();
    //   this.masonry.layout();
    // } 
  }

  deepCopyNotes(note: Note) {
    this.myFilteredNotes.push(note);

    if (note.isPinned) {
      this.myFilteredPinnedNotes.push(note);
      return;
    }

    this.myFilteredOtherNotes.push(note);
  }

  onDeleteNote(id: number) {
    this.notesService.deleteNote(id);
  }

  onEditNote(id: number) {
    const noteData = this.myFilteredNotes.find((nt) => nt.id === id);

    if (!noteData) {
      return;
    }

    this.openDialog(noteData, true);
  }

  openDialog(noteData: Note, editMode: boolean = false) {
    let maxHeight = "600px";
    if (this.deviceWidth <= 768) {
      maxHeight = "500px";
    }

    const dialogRef = this.matDialog.open(NoteDetailsComponent, {
      height: "auto",
      width: "600px",
      minWidth: "350px",
      minHeight: "100px",
      maxHeight: maxHeight,
      data: {
        data: noteData,
        editMode: editMode
      },
      disableClose: true
    });

    this.removeNoteFromFilteredData(noteData.id);

    dialogRef.afterClosed().subscribe((data) => {
      this.notesService.updateAllNotes(data.data);
    })
  }

  removeNoteFromFilteredData(id: number) {
    const filteredIndex = this.myFilteredNotes.findIndex((nt) => nt.id === id);
    this.myFilteredNotes.splice(filteredIndex, 1);

    const pinnedIndex = this.myFilteredPinnedNotes.findIndex((nt) => nt.id === id);
    if (pinnedIndex > -1) this.myFilteredPinnedNotes.splice(pinnedIndex, 1);

    const otherIndex = this.myFilteredOtherNotes.findIndex((nt) => nt.id === id);
    if (otherIndex > -1) this.myFilteredOtherNotes.splice(otherIndex, 1);
  }

  onClickNote(e: Event, id: number) {
    const noteData = this.myFilteredNotes.find((nt) => nt.id === id);
    
    if (!noteData) {
      return;
    }

    if ((e.target as HTMLElement).classList.contains('url-link')) {
      return;
    }

    this.openDialog(noteData);
  }

  onAddImage(event: Event, id: number) {
    const files = (event.target as HTMLInputElement).files;
    let file;
    if (files && files.length > 0) {
      file = files[0];
    }

    if (file && this.allowedImageFormats.indexOf(file?.type.split("/")[1]) === -1) {
      this.commonService.openSnackbar("Please upload png, jpg, jpeg or webp images");
      return;
    }

    if (file && file.size > 150000) {
      this.commonService.openSnackbar("Image size should be less than 150kb");
      return;
    }

    const index = this.myFilteredNotes.findIndex((nt) => nt.id === id);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        let readImage = reader.result as string;
        this.myFilteredNotes[index].images.push(readImage);
        this.notesService.updateAllNotes(this.myFilteredNotes[index]);
        this.commonService.openSnackbar("Image uploaded", "Okay");
      }
      reader.readAsDataURL(file);
    }
  }

  onNotePin(id: number) {
    const foundNote = this.myFilteredNotes.find((nt) => nt.id === id);
    if (foundNote?.isPinned) {
      this.notesService.unPinNote(id);
    } else {
      this.notesService.pinNote(id);
    }
  }

  onCheckboxClick(todoIndex: number, id: number) {
    const i = this.myFilteredNotes.findIndex((nt) => nt.id === id);
    this.myFilteredNotes[i].todo[todoIndex].value = !this.myFilteredNotes[i].todo[todoIndex].value;

    this.notesService.markTodo(this.myFilteredNotes[i]);
  }

  ngOnDestroy() {
    if (this.notesUpdatedSub) {
      this.notesUpdatedSub.unsubscribe();
    }

    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

}
