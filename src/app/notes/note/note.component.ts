import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  addImage = new EventEmitter<boolean>(false);

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

  constructor() { }

  ngOnInit(): void {
    if (!this.note.title && !this.note.content && this.note.images.length === 0 && this.note.todo.length === 0) {
      this.emptyNote = true;
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

  onAddImageClick(e: Event) {
    e.stopPropagation();
    this.addImage.emit(true);
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
