import { Component, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ImageComponent } from 'src/app/shared/components/image/image.component';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
     CommonModule,
     FormsModule,
     LoadingComponent,
     ReactiveFormsModule,
     RouterLink,
     ImageComponent,
    ],
    providers:[AuthService]
})
export class AuthPage{

  public showloading: boolean = false;
  public formGroup !: FormGroup;
  public passwordFieldType: string = 'password';
  public passwordIcon: string = 'eye-off';
  public _nav_ = inject( Router )

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2
  ) { 
      this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get emailControl(): AbstractControl<string > {
    return this.formGroup.get('email')!;
  }

  get passwordControl(): AbstractControl<string > {
    return this.formGroup.get('password')!;
  }

  public togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordFieldType === 'password' ? 'eye-off' : 'eye';
  }

  private mostrarToast(mensaje: string, estilo: string) {
    const toastContainer = document.getElementById('auth');
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

  
  public async submit() {
      this.showloading = true;
      if (this.formGroup.valid) {
        const email = this.emailControl.value;
        const password = this.passwordControl.value;
      if (email === 'admin@example.com' && password === '123456') {
        await this.handleSuccessfulLogin({
          email: 'admin@example.com',
          nombre: 'Administrador',
          apellido: 'Sistema',
          telefono: '000-0000000'
        });
        this.showloading = false;
        return;
      }
        
        const registeredUsers = JSON.parse(sessionStorage.getItem('registered_users') || '[]');
        const user = registeredUsers.find((u: any) => 
          u.email === email && u.password === password
        );
        
        if (user) {
          this.mostrarToast('Autenticación exitosa', 'toast-success');
          sessionStorage.setItem('auth-session', JSON.stringify({
            user: {
              email: user.email,
              nombre: user.nombre,
              apellido: user.apellido,
              telefono: user.telefono
            },
            token: 'fake-jwt-token'
          }));
          this._nav_.navigate(['/admin/cotizacion'])
        } else {
          this.mostrarToast('Credenciales incorrectas', 'toast-error');
          this.formGroup.reset();
        }
      } else {
        this.formGroup.markAllAsTouched();
        this.mostrarToast('Completa todos los campos', 'toast-error');
        this.showloading = false
      }
      
      this.showloading = false;
  }

  private async handleSuccessfulLogin(userData: any) {
      this.mostrarToast('Autenticación exitosa', 'toast-success');
      
      sessionStorage.setItem('auth-session', JSON.stringify({
        user: {
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          telefono: userData.telefono
        },
        token: 'fake-jwt-token'
      }));
      
      this._nav_.navigate(['/admin/cotizacion']);
  }
}
