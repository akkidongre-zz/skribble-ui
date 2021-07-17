import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-grid-list',
  templateUrl: './image-grid-list.component.html',
  styleUrls: ['./image-grid-list.component.css']
})
export class ImageGridListComponent implements OnInit {

  @Input()
  images: string[];

  displayImages: string[];

  constructor() { }

  ngOnInit(): void {
    this.displayImages = this.images.slice(0,4);
  }

}
