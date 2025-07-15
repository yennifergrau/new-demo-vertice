import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { CotizacionService } from 'src/app/shared/services/cotizacion.service';
import { GetService } from 'src/app/shared/services/get.service';
import {NgxMaskDirective,provideNgxMask} from 'ngx-mask'
import { Router } from '@angular/router';

@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.page.html',
  styleUrls: ['./cotizacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    LoadingComponent,
    NgxMaskDirective
    ],
    providers:[CotizacionService, GetService, provideNgxMask()]
})
export class CotizacionPage implements OnInit {
  public showLoading: boolean = false; 
  private fb = inject( FormBuilder );
  public formGroup!: FormGroup;
  public isTomador: boolean = false;
  private _cotizacionService_ = inject(CotizacionService)
  private _getService_ = inject(GetService)
  private token_access !: string
  private _nav_ = inject( Router )

  constructor(
    private renderer : Renderer2
  ) {
    this.initializeForm();
    this.generateToken()
  }

  private generateToken() {
    const data: any = {
      username: 'admin',
      password:'admin1234'
    }
    this._cotizacionService_.token_api(data).subscribe({
      next:(result:any) => {  
        this._getService_.token = result
        this.token_access = result.access_token
      },error:(error)=> {
        this.mostrarToast(`${error}`,'toast-error')
      }
    })
  }

  initializeForm() {
    this.formGroup = this.fb.group({
      isTomador: new FormControl(false),
      generalData: this.fb.group({
        policy_holder_type_document: ['', Validators.required],
        policy_holder_document_number: ['', Validators.required],
        policy_holder_phone: ['', Validators.required],
        policy_holder_email: ['', Validators.required],
        policy_holder: ['', Validators.required],
        policy_holder_address: ['', Validators.required],
        policy_holder_state: ['', Validators.required],
        policy_holder_city: ['', Validators.required],
        policy_holder_municipality: ['', Validators.required],
        isseur_store: ['COBRETAG']
      }),
      carData: this.fb.group({
        type_plate: ['', Validators.required],
        plate: ['', Validators.required],
        brand: ['', Validators.required],
        model: ['', Validators.required],
        version: ['', Validators.required],
        year: ['', Validators.required],
        color: ['', Validators.required],
        gearbox: ['', Validators.required],
        carroceria_serial_number: ['', Validators.required],
        motor_serial_number: ['', Validators.required],
        type_vehiculo: ['', Validators.required],
        use: ['', Validators.required],
        passenger_qty: ['', Validators.required],
        driver: [''],
        use_grua: [false]
      }),
      generalDataTomador: this.fb.group({
        type_document: [''],
        insured_document: [''],
        insured_phone: [''],
        insured_email: [''],
        insured: [''],
        insured_address: [''],
        insured_state: [''],
        insured_city: [''],
        insured_municipality: [''],
        isseur_store: ['COBRETAG']
      })
    });
    this.formGroup.get('isTomador')?.valueChanges.subscribe((value) => {
      this.isTomador = value;
      if (value) {
        this.copyTomadorToTitular();
      } else {
        this.clearTitularData();
      }
    });

    this.formGroup.get('generalData')?.valueChanges.subscribe(() => {
      if (this.isTomador) {
        this.copyTomadorToTitular();
      }
    });
  }

  copyTomadorToTitular() {
    const generalData = this.formGroup.get('generalData')?.value;
    const titularGroup = this.formGroup.get('generalDataTomador') as FormGroup;
    
    titularGroup.patchValue({
      type_document: generalData.policy_holder_type_document,
      insured_document: generalData.policy_holder_document_number,
      insured_phone: generalData.policy_holder_phone,
      insured_email: generalData.policy_holder_email,
      insured: generalData.policy_holder,
      insured_address: generalData.policy_holder_address,
      insured_state: generalData.policy_holder_state,
      insured_city: generalData.policy_holder_city,
      insured_municipality: generalData.policy_holder_municipality,
      isseur_store: generalData.isseur_store
    });
  }

  clearTitularData() {
    const titularGroup = this.formGroup.get('generalDataTomador') as FormGroup;
    titularGroup.reset();
  }

  onSubmit() {
  this.showLoading = true;
  
  if(this.formGroup.valid) {
    const formData = this.formGroup.value;
    let payload: any;
    
    if (formData.isTomador) {
      payload = {
        data: {
          isTomador: true,
          generalData: formData.generalData,
          carData: formData.carData
        }
      };
    } else {
      payload = {
        data: {
          isTomador: false,
          generalData: formData.generalData,
          carData: formData.carData,
          generalDataTomador: formData.generalDataTomador
        }
      };
    }
    const dataVerify : any = {
      plate: formData.carData.plate
    };
    
    this._cotizacionService_.verify_api(dataVerify, this.token_access).subscribe({
      next: (result: any) => {
        if(result.message === 'El Vehículo no tiene póliza') {
          this._cotizacionService_.cotizacion_api(payload, this.token_access).subscribe({
            next: (result) => {
              const payload: any = {
                name:this.formGroup.get('generalData.policy_holder')?.value,
                type_plate:this.formGroup.get('carData.type_plate')?.value,
                anio:this.formGroup.get('carData.year')?.value,
                brand_model: this.formGroup.get('carData.brand')?.value + ' ' + this.formGroup.get('carData.model')?.value,
                type_car: this.formGroup.get('carData.type_vehiculo')?.value,
                plate: this.formGroup.get('carData.plate')?.value
              }
              this._getService_.data_person = payload
              this._getService_.cotizacion = result;
              this.mostrarToast('Cotización creada con éxito', 'toast-success');
              this._nav_.navigate(['/admin/result']);
            },
            error: (error) => {
              this.mostrarToast(error.message, 'toast-error');
              this.showLoading = false;
            }
          });
        } else {
          this.mostrarToast('El vehiculo ya tiene una Póliza registrada', 'toast-error');
          this.showLoading = false;
        }
      },
      error: (error) => {
        this.mostrarToast(error.message, 'toast-error');
        this.showLoading = false;
      }
    });
  } else {
    this.showLoading = false;
    this.mostrarToast('Completa todos los campos requeridos', 'toast-error');
    this.markAllAsTouched();
  }
}

  private mostrarToast(mensaje: string, estilo: string) {
    const toastContainer = document.getElementById('cotizacion');
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
    }, 6000);
  }

  markAllAsTouched() {
    Object.values(this.formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach(subControl => {
          subControl.markAsTouched();
        });
      } else {
        control.markAsTouched();
      }
    });
  }

  ngOnInit(): void {
    this.isTomador = this.formGroup.get('isTomador')?.value;
  }
}