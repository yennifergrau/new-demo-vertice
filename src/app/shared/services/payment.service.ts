import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject( HttpClient )
  private readonly baseUrl = environment.vertice.base_url
  private readonly banks = environment.vertice.sypago.banks
  private readonly tase = environment.vertice.sypago.tase
  private readonly otp = environment.vertice.sypago.otp
  private readonly code = environment.vertice.sypago.code
  private readonly notification = environment.vertice.sypago.notifications

    public banks_api( ) {
    return this.http.get<any>(`${this.baseUrl}/${this.banks}`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error)
      })
    )
  }

  public tase_api() {
    return this.http.get<any>(`${this.baseUrl}/${this.tase}`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error)
      })
    )
  }

  public otp_api(next: any) {
    return this.http.post<any>(`${this.baseUrl}/${this.otp}`,next).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error)
      } )
    )
  }

  public code_api (next: any) {
    return this.http.post<any>(`${this.baseUrl}/${this.code}`,next).pipe(
      catchError((error:HttpErrorResponse) => {
        return throwError(() => error)
      })
    )
  }

  public notification_api(next: any) {
    return this.http.post<any>(`${this.baseUrl}/${this.notification}`,next).pipe(
      catchError((error:HttpErrorResponse) => {
        return throwError(() => error)
      })
    )
  }
}
