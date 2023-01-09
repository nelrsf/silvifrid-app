import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import * as CryptoJS from 'crypto-js';
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { JwtHelperService } from "@auth0/angular-jwt";
import { AuthService } from "../auth/auth/auth.service";



@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthService) { }


    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        let token = localStorage.getItem("token");
        if (token === null) {
            this.router.navigate(['/pages/unauthorized'])
            return false;
        }




        if (this.authService.isTokenExpired(token)) {
            this.router.navigate(['/']);
            return false;
        }

        if (!this.authService.verifyToken(token)) {
            this.router.navigate(['/pages/unauthorized']);
            return false;
        }

        let permisssion = route.data['permission'];
        let user = this.authService.decodeToken(token);
        let userPermissions = user.permissions;

        if (!userPermissions?.includes(permisssion)) {
            this.router.navigate(['/pages/unauthorized']);
            return false;
        }

        return true;
    }




}