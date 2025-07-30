import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth/auth.component';
import { NotFoundComponent } from './pages/miscelaneous/not-found/not-found.component';


const routes: Routes = [
  {path: "", component: AuthComponent},
  // {path: "**", component: NotFoundComponent},
  {path: "layout", loadChildren: ()=>import('./layout/layout.module').then(m=>m.LayoutModule)},
  {path: "pages", loadChildren: ()=> import('./pages/pages.module').then(m=>m.PagesModule)},
  {path: "products", loadChildren: ()=> import('./products/products.module').then(m=>m.ProductsModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
