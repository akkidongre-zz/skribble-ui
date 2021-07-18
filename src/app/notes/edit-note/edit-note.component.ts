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

  latitude: string;
  longitude: string;

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

  @Output()
  deleteMap = new EventEmitter<boolean>(false);

  constructor(
    private notesService: NotesService,
    private fb: FormBuilder,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.editNoteForm = this.fb.group({
      title: [this.note.title],
      content: [this.note.content],
      todo: this.fb.array([])
    });
    
    if (this.note.type === 'todo') {
      this.todoSelected = true;
      this.setTodoData();
    }

    this.includesImages = this.note.includesImages;
    this.includesMaps = this.note.includesMaps;
    this.includesUrl = this.note.includesUrl;
    this.notePinned = this.note.isPinned;

    this.latitude = this.note.lat;
    this.longitude = this.note.long;
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

  onAddLinkClick(e: Event) {
    e.stopPropagation();
    this.showUrlInputField = true;
  }

  onAddLink(e: Event) {
    const openSnackbar = () => {
      this.commonService.openSnackbar("Please add a valid url");
      this.addedLink = '';
    }

    e.stopPropagation();
    if (!this.addedLink) {
      this.commonService.openSnackbar("Please add a valid url");
      this.addedLink = '';
      return;
    }
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

    if (!this.addedLink.match(urlRegex)) {
      openSnackbar();
      return;
    }

    if (!this.addedLink.includes("@")) {
      openSnackbar();
      return;
    }

    let splitParams = this.addedLink.split("@");

    if (splitParams.length == 1) {
      openSnackbar();
      return;
    }

    const latLongValues = splitParams[1].split(",");
    if (latLongValues.length < 2) {
      openSnackbar();
      return;
    }

    this.notesService.mapLinkSubject.next(latLongValues);

    this.includesMaps = true;
    this.latitude = latLongValues[0];
    this.longitude = latLongValues[1];
    // this.note.lat = latLongValues[0];
    // this.note.long = latLongValues[1];
    // this.includesMaps = true;
    this.showUrlInputField = false;
    this.addedLink = '';
  }

  onRemoveLink() {
    this.addedLink = '';
    this.includesMaps = false;
    this.deleteMap.emit(true);
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

  validateForm(formType: string): boolean {
    const titleVal = this.noteTitle;
    const contentVal = this.editNoteForm.get('content')?.value;
    
    if (formType === "note") {
      if (!titleVal && !contentVal && this.imagesList.length === 0) {
        return false;
      }
    }

    if (formType === "todo") {
      if (!titleVal && this.todo.value.length === 0 && this.imagesList.length === 0) {
        return false;
      } else if (!titleVal && this.imagesList.length === 0) {
        let checkFlag = false;
        for (let i = 0; i < this.todo.value.length; i++) {
          if (this.todo.value[i].todoTitle){
            checkFlag = true;
          }
        }

        return checkFlag;
      }
    }

    return true;
  }

  onSubmit() {
    if (this.imagesList.length > 0) {
      this.includesImages = true;
    } else {
      this.includesImages = false;
    }

    const isValid = this.validateForm(this.note.type);
    if (!isValid) {
      this.commonService.openSnackbar("Please enter a value to save the note", "Okay");
      return;
    }

    let todoList = this.todo.value;
    for (let i = todoList.length-1; i >= 0; i--) {
      if (!todoList[i].todoTitle) {
        todoList.splice(i,1);
      }
    }

    this.note = {
      ...this.note,
      title: this.noteTitle,
      content: this.editNoteForm.get('content')?.value,
      todo: todoList,
      includesImages: this.includesImages,
      includesMaps: this.includesMaps,
      includesUrl: this.includesUrl,
      isPinned: this.notePinned,
      lat: this.latitude,
      long: this.longitude
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
