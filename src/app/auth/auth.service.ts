import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from '../shared/common.service';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = false;
  authStatus = new BehaviorSubject<boolean>(false);

  private allUsers: User[] = [];
  private user: User;
  private lastId: number = 0;

  authTimer: ReturnType<typeof setTimeout>;
  defaultExpirySeconds = 3600;

  constructor(
    private router: Router,
    private commonService: CommonService
  ) { }

  updateAllUsers(userData: User) {
    this.allUsers.push(userData);
    localStorage.setItem("all_users", JSON.stringify(this.allUsers));
  }

  saveUserData(expirationDate: Date) {
    localStorage.setItem("logged_in_user", JSON.stringify(this.user));
    localStorage.setItem("expiration_date", expirationDate.toISOString());
  }

  clearUserData() {
    localStorage.removeItem("logged_in_user");
    localStorage.removeItem("expiration_date");
  }

  setUser(userData: User, mode = 'login') {
    this.user = userData;
  }

  getUser() {
    return this.user;
  }

  generateUserId(): number {
    return ++this.lastId;
  }

  encryptPassword(password: string): string {
    const signature = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',"0","1","2","3","4","5","6","7","8","9"];
    
    let splitPasswordArr = password.split("");
    // const encryptionKey = `${signature.indexOf(splitPasswordArr[0])}.${signature.indexOf(splitPasswordArr[3])}.${signature.indexOf(splitPasswordArr[5])}.${signature.indexOf(splitPasswordArr[7])}`;

    const encryptionKeyArr = [
      {
        a: signature.indexOf(splitPasswordArr[0]),
        b: signature.indexOf(splitPasswordArr[7])
      },
      {
        a: signature.indexOf(splitPasswordArr[3]),
        b: signature.indexOf(splitPasswordArr[5])
      },
      {
        a: signature.indexOf(splitPasswordArr[1]),
        b: signature.indexOf(splitPasswordArr[6])
      },
      {
        a: signature.indexOf(splitPasswordArr[2]),
        b: signature.indexOf(splitPasswordArr[4])
      }
    ];

    encryptionKeyArr.forEach((ele) => {
      if (ele.a === -1) {
        ele.a = 2;
      } 
      if (ele.b === -1) {
        ele.b = 4;
      }

      let char1 = signature[ele.a].toString();
      let char2 = signature[ele.b].toString();
    
      let regex1 = new RegExp(char1,'g');
      let regex2 = new RegExp(char2,'g');
    
      password = password.replace(regex1, "!&").replace(regex2, char1).replace(/!&/g, char2);
    });

    return password;
  }

  checkIfUserExists(email: string): User | null {
    if (this.allUsers.length === 0) {
      let allUsersString = localStorage.getItem('all_users');
      if (allUsersString) this.allUsers = JSON.parse(allUsersString);
      this.lastId = this.allUsers.length;
    }

    for (let i = 0; i < this.allUsers.length; i++) {
      if (this.allUsers[i].email === email) {
        return this.allUsers[i];
      }
    }

    return null;
  }

  setAuthTimer(expiresIn: number) {
    this.authTimer = setTimeout(() => {
      this.logOut();
    }, expiresIn*1000);
  }

  signUp(userData: User): {status: boolean, message: string} {
    let presentUser = this.checkIfUserExists(userData.email);

    if (!presentUser) {
      userData.id = this.generateUserId();
      userData.password = this.encryptPassword(userData.password);

      this.setUser(userData);
      this.updateAllUsers(userData);

      const now = new Date();
      const expirationDate = new Date(now.getTime() + this.defaultExpirySeconds * 1000);
      this.setAuthTimer(this.defaultExpirySeconds);
      this.saveUserData(expirationDate);

      this.isLoggedIn = true;
      this.authStatus.next(true);

      return {
        status: true,
        message: `Welcome to Skribble, ${userData.name}`
      }
    } 

    this.setUser(presentUser);

    return this.logIn(userData, false);
  }

  logIn(userData: User, checkIfPresent=true): {status: boolean, message: string} {
    let currentUser;
    if (!checkIfPresent) {
      currentUser = this.user;
    } else {
      currentUser = this.checkIfUserExists(userData.email);
    }

    if (!currentUser) {
      return {
        status: false,
        message: "You have not signed up! Please sign up"
      }
    }

    let encryptedPassword = this.encryptPassword(userData.password);
    if (encryptedPassword !== currentUser.password) {
      return {
        status: false,
        message: "Please check your email or password"
      }
    }
    
    this.setUser(currentUser);

    const now = new Date();
    const expirationDate = new Date(now.getTime() + this.defaultExpirySeconds * 1000);
    this.setAuthTimer(this.defaultExpirySeconds);
    this.saveUserData(expirationDate);

    this.isLoggedIn = true;
    this.authStatus.next(true);

    return {
      status: true,
      message: `Hi ${this.user.name}, welcome back!`
    }
  }

  logOut() {
    this.user = {
      id: 0,
      name: '',
      email: '',
      imageUrl: '',
      password: ''
    }

    if (this.authTimer) clearTimeout(this.authTimer);
    
    this.clearUserData();
    this.isLoggedIn = false;
    this.authStatus.next(false);

    this.commonService.openSnackbar("You have been logged out");

    this.router.navigate(['/']);
  }

  autoLogin(): boolean {
    const currentUserString = localStorage.getItem("logged_in_user");
    const expirationDateString = localStorage.getItem("expiration_date");
    if (!currentUserString || !expirationDateString) {
      return false;
    }

    const expirationDate = new Date(expirationDateString);
    const now = new Date();
    const timeDiff = expirationDate.getTime() - now.getTime();

    if (timeDiff > 0) {
      this.user = JSON.parse(currentUserString);
      this.isLoggedIn = true;
      this.authStatus.next(true);
      this.setAuthTimer(timeDiff/1000);
      this.router.navigate(['/notes']);
      return true;
    }

    this.clearUserData();
    return false;
  }
}
