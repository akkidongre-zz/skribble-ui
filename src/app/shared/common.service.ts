import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private snackbar: MatSnackBar
  ) { }

  openSnackbar(message: string, action="Okay") {
    this.snackbar.open(message, action, {
      duration: 2000
    });
  }
}
