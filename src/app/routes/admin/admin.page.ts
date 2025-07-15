import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonRouterOutlet} from '@ionic/angular/standalone'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  standalone: true,
  imports: [ CommonModule, FormsModule,IonRouterOutlet]
})
export class AdminPage{

}
