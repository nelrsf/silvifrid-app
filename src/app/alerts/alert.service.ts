import { Injectable } from '@angular/core';
import Swal  from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  getFailedAlert(){
    return Swal.fire({
      title: 'Error!',
      text: 'Error en inicio de sesión',
      icon: 'error',
      confirmButtonText: 'Ok',
      confirmButtonColor: 'red'  
    })
  }
}
