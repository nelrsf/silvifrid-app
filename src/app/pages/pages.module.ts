import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnauthorizedComponent } from './miscelaneous/unauthorized/unauthorized.component';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './miscelaneous/not-found/not-found.component';

const routes: Routes = [
  {path: "unauthorized", component: UnauthorizedComponent}
];

@NgModule({
  declarations: [UnauthorizedComponent, NotFoundComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ],
  exports: [RouterModule]
})
export class PagesModule { }
