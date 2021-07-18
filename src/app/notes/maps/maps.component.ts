import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

declare var H: any;  

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit { 

  @Input() 
  latitude: string;

  @Input()
  longitude: string;

  constructor() { }

  ngOnInit(): void {
    

  }

}
