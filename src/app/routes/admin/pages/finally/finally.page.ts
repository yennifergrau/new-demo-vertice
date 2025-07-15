import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { ImageComponent } from 'src/app/shared/components/image/image.component';
import { GetService } from 'src/app/shared/services/get.service';
import { amount, data_person } from 'src/app/shared/interfaces/vertice.interface';

@Component({
  selector: 'app-finally',
  templateUrl: './finally.page.html',
  styleUrls: ['./finally.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ImageComponent
  ],
  providers:[GetService]
})
export class FinallyPage implements OnInit {

  public  isModalOpen : boolean = false;
  private urlDocumentObtenido : string | any;

  amount!: amount
  data_person !: data_person
  data_pdf !: any 
  private _getService_ = inject( GetService )

  constructor(
    private renderer: Renderer2
  ) { }

     openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

    private mostrarToast(mensaje: string, estilo: string) {
    const toastContainer = document.getElementById('finally');
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


    public downloadPolicy(): void {
    this.mostrarToast('Póliza descargada con exito','toast-success')
    if (this.urlDocumentObtenido ) {
      setTimeout(() => {
        window.open(this.urlDocumentObtenido, '_blank');
      },3000)
    } else {
      console.error('No hay documento disponible');
    }
  }

  public shareByWhatsapp(): void {
      const message = `Hola, te comparto el documento de la póliza: ${this.urlDocumentObtenido}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`whatsapp://send?text=${encodedMessage}`, '_blank');
  }

  public shareByEmail(): void {
      const subject = 'Poliza Document';
      const body = `Puedes ver el documento de la póliza en el siguiente enlace: ${this.urlDocumentObtenido}`;
      window.location.href = `mailto:${this.urlDocumentObtenido}?subject=${subject}&body=${body}`;
    }

  ngOnInit() {
    this.amount = this._getService_.cotizacion as amount
    this.data_person = this._getService_.data_person as data_person
    this.data_pdf = this._getService_.pdf
    this.urlDocumentObtenido = this.data_pdf.url_pdf
  }

}
