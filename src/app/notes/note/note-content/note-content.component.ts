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
      return '<a href="' + url + '" target="_blank" class="url-link">' + url + '</a>';
    });
  }

  onCheckboxClick(event: Event) {
    event.stopPropagation();
  }

  onCheckboxChange(event: boolean, index: number) {
    this.checkboxClick.emit(index);
  }

}
