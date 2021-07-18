import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Note } from './models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  private allNotes: Note[] = [];
  private myNotes: Note[] = [];

  notesUpdated = new BehaviorSubject<boolean>(false);

  mapLinkSubject = new Subject<string[]>();

  constructor(
    private authService: AuthService
  ) { }

  generateNoteId() {
    let maxId = 0;
    for (let i = 0; i < this.allNotes.length; i++) {
      if (this.allNotes[i].id > maxId) {
        maxId = this.allNotes[i].id;
      }
    }

    return (maxId + 1);
  }

  getAllNotes() {
    if (this.allNotes.length === 0) {
      let allNotesString = localStorage.getItem("all_notes");
      if (allNotesString) {
        this.allNotes = JSON.parse(allNotesString);
      }
    }
    return this.allNotes.slice();
  }

  setAllNotes(note: Note) {
    // this.allNotes = [note, ...this.allNotes];
    this.allNotes.push(note);
    this.setMyNotes(note);
    this.saveAllNotesToLocalStorage();
  }

  setMyNotes(note: Note) {
    // this.myNotes = [note, ...this.myNotes];
    this.myNotes.push(note);
    this.notesUpdated.next(true);
  }

  getMyNotes() {
    if (this.myNotes.length === 0) {
      const user = this.authService.getUser();
      if (this.allNotes.length === 0) {
        let allNotesString = localStorage.getItem("all_notes");
        if (allNotesString) {
          this.allNotes = JSON.parse(allNotesString);
        }
      }

      for (let i = 0; i < this.allNotes.length; i++) {
        if (this.allNotes[i].author === user.id) {
          this.myNotes.push(this.allNotes[i]);
        }
      }
    }
    return this.myNotes.slice();
  }

  updateAllNotes(note: Note) {
    for (let i = 0; i < this.allNotes.length; i++) {
      if (this.allNotes[i].id === note.id) {
        this.allNotes[i] = note;
      }
    }
    this.updateMyNotes(note);
    this.saveAllNotesToLocalStorage();
  }

  updateMyNotes(note: Note) {
    for (let i = 0; i < this.myNotes.length; i++) {
      if (this.myNotes[i].id === note.id) {
        this.myNotes[i] = note;
      }
    }
  }

  deleteNote(id: number) {
    this.allNotes = this.allNotes.filter((note) => note.id !== id);
    this.myNotes = this.myNotes.filter((note) => note.id !== id);
    this.saveAllNotesToLocalStorage();
  }

  clearMyNotes() {
    this.myNotes = [];
  }

  markTodo(note: Note) {
    const indexInAll = this.allNotes.findIndex((nt) => nt.id === note.id);
    this.allNotes[indexInAll].todo = note.todo;
    const indexInMyNotes = this.myNotes.findIndex((nt) => nt.id === note.id);
    this.myNotes[indexInMyNotes].todo = note.todo;

    this.saveAllNotesToLocalStorage();
  }

  pinNote(id: number) {
    const indexInAll = this.allNotes.findIndex((note) => note.id === id);
    this.allNotes[indexInAll].isPinned = true;

    const indexInMyNotes = this.myNotes.findIndex((note) => note.id === id);
    this.myNotes[indexInMyNotes].isPinned = true;

    this.saveAllNotesToLocalStorage();
  }

  unPinNote(id: number) {
    const indexInAll = this.allNotes.findIndex((note) => note.id === id);
    this.allNotes[indexInAll].isPinned = false;

    const indexInMyNotes = this.myNotes.findIndex((note) => note.id === id);
    this.myNotes[indexInMyNotes].isPinned = false;
    
    this.saveAllNotesToLocalStorage();
  }

  saveAllNotesToLocalStorage() {
    localStorage.setItem("all_notes", JSON.stringify(this.allNotes));
    this.notesUpdated.next(true);
  }

}
