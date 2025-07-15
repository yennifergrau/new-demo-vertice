import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { Router, RouterLink } from '@angular/router';
import { ImageComponent } from 'src/app/shared/components/image/image.component';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    RouterLink,
    ImageComponent
  ]
})
export class RegisterPage implements OnInit {

  public formGroup!: FormGroup;
  public passwordFieldType: string = 'password';
  public passwordIcon: string = 'eye-off'; 
  public showLoading: boolean = false;
  private _nav_ = inject( Router )
  public verificarCorreoControl: FormControl = new FormControl('');
  public correoNoCoincide: boolean = false;
  public correoCoincide: boolean = false
  public isSecondCheckboxChecked = false;
  public isTerminosAccepted: boolean = false; 

  public onTerminosChange() {
    this.isTerminosAccepted = !this.isTerminosAccepted;
  }

    public verificarCoincidencia(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const correoVerificado = inputElement.value; 
    const correoTomador = this.formGroup.get('email')?.value;
    this.correoNoCoincide = correoTomador !== correoVerificado;
    this.correoCoincide = correoTomador === correoVerificado;
  }

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
  ) {

    this.formGroup = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      termsAccepted: [false, Validators.requiredTrue]
    });

   }

  public togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordFieldType === 'password' ? 'eye-off' : 'eye';
  }

  get usernameControl(): AbstractControl<any, any> {
    return this.formGroup.get('username')!;
  }

  get emailControl(): AbstractControl<any, any> {
    return this.formGroup.get('email')!;
  }

  get passwordControl(): AbstractControl<any, any> {
    return this.formGroup.get('password')!;
  }

  get termsAcceptedControl(): AbstractControl<any, any> {
    return this.formGroup.get('termsAccepted')!;
  }

  private mostrarToast(mensaje: string, estilo: string) {
    const toastContainer = document.getElementById('register');
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

    public async Submit() {
    this.showLoading = true;
    
    if (this.formGroup.valid) {
      const userData = {
        username: this.usernameControl.value,
        email: this.emailControl.value,
        password: this.passwordControl.value
      };

      const existingUsers = JSON.parse(sessionStorage.getItem('registered_users') || '[]');
 
      const emailExists = existingUsers.some((user: any) => user.email === userData.email);
      const usernameExists = existingUsers.some((user: any) => user.username === userData.username);
      
      if (emailExists) {
        this.showLoading = false;
        this.mostrarToast('El correo ya está registrado', 'toast-error');
        this.formGroup.reset();
        return;
      }

      if (usernameExists) {
        this.showLoading = false;
        this.mostrarToast('El nombre de usuario ya existe', 'toast-error');
        this.formGroup.reset();
        return;
      }

      if (!this.termsAcceptedControl.value) {
        this,this.showLoading = false;
        this.mostrarToast('Debes aceptar los términos y condiciones', 'toast-error');
        return;
      }
      
      existingUsers.push(userData);
      sessionStorage.setItem('registered_users', JSON.stringify(existingUsers));
      
      this.mostrarToast('Registro exitoso', 'toast-success');
      setTimeout(() => {
        this._nav_.navigate(['/']); 
      }, 2500);
      this.showLoading = false;
    } else {
      if (this.passwordControl.errors?.['minlength']) {
        this.mostrarToast('La contraseña debe tener al menos 6 caracteres', 'toast-error');
      } else {
        this.formGroup.markAllAsTouched();
        this.mostrarToast('Completa todos los campos correctamente', 'toast-error');
        this.showLoading = false
      }
      this.showLoading = false;
    }
  }

  ngOnInit() {
  }

}
