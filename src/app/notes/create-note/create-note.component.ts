import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/auth.service';
import { CommonService } from 'src/app/shared/common.service';
import { Note } from '../models/note.model';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-create-note',
  templateUrl: './create-note.component.html',
  styleUrls: ['./create-note.component.css']
})
export class CreateNoteComponent implements OnInit {

  createNoteForm: FormGroup;

  showTitleField = false;
  contentRowsCount = 1;

  todoSelected = false;
  notePinned = false;
  noteWithImage = false;

  reacted = false;

  contentKeyupTimer: ReturnType<typeof setTimeout>;
  showUrlInputField = false;
  addedLink = '';
  includesUrl = false;

  private allowedImageFormats = ['png', 'jpg', 'jpeg', 'webp'];
  uploadedImages: string[] = [];

  deleteImageVisible: {[key: number]: string} = {};

  includesMaps = false;
  latitude = '';
  longitude = '';

  @HostListener('document:click', ['$event'])
  clickOut(event: Event) {
    if (this.elementRef.nativeElement.contains(event.target)) {
      this.showTitleField = true;
      this.contentRowsCount = 3;
    } else {
      if(!(event.target as HTMLElement)?.closest('.mat-snack-bar-container')) {
        this.onClose();
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private notesService: NotesService,
    private authService: AuthService,
    private elementRef: ElementRef,
    private snackbar: MatSnackBar,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.createNoteForm = this.fb.group({
      title: [""],
      content: [""],
      todo: this.fb.array([
        new FormGroup({
          todoTitle: new FormControl(''),
          value: new FormControl(false)
        })
      ])
    });
  }

  get todo() {
    return this.createNoteForm.controls["todo"] as FormArray;
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

  onRemoveLink(e: Event) {
    e.stopPropagation();
    this.addedLink = '';
    this.includesMaps = false;
    this.latitude = '';
    this.longitude = '';
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

  onToggleTodoList() {
    this.todoSelected = !this.todoSelected;
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

  validateForm(formType: string): boolean {
    const titleVal = this.createNoteForm.get('title')?.value;
    const contentVal = this.createNoteForm.get('content')?.value;
    
    if (formType === "note") {
      if (!titleVal && !contentVal && this.uploadedImages.length === 0) {
        return false;
      }
    }

    if (formType === "todo") {
      if (!titleVal && this.todo.value.length === 0 && this.uploadedImages.length === 0) {
        return false;
      } else if (!titleVal && this.uploadedImages.length === 0) {
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
    let formType = "note";
    if (this.todoSelected) {
      formType = "todo";
    }

    const isValid = this.validateForm(formType);
    if (!isValid) {
      this.commonService.openSnackbar("Please enter a value to save the note", "Okay");
      return;
    }

    const id = this.notesService.generateNoteId();
    let todoList = this.todo.value;
    for (let i = todoList.length-1; i >= 0; i--) {
      if (!todoList[i].todoTitle) {
        todoList.splice(i,1);
      }
    }

    const note: Note = {
      id: id,
      title: this.createNoteForm.get('title')?.value,
      content: this.createNoteForm.get('content')?.value,
      author: this.authService.getUser().id,
      todo: todoList,
      type: formType,
      includesUrl: this.includesUrl,
      includesImages: this.uploadedImages.length > 0 ? true : false,
      includesMaps: this.includesMaps,
      images: this.uploadedImages,
      isPinned: this.notePinned,
      lat: this.latitude,
      long: this.longitude
    }

    this.notesService.setAllNotes(note);
    this.resetFormAndValues();
  }

  onClose() {
    this.resetFormAndValues();
  }

  resetFormAndValues() {
    for (let i = this.todo.length-1; i >= 1; i--) {
      this.todo.removeAt(i);
    }

    this.uploadedImages = [];
    this.createNoteForm.reset();
    this.showTitleField = false;
    this.todoSelected = false;
    this.notePinned = false;
    this.noteWithImage = false;
    this.contentRowsCount = 1;
    this.includesMaps = false;
    this.latitude = '';
    this.longitude = '';
  }

}
