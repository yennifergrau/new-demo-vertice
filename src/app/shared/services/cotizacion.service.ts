import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { auth_session, plate } from '../interfaces/vertice.interface';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

  private  http = inject(HttpClient)
  private baseUrl = environment.vertice.base_url
  private readonly token = environment.vertice.emission.token
  private readonly verify = environment.vertice.emission.plate
  private readonly cotizar = environment.vertice.emission.cotizacion
  private readonly authorize = environment.vertice.emission.emitir

  public token_api(data:any) {
    return this.http.post<auth_session>(`${this.baseUrl}/${this.token}`,data).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error)
      })
    )
  }

 public verify_api(data: string, token: string) {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post<plate>(`${this.baseUrl}/${this.verify}`, data, { headers }).pipe(
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    })
  );
}


  public cotizacion_api(data:any, token:string){
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.baseUrl}/${this.cotizar}`,data,{headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error)
      })
    )
  }

  public emitir_api(data:any,token:string) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.baseUrl}/${this.authorize}`,data,{headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error)
      })
    )
  }


}
