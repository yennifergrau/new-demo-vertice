import { Component, inject, LOCALE_ID, OnInit, Renderer2 } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import localeEs from '@angular/common/locales/es';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { GetService } from 'src/app/shared/services/get.service';
import { environment } from 'src/environments/environment.prod';
import { forkJoin } from 'rxjs';
import { amount } from 'src/app/shared/interfaces/vertice.interface';
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-formpayment',
  templateUrl: './formpayment.page.html',
  styleUrls: ['./formpayment.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxMaskDirective,
    RouterLink,
    HttpClientModule,
    ReactiveFormsModule,
    LoadingComponent
  ],
  providers:[provideNgxMask(),
    PaymentService,
    GetService,
    {provide:LOCALE_ID, useValue:'es'}
  ]
})
export class FormpaymentPage implements OnInit {

  private _sypagoService_ = inject( PaymentService );
  private _nav_ = inject( Router );
  private _nextService_ = inject( GetService );
  showSpinner: boolean = false;
  banks: any[] = [];
  planDetails: any;
  number!:any
  data: any;
  dollarRate: number = 1;
  isPagoMovil: boolean = true;
    paymentForm = new FormGroup({
    identification: new FormControl('', Validators.required),
    bank_code: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    account_number: new FormControl('', Validators.required),
    document_prefix: new FormControl('V', Validators.required),
  });
  private countBank: string = environment.account;
  private codeBank: string = environment.number_accout;

  constructor(
    private renderer: Renderer2
  ) { }


  get idenifyControl(): AbstractControl<any> {
    return this.paymentForm.get('identification')!;
  }
  get bank_codeControl(): AbstractControl<any> {
    return this.paymentForm.get('bank_code')!;
  }
  get phoneControl(): AbstractControl<any> {
    return this.paymentForm.get('phone')!;
  }
  get account_numberControl(): AbstractControl<any> {
    return this.paymentForm.get('account_number')!;
  }
  get document_prefixControl(): AbstractControl<any> {
    return this.paymentForm.get('document_prefix')!;
  }


  
  SetIsPagoMovil(isPagoMovil: any) {
    this.isPagoMovil = isPagoMovil.value === 'true';
    if (this.isPagoMovil) {
      this.paymentForm.get('account_number')?.disable();
      this.paymentForm.get('phone')?.enable();
    } else {
      this.paymentForm.get('account_number')?.enable();
      this.paymentForm.get('phone')?.disable();
    }
  }


     private mostrarToast(mensaje: string, estilo: string) {
    const toastContainer = document.getElementById('payemnt');
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
    this.planDetails = this._nextService_.cotizacion as amount
    this.showSpinner = true;
    forkJoin({
      banks: this._sypagoService_.banks_api(),
      dollarRate: this._sypagoService_.tase_api(),
    }).subscribe({
      next: (results) => {
        this.banks = results.banks.filter(({ IsDebitOTP }: any) => IsDebitOTP);
        this.dollarRate = results.dollarRate.find(({ code }: any) => {
          return code === 'EUR';
        }).rate;
        this.number = (this.planDetails.primaTotal.dolar * this.dollarRate).toFixed(2)
        this.showSpinner = false;
      },
      error: () => {
        this.mostrarToast(
          'No se pudo recuperar la información del servidor',
          'toast-error'
        );
      },
    });
  }

  public onSubmit() {
    if (this.isPagoMovil) {
      this.paymentForm.get('account_number')?.disable();
    } else {
      this.paymentForm.get('phone')?.disable();
    }
    if (this.paymentForm.valid) {
      const countOption = this.isPagoMovil ? 'CELE' : 'CNTA';
      const paymentData = {
        debitor_document_info: {
          type: this.paymentForm.get('document_prefix')?.value,
          number: this.paymentForm.get('identification')?.value?.toString(),
        },
        debitor_account: {
          bank_code: this.paymentForm.get('bank_code')?.value,
          type: countOption,
          number: this.isPagoMovil
            ? '0' + this.paymentForm.get('phone')?.value
            : this.paymentForm.get('account_number')?.value,
        },
        amount: {
          amt: Number(this.number),
          currency: 'VES',
        },
      };
      this.data = paymentData
      this.showSpinner = true;
          this._sypagoService_.otp_api(paymentData).subscribe({
            next: async (response) => {
              await this.mostrarToast(
                'Código enviado con éxito',
                'toast-success'
              );
              this._nextService_.service_details = this.data;
              this._nav_.navigate(['/admin/code_verify']);
              this.showSpinner = false;
            },
            error: (error) => {
              this.showSpinner = false;
              this.mostrarToast(
                'Hubo un error al realizar el pago. Intente nuevamente.',
                'toast-error'
              );
            },
          });
    } else {
      this.paymentForm.markAllAsTouched();
      this.mostrarToast('Debes llenar los campos', 'toast-error');
      return;
    }
  }

}
