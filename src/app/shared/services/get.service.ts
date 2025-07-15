import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetService {

 get token(): any {
  return JSON.parse(localStorage.getItem('token') || '')
 }

 get cotizacion(): any {
  return JSON.parse(localStorage.getItem('cotizacion') || '')
 }

 get data_person() : any {
  return JSON.parse(localStorage.getItem('data_person') || '')
 }

 get pdf () : any {
  return JSON.parse(localStorage.getItem('pdf') || '')
 }

   get service_details() : string | any {
    return JSON.parse(localStorage.getItem('planService') || '[]')
  }

   get idCard(): string | any {
    return localStorage.getItem('idCard');
  }

  get licence(): string | any {
    return localStorage.getItem('licence');
  }

  get carnet(): string | any {
    return localStorage.getItem('carnet');
  }

 set data_person(value:string) {
  localStorage.setItem('data_person',JSON.stringify(value))
 }

 set cotizacion(value: any) {
  localStorage.setItem('cotizacion',JSON.stringify(value))
 }

 set pdf(value:any) {
  localStorage.setItem('pdf',JSON.stringify(value))
 }

 set token (value:string) {
  localStorage.setItem('token',JSON.stringify(value))
 }

   set idCard(value: any) {
    localStorage.setItem('idCard', value);
  }

  set licence(value: any) {
    localStorage.setItem('licence', value);
  }
  set carnet(value: any) {
    localStorage.setItem('carnet', value);
  }

   set service_details(value: string) {
    localStorage.setItem('planService', JSON.stringify(value))
  }
}
