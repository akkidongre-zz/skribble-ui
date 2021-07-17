import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Note } from './models/note.model';
import { NotesService } from './notes.service';

import { EditNoteComponent } from './edit-note/edit-note.component';
import { NoteComponent } from './note/note.component';
import { NoteDetailsComponent } from './note-details/note-details.component';
import { AuthService } from '../auth/auth.service';
import { NgxMasonryComponent } from 'ngx-masonry';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {
  private notesUpdatedSub: Subscription;

  myNotes: Note[] = [];
  myOtherNotes: Note[] = [];
  pinnedNotes: Note[] = [];

  deviceWidth = window.screen.width;

  @HostListener("window:resize", ["$event"])
  onResize(event: Event) {
    this.deviceWidth = (event.currentTarget as Window).innerWidth;
  }

  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent;

  constructor(
    private notesService: NotesService,
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.notesUpdatedSub = this.notesService.notesUpdated.subscribe((_) => {
      this.myNotes = this.notesService.getMyNotes();
      this.differentiateNotes();
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
    // this.masonry.reloadItems();
    // this.masonry.layout();
  }

  onDeleteNote(id: number) {
    this.notesService.deleteNote(id);
  }

  onEditNote(id: number) {
    // const index = this.myNotes.findIndex((nt) => nt.id === id);
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
    // this.myNotes[i].todo[todoIndex].value = !this.myNotes[i].todo[todoIndex].value;

    this.notesService.markTodo(this.myNotes[i]);
  }

  ngOnDestroy() {
    if (this.notesUpdatedSub) {
      this.notesUpdatedSub.unsubscribe();
    }
  }

}
