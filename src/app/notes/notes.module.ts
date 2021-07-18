import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotesRoutingModule } from './notes-routing.module';
import { SharedModule } from '../shared/shared.module';

import { NgxMasonryModule } from 'ngx-masonry';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { NotesComponent } from './notes.component';
import { NoteComponent } from './note/note.component';
import { CreateNoteComponent } from './create-note/create-note.component';
import { EditNoteComponent } from './edit-note/edit-note.component';
import { NoteDetailsComponent } from './note-details/note-details.component';
import { NoteContentComponent } from './note/note-content/note-content.component';
import { ImageGalleryComponent } from './image-gallery/image-gallery.component';
import { MapsComponent } from './maps/maps.component';


@NgModule({
  declarations: [
    NotesComponent,
    NoteComponent,
    CreateNoteComponent,
    EditNoteComponent,
    NoteDetailsComponent,
    NoteContentComponent,
    ImageGalleryComponent,
    MapsComponent
  ],
  imports: [
    CommonModule,
    NotesRoutingModule,
    SharedModule,
    MatCardModule,
    MatCheckboxModule,
    NgxMasonryModule,
    MatListModule,
    DragDropModule,
    MatDialogModule,
    MatDividerModule,
    MatGridListModule,
    LeafletModule
  ]
})
export class NotesModule { }
