import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';
import { Note } from '../models/note.model';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.css']
})
export class NoteDetailsComponent implements OnInit {

  editNoteForm: FormGroup;
  editMode = false;
  note: Note;

  includesImages = false;
  includesMaps = false;
  notePinned = false;

  showUrlInputField = false;
  addedLink = '';
  latitude: string;
  longitude: string;

  private allowedImageFormats = ['png', 'jpg', 'jpeg', 'webp'];
  uploadedImages: string[] = [];
  deleteImageVisible: {[key: number]: string} = {};

  todoChanges = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {data: Note, editMode: boolean},
    private dialogRef: MatDialogRef<any>,
    private commonService: CommonService,
    private notesService: NotesService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.note = this.data.data;
    this.editMode = this.data.editMode;
    this.uploadedImages = this.note.images.slice();

    for (let i = 0; i < this.note.images.length; i++) {
      this.deleteImageVisible[i] = 'hidden';
    }

    if (this.note.includesMaps) {
      this.latitude = this.note.lat;
      this.longitude = this.note.long;
      this.includesMaps = true;
    }

    this.notePinned = this.note.isPinned;

    this.initializeForm();
  }

  initializeForm() {
    this.editNoteForm = this.fb.group({
      title: [this.note.title],
      content: [this.note.content],
      todo: this.fb.array([]),
    });

    if (this.note.type === 'todo') {
      this.populateTodo();
    }
  }

  populateTodo() {
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

  onToggleEditMode() {
    this.editMode = !this.editMode;
  }

  drop(event: CdkDragDrop<string[]>) {
    let todoArr = this.todo.value;
    moveItemInArray(todoArr, event.previousIndex, event.currentIndex);
    this.todo.patchValue(todoArr);
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

    this.latitude = latLongValues[0];
    this.longitude = latLongValues[1];

    this.includesMaps = true;
    this.showUrlInputField = false;
    this.addedLink = '';
  }

  onRemoveLink() {
    this.addedLink = '';
    this.includesMaps = false;
    this.latitude = '';
    this.longitude = '';
  }

  onImageUpload(event: Event) {
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

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        let readImage = reader.result as string;
        this.deleteImageVisible[this.uploadedImages.length] = 'hidden';
        this.uploadedImages.push(readImage);
      }
      reader.readAsDataURL(file);
    }
  }

  onDeleteImage(index: number) {
    this.uploadedImages.splice(index,1);
  }

  onPin(e: Event) {
    this.notePinned = !this.notePinned;
  }

  onCheckboxClick(index: number) {
    const newVal = !this.note.todo[index].value
    this.note.todo[index].value = newVal;
    this.todo.at(index).patchValue({
      value: newVal
    });
    this.todoChanges = true;
  }

  validateForm(formType: string): boolean {
    const titleVal = this.note.title;
    const contentVal = this.editNoteForm.get('content')?.value;

    if (titleVal) return true;

    if (contentVal) return true;

    if (this.uploadedImages.length > 0) return true;

    if (this.includesMaps) return true;

    if (formType === 'todo') {
      let checkFlag = false;
      
        for (let i = 0; i < this.todo.value.length; i++) {
          if (this.todo.value[i].todoTitle){
            checkFlag = true;
          }
        }

        return checkFlag;
    }

    return false;
  }

  onSubmit() {
    let formType = this.note.type

    const isValid = this.validateForm(formType);
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

    const editedNote: Note = {
      ...this.note,
      content: this.editNoteForm.get('content')?.value,
      todo: todoList,
      includesImages: this.uploadedImages.length > 0 ? true : false,
      includesMaps: this.includesMaps,
      images: this.uploadedImages,
      isPinned: this.notePinned,
      lat: this.latitude,
      long: this.longitude
    }

    this.notesService.updateAllNotes(editedNote);
    this.dialogRef.close({
      data: {
        data: editedNote,
      }
    });
  }

  onClose() {
    this.dialogRef.close({
      data: this.note
    });
  }

}
