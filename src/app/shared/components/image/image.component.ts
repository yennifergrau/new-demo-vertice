import { Component } from '@angular/core';

@Component({
  selector: 'app-image',
  template:`
  
  <div class="imagen-container-app">
  <img src="../../../../assets/imagenes/vertice2.png" alt="Logo-Arys">
  </div>

  `,
  styles:`
  .imagen-container-app{
    justify-content:center;
    align-items:center;
    text-align:center;
  }
  img{
    width: 260px;
    height: auto;
    padding:10px
  }`,
  standalone:true
})
export class ImageComponent {}
