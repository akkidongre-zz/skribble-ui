import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {latLng, Map, MapOptions, tileLayer, Marker, icon} from 'leaflet';

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

  @Input()
  height: string;

  map: Map;
  mapOptions: MapOptions;

  constructor() { }

  ngOnInit(): void {
    this.initializeMapOptions();
  }

  private initializeMapOptions() {
    this.mapOptions = {
      center: latLng(+this.latitude, +this.longitude),
      zoom: 12,
      layers: [
        tileLayer (
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 18,
            attribution: 'Map data © OpenStreetMap contributors'
          }
        )
      ]
    };
  }

  onMapReady(map: Map) {
    this.map = map;
    this.addSampleMarker();
  }

  addSampleMarker() {
    const marker = new Marker([+this.latitude, +this.longitude])
      .setIcon(
        icon({
          iconSize: [25, 41],
          iconAnchor: [13, 41],
          iconUrl: 'assets/marker-icon.png'
        }));
    marker.addTo(this.map);
  }

}
