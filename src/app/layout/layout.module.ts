import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../helpers/Auth.Guard';
// import { JwtModule } from '@auth0/angular-jwt';

const routes: Routes = [
  {path: "menu", component: MenuComponent, canActivate: [AuthGuard], data: { permission: "menu"}}
];

@NgModule({
  declarations: [MenuComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class LayoutModule { }
