import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductViewComponent } from './components/product-view/product-view.component';
import { AuthGuard } from '../helpers/Auth.Guard';

const routes: Routes = [
  {
    path: 'list',
    component: ProductListComponent,
    canActivate: [AuthGuard],
    data: { permission: 'products' }
  },
  {
    path: 'create',
    component: ProductFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'products' }
  },
  {
    path: 'edit/:id',
    component: ProductFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'products' }
  },
  {
    path: 'view/:id',
    component: ProductViewComponent,
    canActivate: [AuthGuard],
    data: { permission: 'products' }
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    ProductListComponent,
    ProductFormComponent,
    ProductViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ProductsModule { }