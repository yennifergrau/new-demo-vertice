import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

 private http = inject( HttpClient );
 private readonly baseUrlI = environment.ocr_omagen;
 private readonly baseUrlD = environment.ocr_upload;
 private readonly imagenProccess = environment.otp.imagen;
 private readonly documentProccess = environment.otp.upload;


 public imagen_api ( image:Blob ) {
  const formData = new FormData();
  formData.append('file',image,'image.jpeg');
  return this.http.post<{text:string}>(`${this.baseUrlI}/${this.imagenProccess}`,formData).pipe(
    catchError((error: HttpErrorResponse) => {
      return throwError(error)
    })
  )
 }

  public document_api ( image:Blob ) {
  const formData = new FormData();
  formData.append('file',image,'image.jpeg');
  return this.http.post<{text:string}>(`${this.baseUrlD}/${this.documentProccess}`,formData).pipe(
    catchError((error: HttpErrorResponse) => {
      return throwError(error)
    })
  )
 }

}
