import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AdmUser } from 'src/app/model/user';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public userSubject = new BehaviorSubject<AdmUser>(new AdmUser());

  private jwtHelperService = new JwtHelperService();

  constructor(private httpClient: HttpClient) { }

  async auth(userName: string, password: string) {

    let token = this.encryptCredentials(userName, password).toString();
    return this.httpClient.post(environment.api_url + '/auth', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

  }

  encryptCredentials(userName: string, password: string) {
    let payload = JSON.stringify({
      userName: userName,
      password: password
    });

    const encryptedData = CryptoJS.AES.encrypt(payload, environment.secret);
    return encryptedData;

  }


  verifyToken(jwt: string): boolean {
    let [header, payload, signature] = jwt.split(".");
    let signInput = `${header}.${payload}`;
    const hmac = CryptoJS.HmacSHA256(signInput, environment.secret);
    const computedSignature = CryptoJS.enc.Base64url.stringify(hmac);
    return computedSignature === signature;
  }

  isTokenExpired(token: string) {
    return this.jwtHelperService.isTokenExpired(token);
  }

  decodeToken(token: string) {
    return this.jwtHelperService.decodeToken(token);
  }

  getUserFromLocalStorage(){
    let token = localStorage.getItem("token");

    if(token){
      if(!this.verifyToken(token)){
        return;
      }
      return this.decodeToken(token);  
    } 
  }

}
