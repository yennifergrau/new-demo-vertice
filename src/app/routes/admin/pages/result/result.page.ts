import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera } from '@capacitor/camera';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { GetService } from 'src/app/shared/services/get.service';
import { amount, data_person } from 'src/app/shared/interfaces/vertice.interface';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HttpClientModule
  ],
  providers:[GetService]
})
export class ResultPage implements OnInit {

  private readonly _getService_ = inject( GetService );
  public data_amount !: amount
  public data_person !: data_person

  constructor() { }

  ngOnInit() {
    this.data_amount = this._getService_.cotizacion as amount
    this.data_person = this._getService_.data_person as data_person
    this.requestCameraPermissions()
  }

     async requestCameraPermissions() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (error) {
        return false;
      }
    } else if (window.Capacitor) {
      try {
        const result = await Camera.requestPermissions();
        if (result.camera === 'granted') {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }

}
