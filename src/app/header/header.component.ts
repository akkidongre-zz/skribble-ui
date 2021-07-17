import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotesService } from '../notes/notes.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  authStatusSub: Subscription;
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private notesService: NotesService
  ) { }

  ngOnInit(): void {
    this.authStatusSub = this.authService.authStatus.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (!loggedIn) {
        this.notesService.clearMyNotes();
      }
    });
  }

  onLogout() {
    this.authService.logOut();
  }

  ngOnDestroy() {
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
  }

}
