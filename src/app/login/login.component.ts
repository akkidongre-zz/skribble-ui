import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isLoginMode = true;

  checkingAutoLogin = true;

  deviceWidth = window.screen.width;

  @HostListener("window:resize", ["$event"])
  onResize(event: Event) {
    this.deviceWidth = (event.currentTarget as Window).innerWidth;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/notes']);
      this.checkingAutoLogin = false;
    } else {
      this.checkingAutoLogin = this.authService.autoLogin();
    }
  }

  toggleLoginMode(loginMode: boolean) {
    this.isLoginMode = loginMode;
  }

}
