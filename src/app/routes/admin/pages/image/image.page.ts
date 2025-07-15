import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { OcrService } from 'src/app/shared/services/ocr.service';
import { GetService } from 'src/app/shared/services/get.service';
import { environment } from 'src/environments/environment.prod';
import { DetectDocumentTextCommand, TextractClient } from '@aws-sdk/client-textract';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
  standalone: true,
  imports: [
     CommonModule,
     FormsModule,
     RouterLink,
     LoadingComponent,
     HttpClientModule
    ],
    providers:[OcrService,GetService]
})
export class ImagePage  {

    public showLoading: boolean = false;
  public text!: string;
  public imageUrl: string | null = null;
  public isDisabled: boolean = false;
  public messageInformation: boolean = false;
  private textractClient: TextractClient;
  encryptedData: string | null = null;

  private _nav_ = inject( Router );
  private _nextService_ = inject( GetService );
  private _ocrService_ = inject( OcrService );


  constructor(
    private renderer : Renderer2
  ) {
    this.textractClient = new TextractClient({
      region: environment.awsConfig.region,
      credentials: {
        accessKeyId: environment.awsConfig.credentials.accessKeyId,
        secretAccessKey: environment.awsConfig.credentials.secretAccessKey,
      },
    });
   }

  ngAfterViewInit() {
    this.startCamera();
  }

  public async startCamera() {
    const video = document.getElementById('video') as HTMLVideoElement;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    video.setAttribute('playsinline', 'true');

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const rearCameras = devices.filter(
          (device) =>
            device.kind === 'videoinput' &&
            (device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('rear'))
        );

        let rearCamera;
        
        if (rearCameras.length > 0) {
          rearCamera =
            rearCameras.find((camera) =>
              camera.label.toLowerCase().includes('main')
            ) || rearCameras[0];
        }

        const constraints: any = {
          video: {
            facingMode: rearCamera ? { exact: 'environment' } : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play();
        };
      } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        this.mostrarToast(
          ' acepta los permisos para acceder a la cámara',
          'toast-error'
        );
      }
    }
  }

  public async requestCameraPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.error('Error al solicitar permiso de cámara:', err);
    }
  }

  capturePhoto() {
    this.showLoading = true;
    const video = document.getElementById('video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (video && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      setTimeout(() => {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob: any) => {
          if (blob) {
            this.displayImage(blob);
            this.processImage(blob)
              .then(() => {
                this.showLoading = false;
              })
              .catch(() => {
                this.showLoading = false;
              });
          } else {
            this.showLoading = false;
          }
        }, 'image/jpeg');
      }, 200);
    } else {
      this.showLoading = false;
    }
  }

  public   async processImage(file: Blob) {
    const currentScanType = localStorage.getItem('CURRENT_SCAN');
    this.showLoading = true;
    const isValid = await this.validateDocumentType(file, currentScanType);
    if (!isValid) {
      this.showLoading = false;
      this.messageInformation = false;
      this.mostrarToast(' La imagen no coincide', 'toast-error');
      return;
    }
    this._ocrService_
    .imagen_api(file)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.showLoading = false;
          if (error.status === 400) {
            this.showLoading = false;
            this.mostrarToast(' La imagen no es válida', 'toast-error');
            this.clearPreviousData();
            this.capturePhoto();
          } else {
            this.showLoading = false;
            this.mostrarToast(
              ' Ocurrio un error intenta de nuevo',
              'toast-error'
            );
            this.clearPreviousData();
            this.capturePhoto();
          }
          return throwError(error);
        })
      )
      .subscribe((response: any) => {
        this.text = response;
        this.processDocumentText(this.text);
      });
  }

  public async validateDocumentType(
    file: Blob,
    currentScanType: string | null
  ): Promise<boolean> {
    if (!currentScanType) {
      return false;
    }
    const text = await this.performOcr(file);
    if (currentScanType === 'licencia') {
      return /LICENCIA/.test(text) || /Licencia/.test(text);
    } else if (currentScanType === 'cedula') {
      return /VENEZOLANO/.test(text);
    } else if (currentScanType === 'carnet') {
      return /CERTIFICADO/.test(text) || /Certificado/.test(text);
    }
    return false;
  }

  public  async performOcr(file: Blob): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const command = new DetectDocumentTextCommand({
        Document: { Bytes: uint8Array },
      });
      const response = await this.textractClient.send(command);
      const text =
        response.Blocks?.filter((block) => block.BlockType === 'LINE')
          .map((block) => block.Text)
          .join(' ') || '';
      return this.cleanText(text);
    } catch (error) {
      throw new Error(
        'Se produjo un error al procesar la imagen.😰 Por favor, intente nuevamente.'
      );
    }
  }

  cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  processDocumentText(text: any) {
    const currentScanType = localStorage.getItem('CURRENT_SCAN');
    if (currentScanType && text) {
      const jsonString = JSON.stringify(text);
      let isValid = false;
      if (currentScanType === 'licencia') {
        const ocrLicencia = JSON.parse(jsonString);
        isValid = this.validateJsonFields(ocrLicencia);
        if (isValid) {
          localStorage.setItem('OCR_LICENCIA', jsonString);
        }
      } else if (currentScanType === 'carnet') {
        const ocrCarnet = JSON.parse(jsonString);
        isValid = this.validateJsonFields(ocrCarnet);
        if (isValid) {
          localStorage.setItem('OCR_CARNET', jsonString);
        }
      } else if (currentScanType === 'cedula') {
        const ocrCedula = JSON.parse(jsonString);
        isValid = this.validateJsonFields(ocrCedula);
        if (isValid) {
          localStorage.setItem('OCR_CEDULA', jsonString);
        }
      }
      if (isValid) {
        this.mostrarToast('Imagen procesada con éxito', 'toast-success');
        setTimeout(() => {
          setTimeout(() => {
            this._nav_.navigate([`/admin/ocr`]).then(() => {
              window.location.reload();
            });
          }, 3000);
        }, 2500);
      } else {
        this.handleValidationError(currentScanType);
      }
    } else {
      this.handleValidationError(currentScanType);
    }
  }

  validateJsonFields(jsonObject: any): boolean {
    for (const key in jsonObject) {
      if (jsonObject.hasOwnProperty(key) && !jsonObject[key]) {
        return true;
      }
    }
    return true;
  }

  public async handleValidationError(scanType: string | null) {
    await this.mostrarToast(' La imagen no se proceso', 'toast-error');
    if (scanType) {
      switch (scanType) {
        case 'carnet':
          localStorage.removeItem('OCR_CARNET');
          setTimeout(() => {
            window.location.reload();
          }, 2800);
          break;
      }
    }
  }

  clearPreviousData() {
    this.text = '';
  }

   public displayImage(file: Blob) {
    this.messageInformation = true;
    const reader = new FileReader();
    const scanType = localStorage.getItem('CURRENT_ADJUNTO');
    reader.onload = () => {
      this.imageUrl = reader.result as string;
      switch (scanType) {
        case 'carnet':
          this._nextService_.carnet = this.imageUrl;
          break;
        case 'licencia':
          this._nextService_.licence = this.imageUrl;
          break;
        case 'cedula':
          this._nextService_.idCard = this.imageUrl;
          break;
      }
      this.isDisabled = true;
    };
    reader.readAsDataURL(file);
  }

  private mostrarToast(mensaje: string, estilo: string) {
    const toastContainer = document.getElementById('imagen');
    if (!toastContainer) return;

    toastContainer.innerHTML = '';

    const toast = this.renderer.createElement('div');
    this.renderer.addClass(toast, estilo);

    const toastContent = this.renderer.createElement('div');
    this.renderer.addClass(toastContent, 'toast-content');

    const icon = this.renderer.createElement('span');
    this.renderer.addClass(icon, 'toast-icon');

    const errorIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    const successIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
    if (estilo === 'toast-error') {
      this.renderer.setProperty(icon, 'innerHTML', errorIconSVG);
    } else if (estilo === 'toast-success') {
      this.renderer.setProperty(icon, 'innerHTML', successIconSVG);
    }
    const text = this.renderer.createElement('span');
    this.renderer.setProperty(text, 'innerHTML', mensaje);
    this.renderer.appendChild(toastContent, icon);
    this.renderer.appendChild(toastContent, text);
    this.renderer.appendChild(toast, toastContent);
    this.renderer.appendChild(toastContainer, toast);
    setTimeout(() => {
      this.renderer.removeChild(toastContainer, toast);
    }, 5000);
  }

}
