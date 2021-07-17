import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-social-login',
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.css']
})
export class SocialLoginComponent implements OnInit {

  isSubmitting = false;

  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router,
    private authService: AuthService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    
  }

  loginWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data) => {
      const userData: User = {
        id: 0,
        email: data.email,
        password: data.email,
        name: data.name,
        imageUrl: data.photoUrl
      }

      this.isSubmitting = true;

      const authData = this.authService.signUp(userData);

      this.displayStatusAndNavigate(authData);
      
    }).catch((err) => {
      this.isSubmitting = false;
    });
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
