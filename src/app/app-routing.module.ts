import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';

import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'notes', loadChildren: () => import('./notes/notes.module').then(m => m.NotesModule), canActivate: [AuthGuard] },
  { path: '', pathMatch: 'full', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
