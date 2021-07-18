import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/shared/common.service';
import { Note } from '../models/note.model';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-edit-note',
  templateUrl: './edit-note.component.html',
  styleUrls: ['./edit-note.component.css']
})
export class EditNoteComponent implements OnInit {

  editNoteForm: FormGroup;

  todoSelected = false;

  showUrlInputField = false;
  addedLink = '';

  includesImages = false;
  includesUrl = false;
  includesMaps = false;
  notePinned = false;

  @Input()
  note: Note;

  @Input()
  noteTitle: string;

  @Input()
  imagesList: string[];

  @Output()
  close = new EventEmitter<boolean>(false);

  @Output()
  imageUpload = new EventEmitter<Event>();

  @Output()
  changeMode = new EventEmitter<boolean>(true);

  constructor(
    private notesService: NotesService,
    private fb: FormBuilder,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.editNoteForm = this.fb.group({
      "title": [this.note.title],
      "content": [this.note.content],
      "todo": this.fb.array([])
    });
    
    if (this.note.type === 'todo') {
      this.todoSelected = true;
      this.setTodoData();
    }

    this.includesImages = this.note.includesImages;
    this.includesMaps = this.note.includesMaps;
    this.includesUrl = this.note.includesUrl;
    this.notePinned = this.note.isPinned;
  }

  setTodoData() {
    for (let i = 0; i < this.note.todo.length; i++) {
      const todoForm = this.fb.group({
        todoTitle: [this.note.todo[i].todoTitle],
        value: [this.note.todo[i].value]
      });
      this.todo.push(todoForm);
    }
  }

  get todo() {
    return this.editNoteForm.controls["todo"] as FormArray;
  }

  onAddLinkClick() {
    this.showUrlInputField = true;
  }

  onAddLink(e: Event) {
    e.stopPropagation();
    if (!this.addedLink) {
      this.commonService.openSnackbar("Please add a valid url");
      this.addedLink = '';
      return;
    }
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

    if (!this.addedLink.match(urlRegex)) {
      this.commonService.openSnackbar("Please add a valid url");
      this.addedLink = '';
      return;
    }

    const newValue = this.editNoteForm.get('content')?.value + `\n${this.addedLink}\n`;
    this.editNoteForm.patchValue({
      "content": newValue
    });

    this.showUrlInputField = false;
    this.addedLink = '';
    this.includesUrl = true;
  }

  addNewItemToList() {
    const todoForm = this.fb.group({
      todoTitle: [''],
      value: [false]
    });
    this.todo.push(todoForm);
  }

  deleteItemFromList(index: number, e: Event) {
    e.stopPropagation();
    this.todo.removeAt(index);
  }

  drop(event: CdkDragDrop<string[]>) {
    let todoArr = this.todo.value;
    moveItemInArray(todoArr, event.previousIndex, event.currentIndex);
    this.todo.patchValue(todoArr);
  }

  onImageUpload(event: Event) {
    this.imageUpload.emit(event);
  }

  onSubmit() {
    if (this.imagesList.length > 0) {
      this.includesImages = true;
    } else {
      this.includesImages = false;
    }

    this.note = {
      ...this.note,
      title: this.noteTitle,
      content: this.editNoteForm.get('content')?.value,
      todo: this.todo.value,
      includesImages: this.includesImages,
      includesMaps: this.includesMaps,
      includesUrl: this.includesUrl,
      isPinned: this.notePinned
    }
    this.notesService.updateAllNotes(this.note);
    this.onClose();
  }

  onClose() {
    this.close.emit(true);
  }

  onPin(e: Event) {
    this.notePinned = !this.notePinned;
  }

  onCancel(e: Event) {
    e.stopPropagation();
    this.changeMode.emit(true);
  }

}
