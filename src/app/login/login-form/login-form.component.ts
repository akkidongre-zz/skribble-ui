import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  loginForm: FormGroup;
  
  // To hide or show the password
  hide = true;

  //flag true when user is loggin in
  isSubmitting = false;
  isLoginMode = true;

  // Hide or show social login
  @Output()
  loginMode = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.loginMode.emit(this.isLoginMode);
    this.toggleNameValidator();
  }

  toggleNameValidator() {
    if (!this.isLoginMode) {
      this.loginForm.get('name')?.setValidators([Validators.required]);
    } else {
      this.loginForm.get('name')?.setValidators(null);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    if (this.isLoginMode) {
      this.logIn();
    } else {
      this.signUp();
    }
  }

  logIn() {
    const user: User = {
      id: 0,
      name: '',
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      imageUrl: ''
    }
    const authData = this.authService.logIn(user);

    this.displayStatusAndNavigate(authData);
  }

  signUp() {
    const user: User = {
      id: 0,
      name: this.loginForm.get('name')?.value,
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      imageUrl: ''
    }
    const authData = this.authService.signUp(user);

    this.displayStatusAndNavigate(authData);
  }

  displayStatusAndNavigate(authData: {status: boolean, message: string}) {
    let action = "Yay!"
    if (!status) action = "Okay"
    this.commonService.openSnackbar(authData.message, action);
    this.isSubmitting = false;
    if (authData.status) {
      this.router.navigate(['/notes']);
    }
  }

}
