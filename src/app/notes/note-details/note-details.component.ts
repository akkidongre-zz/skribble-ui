import { Component, Inject, OnInit } from '@angular/core';
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

  editMode = false;
  note: Note;

  private allowedImageFormats = ['png', 'jpg', 'jpeg', 'webp'];
  uploadedImages: string[] = [];
  deleteImageVisible: {[key: number]: string} = {};

  anyChanges = false;

  latitude: string;
  longitude: string;

  includeMaps = false;

  private mapLinkSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {data: Note, editMode: boolean},
    private dialogRef: MatDialogRef<any>,
    private commonService: CommonService,
    private notesService: NotesService
  ) { }

  ngOnInit(): void {
    this.note = this.data.data;
    this.editMode = this.data.editMode;
    this.uploadedImages = this.note.images;

    for (let i = 0; i < this.note.images.length; i++) {
      this.deleteImageVisible[i] = 'hidden';
    }

    if (this.note.includesMaps) {
      this.latitude = this.note.lat;
      this.longitude = this.note.long;
      this.includeMaps = true;
    }

    this.mapLinkSub = this.notesService.mapLinkSubject.subscribe((link) => {
      this.latitude = link[0];
      this.longitude = link[1];
      this.includeMaps = true;
      // this.onAddLink();
    });
  }

  onCheckboxClick(index: number) {
    this.note.todo[index].value = !this.note.todo[index].value;
    this.notesService.markTodo(this.note);
  }

  onToggleEditMode() {
    this.editMode = !this.editMode;
  }

  onClose() {
    
    this.dialogRef.close();
  }

  onEdit() {
    
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
    this.anyChanges = true;
    this.uploadedImages.splice(index,1);
  }

  onAddLink() {
    // this.note.includesMaps = true;
    // this.note.lat = this.latitude;
    // this.note.long = this.longitude;
    
  }

  onDeleteMap() {
    this.note.includesMaps = false;
    this.note.lat = '';
    this.note.long = '';
    this.latitude = '';
    this.longitude = '';
    this.includeMaps = false;
    this.notesService.updateAllNotes(this.note);
  }

  ngOnDestroy() {
    if (this.mapLinkSub) {
      this.mapLinkSub.unsubscribe();
    }
  }

}
