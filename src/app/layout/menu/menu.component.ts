import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth/auth.service';
import { Permission } from 'src/app/model/permission';
import { AdmUser } from 'src/app/model/user';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
    standalone: false
})
export class MenuComponent implements OnInit {

  permissionsAsMenu!: Array<Permission>;
  user!: AdmUser;
  token: string = "";

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.user = this.authService.userSubject.getValue();

    if (!this.user || !this.user.userName) {
      this.user = this.authService.getUserFromLocalStorage();
    }

    if (this.user) {
      this.permissionsAsMenu = this.user.permissionsData;
    }

    this.getoken();
  }

  getoken() {
    this.token = localStorage.getItem("token") || "";
  }

  getUrl(item: Permission){
    return item.hasRedirectProtection? `${item.url}?token=${this.token}` : item.url;
  }

}
