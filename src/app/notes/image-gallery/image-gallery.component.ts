import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.css']
})
export class ImageGalleryComponent implements OnInit {

  @Input()
  images: any;

  @Input()
  deleteImageVisible: {[key: number]: string} = {};

  @Output()
  delete = new EventEmitter<number>();

  @Input()
  showDeleteButton: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  onDeleteImage(e: Event, i: number) {
    e.stopPropagation();
    this.delete.emit(i);
  }

  onImageMouseover(i: number) {
    this.deleteImageVisible[i] = 'visible';
  }

  onMouseLeave(i: number) {
    this.deleteImageVisible[i] = 'hidden';
  }

}
