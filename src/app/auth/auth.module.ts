import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth/auth.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from '../helpers/Auth.Guard';



@NgModule({ declarations: [
        AuthComponent
    ], imports: [CommonModule,
        ReactiveFormsModule,
        FormsModule], providers: [AuthGuard, provideHttpClient(withInterceptorsFromDi())] })
export class AuthModule { }
