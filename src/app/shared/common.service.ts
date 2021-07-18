import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  searchQuery = new BehaviorSubject<string>('');

  constructor(
    private snackbar: MatSnackBar
  ) { }

  openSnackbar(message: string, action="Okay") {
    this.snackbar.open(message, action, {
      duration: 2000
    });
  }
}
