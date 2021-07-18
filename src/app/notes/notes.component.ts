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
    
    if (!this.searchKey.trim()) {

    }

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
    // this.masonry.reloadItems();
    // this.masonry.layout();
  }

  deepCopyNotes(note: Note) {
    this.myFilteredNotes.push(note);

    if (note.isPinned) {
      this.myFilteredPinnedNotes.push(note);
      return;
    }

    this.myFilteredOtherNotes.push(note);
    // let todoList = [];
    // if (note.type === "todo") {
    //   for (let item of note.todo) {
    //     todoList.push({
    //       "todoTitle": item.todoTitle,
    //       "value": item.value
    //     });
    //   }
    // }

    // this.myFilteredNotes.push({
    //   ...note,
    //   todo: todoList
    // });

    // if (note.isPinned) {
    //   this.myFilteredPinnedNotes.push({
    //     ...note,
    //     todo: todoList
    //   });
    //   return;
    // }

    // this.myFilteredOtherNotes.push({
    //   ...note,
    //   todo: todoList
    // });
  }

  onDeleteNote(id: number) {
    this.notesService.deleteNote(id);
  }

  onEditNote(id: number) {
    const index = this.myNotes.findIndex((nt) => nt.id === id);
    this.onClickNote(id, true);
  }

  onClickNote(id: number, editMode=false) {
    const noteData = this.myNotes.find((nt) => nt.id === id);
    let maxHeight = "600px";
    if (this.deviceWidth <= 768) {
      maxHeight = "500px";
    }
    const dialogRef = this.matDialog.open(NoteDetailsComponent, {
      height: "auto",
      width: "600px",
      minWidth: "350px",
      minHeight: "200px",
      maxHeight: maxHeight,
      data: {
        data: noteData,
        editMode: editMode
      }
    });

    dialogRef.afterClosed().subscribe((response) => {
    })
  }

  onAddImage(id: number) {

  }

  onNotePin(id: number) {
    const foundNote = this.myNotes.find((nt) => nt.id === id);
    if (foundNote?.isPinned) {
      this.notesService.unPinNote(id);
    } else {
      this.notesService.pinNote(id);
    }
  }

  onCheckboxClick(todoIndex: number, id: number) {
    const i = this.myNotes.findIndex((nt) => nt.id === id);
    this.myNotes[i].todo[todoIndex].value = !this.myNotes[i].todo[todoIndex].value;

    this.notesService.markTodo(this.myNotes[i]);
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
