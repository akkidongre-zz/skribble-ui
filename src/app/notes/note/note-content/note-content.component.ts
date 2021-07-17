import { Component, Input, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-content',
  templateUrl: './note-content.component.html',
  styleUrls: ['./note-content.component.css']
})
export class NoteContentComponent implements OnInit {

  @Input()
  note: Note;

  @Output()
  checkboxClick = new EventEmitter<number>();

  noteType: string;
  noteContent: string;

  noteTodo: {todoTitle: string, value: boolean}[] = [];

  googleMapPresent = false;
  googleMapLink: SafeUrl;
  latitude: string;
  longitude: string;

  constructor(
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.noteType = this.note.type;

    if (this.noteType === 'note' && this.note.content) {
      this.noteContent = this.parseUrls(this.note.content);
    } else if (this.noteType === 'todo' && this.note.todo.length > 0) {
      for (let i = 0; i < this.note.todo.length; i++) {
        this.noteTodo.push({
          value: this.note.todo[i].value,
          todoTitle: this.parseUrls(this.note.todo[i].todoTitle)
        });
      }
    }
  }

  parseUrls(text: string) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
  }  

  // splitFunction() {
  //   if (this.noteType === 'note') {
  //     for (let i = 0; i < this.noteContent.length; i++) {
  //       let tempObj = {
  //         text: '',
  //         link: '',
  //         linkName: '',
  //         image: ''
  //       };
  //       if (this.noteContent[i].match(/(((https?:\/\/)|(www\.))[^\s]+)/g)) {
  //         tempObj.link = this.noteContent[i];
  //         // tempObj.linkName = new URL(this.noteContent[i]).host;

  //         // if (this.noteContent[i].includes("www.google.com/maps")){
  //         //   let mapsArr = this.noteContent[i].split("@");
  //         //   let coords = mapsArr[1].split(",");
  //         //   this.latitude = coords[0];
  //         //   this.longitude = coords[1];
  //         //   this.googleMapPresent = true;
  //         //   let mapLink = `https://maps.google.com/maps?q=${this.latitude},${this.longitude}&hl=es;z=14&amp;output=embed`
  //         //   this.googleMapLink = this.domSanitizer.bypassSecurityTrustResourceUrl(mapLink);
  //         // }
  //       } else {
  //         tempObj.text = this.noteContent[i];
  //       }
  //       this.noteContentArr.push(tempObj);
  //     }
  //   }
  // }

  onCheckboxClick(event: Event) {
    event.stopPropagation();
  }

  onCheckboxChange(event: boolean, index: number) {
    this.checkboxClick.emit(index);
  }

}
