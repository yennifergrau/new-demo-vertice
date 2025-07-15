import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageComponent } from 'src/app/shared/components/image/image.component';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { environment } from 'src/environments/environment.prod';
import { GetService } from 'src/app/shared/services/get.service';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { CotizacionService } from 'src/app/shared/services/cotizacion.service';
import { amount } from 'src/app/shared/interfaces/vertice.interface';

@Component({
  selector: 'app-codepayment',
  templateUrl: './codepayment.page.html',
  styleUrls: ['./codepayment.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageComponent,
    RouterLink,
    HttpClientModule,
    LoadingComponent,
    ReactiveFormsModule
  ],
  providers:[GetService,PaymentService,CotizacionService]
})
export class CodepaymentPage implements OnInit {


  public otp: string[] = [];
  public otpLength: number = 6;
  public showLoading: boolean = false;
  private idTransaction!: string;
  private paymentData !:  any;
  private planPayment !: string;
  numberContact!: string;
  private order_id !: amount
  private token !: string

  private _nav_ = inject( Router )
  private _emissionService_ = inject( CotizacionService )
  private _nextService_ = inject( GetService)
  private _paymentService_ = inject( PaymentService)

  constructor(
     private renderer: Renderer2
  ) { }

   public setOtpLength(length: number, event?: Event) {
    if (event) {event.stopPropagation();}
    this.otpLength = length;
    this.otp = Array(length).fill('');
  }

    public moveFocus(event: any, nextInputId: string) {
    const currentInput = event.target as HTMLInputElement;
    const value = currentInput.value;
    if (value.length === 1) {
      const nextInput = document.querySelector(`#${nextInputId}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

   public handleBackspace(event: any, currentInputId: string) {
    const currentInput = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && currentInput.value.length === 0) {
      const currentIndex = parseInt(currentInputId.replace('otp', ''), 10) - 1;
      if (currentIndex > 0) {
        const prevInputId = 'otp' + currentIndex;
        const prevInput = document.querySelector(`#${prevInputId}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          this.otp[currentIndex - 1] = '';
        }
      }
    }
  }


  private getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

    public clearOtp() {
    this.otp = Array(this.otpLength).fill('');
  }

  public isOtpComplete(): boolean {
    return this.otp.length === this.otpLength && this.otp.every(value => value !== '');
  }


    private withTimeout(promise: Promise<any>, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout excedido')), timeout);
      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
    private mostrarToast(mensaje: string, estilo: string) {
    const toastContainer = document.getElementById('otp');
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

  ngOnInit() {
    this.setOtpLength(8);
    this.numberContact = this._nextService_.service_details.debitor_account.number
    this.paymentData = this._nextService_.service_details
    this.order_id = this._nextService_.cotizacion as amount
    this.token = this._nextService_.token.access_token
  }

  private generate_cotizacion() {
    const data : any = {
      order_id: this.order_id.order_id,
      transaction_id: this.idTransaction
    }
    this._emissionService_.emitir_api(data,this.token).subscribe({
      next:(result) => {
        this._nextService_.pdf = result
        this.mostrarToast('Pago realizado con éxito','toast-success')
        this._nav_.navigate(['/admin/finally'])
      },error:(error) => {
        this.mostrarToast(`${error.message}`,'toast-error')
        this.showLoading = false
      }
    })
  }

private async getNotificationPayment() {
  const id = { id_transaction: this.idTransaction };
  const interval = setInterval(() => {
    this._paymentService_.notification_api(id).subscribe({
      next: async (result: any) => {
        try {
          const status = result?.status;

          if (!status) {
            this.handleError('Estado no definido en la respuesta');
            return;
          }

          switch (status) {
            case 'ACCP':
              try {
              await this.generate_cotizacion();
              console.log('llamando a cotiazion');
              
              } catch (error) {
                console.error('Error generando cotización:', error);
              }
              break;

            case 'RJCT':
              this.mostrarToast('La operación fue rechazada', 'toast-error');
              this.showLoading = false;
              break;

            case 'PEND':
            case 'PROC':
              this.mostrarToast('Estado de la operación en proceso','toast-error')
              this.showLoading = false;
              break;

            default:
              this.handleError('Estado desconocido');
              return;
          }

          clearInterval(interval);
        } catch (error) {
          console.error('Error en notificación de pago:', error);
          this.handleError('Error procesando la respuesta');
          clearInterval(interval);
        }
      },
      error: (error) => {
        console.error('Error en la petición de notificación:', error);
        this.handleError('Error de conexión');
        clearInterval(interval);
      }
    });
  }, 10000);
}

private handleError(message: string) {
  this.mostrarToast(message, 'toast-error');
  this.showLoading = false;
}

  onSubmit() {
    this.showLoading = true;
    const otpCode = this.otp.join('').trim();
      if(otpCode.length  !== this.otpLength){
        alert(`El código OTP debe tener exactamente ${this.otpLength} dígitos.`);
        this.showLoading = false;
        return;
      }
      const data = {
        "internal_id": '1234567890',
        "group_id": '9876543210',
        "amount": {
          "amt": this.paymentData.amount.amt,
          "currency": "VES"
        },
        "concept": "Cobro de Poliza",
        "notification_urls": {
          "web_hook_endpoint": 'https://sypagoMundial.polizaqui.com/getNotifications'
        },
        "receiving_user": {
          "otp": otpCode,
          "document_info": {
            "type": this.paymentData.debitor_document_info.type,
            "number": this.paymentData.debitor_document_info.number
          },
          "account": {
            "bank_code": this.paymentData.debitor_account.bank_code,
            "type": this.paymentData.debitor_account.type,
            "number": this.paymentData.debitor_account.number
          },
          "order_id":this.order_id.order_id
      }
    }
    try{
      this._paymentService_.code_api(data).subscribe({
        next:(result:any) => {
          this.idTransaction = result.transaction_id;
          this.getNotificationPayment()
        },
        error:(error) => {
      this.mostrarToast(' Hubo un error al procesar el OTP','toast-error');
      this.showLoading = false
        }
      })
    }catch(error){
      this.mostrarToast(' Hubo un error al procesar el OTP','toast-error');
      this.showLoading = false
    }
  }

}
