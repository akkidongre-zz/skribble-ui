import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Note } from '../models/note.model';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {

  @Input()
  note: Note;

  @Output()
  delete = new EventEmitter<number>();

  @Output()
  addImage = new EventEmitter<Event>();

  @Output()
  checkboxClick = new EventEmitter<number>();

  @Output()
  pinClick = new EventEmitter<number>();

  @Output()
  editMode = new EventEmitter<number>();

  noteType: string;
  noteContent: string[];
  
  actionsVisibility = 'hidden';

  emptyNote = false;
  noteTitle = '';

  latitude: string;
  longitude: string;

  @ViewChild('img')
  imageInput: ElementRef;

  constructor() { }

  ngOnInit(): void {
    if (!this.note.title && !this.note.content && this.note.images.length === 0 && this.note.todo.length === 0) {
      this.emptyNote = true;
    }

    this.noteTitle = this.note.title;

    if (this.emptyNote) {
      this.noteTitle = 'Empty note';
    } else if (!this.note.title) {
      this.noteTitle = 'No title';
    }

    if (this.note.includesMaps) {
      this.latitude = this.note.lat;
      this.longitude = this.note.long;
    }
  }

  onMouseOver() {
    this.actionsVisibility = 'visible';
  }

  onMouseLeave() {
    this.actionsVisibility = 'hidden';
  }

  onEdit(e: Event) {
    e.stopPropagation();
    this.editMode.emit(this.note.id);
  }

  onDelete(e: Event) {
    e.stopPropagation();
    this.delete.emit(this.note.id);
  }

  onAddImage(e: Event) {
    this.addImage.emit(e);
  }

  onImageInputClick(e: Event) {
    e.stopPropagation();
  }

  onAddImageClick(e: Event) {
    e.stopPropagation();
    this.imageInput.nativeElement.click();
    // this.addImage.emit(true);
  }

  onPinNote(e: Event) {
    e.stopPropagation();
    this.pinClick.emit(this.note.id);
  }

  onCheckboxClick(index: number) {
    // this.note.todo[index].value = true;
    this.checkboxClick.emit(index);
  }

}
