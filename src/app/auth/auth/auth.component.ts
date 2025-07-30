import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdmUser } from 'src/app/model/user';
import { AlertService } from '../../alerts/alert.service';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css'],
    standalone: false
})
export class AuthComponent implements OnInit {

  loginForm!: FormGroup;
  submited: boolean = false;
  loading: boolean = false;

  constructor(private authService: AuthService, private alertService: AlertService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      userName: new FormControl("", [
        Validators.required
      ]),
      password: new FormControl("", [
        Validators.required
      ])
    })
  }

  get userName() {
    return this.loginForm.controls['userName'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }


  async onSubmit() {
    this.submited = true;

    if (!this.loginForm.valid) {
      return;
    }

    this.loading = true;

    let authResult = await this.authService.auth(this.userName.value, this.password.value);

    authResult.subscribe(
      {
        next: (response: any) => {
          let token = response.token;
          localStorage.setItem("token", token);
          let user: AdmUser = this.authService.decodeToken(token);
          this.authService.userSubject.next(user);
          this.loading = false;
          this.router.navigate(['/layout/menu']);
        },
        error: (error) => {
          this.alertService.getFailedAlert();
          this.loading = false;
          console.log(error);
        }
      }
    );

  }

}
