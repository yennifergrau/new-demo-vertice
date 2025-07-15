import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.page.html',
  styleUrls: ['./ocr.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class OcrPage implements OnInit {

 
  public isLicenseScanned: boolean = false;
  public isRegistrationScanned: boolean = false;
  public isInsuranceScanned: boolean = false;
  public isSubmitDisabled: boolean = true;
  public isAllScanned: boolean = false;
  private _nav_ = inject( Router );

  private checkScannedStatus() {
    this.isLicenseScanned = !!localStorage.getItem('OCR_LICENCIA');
    this.isRegistrationScanned = !!localStorage.getItem('OCR_CARNET');
    this.isInsuranceScanned = !!localStorage.getItem('OCR_CEDULA');
    this.isAllScanned = this.isLicenseScanned && this.isInsuranceScanned;
    this.updateSubmitButtonStatus();
  }

  private updateSubmitButtonStatus() {
    this.isSubmitDisabled = !this.isAllScanned;
  }

  public scanDocument(documentType: string) {
    localStorage.setItem('CURRENT_SCAN', documentType);
    switch (documentType) {
      case 'licencia':
        this.isLicenseScanned = true;
        break;
      case 'carnet':
        this.isRegistrationScanned = true;
        break;
      case 'cedula':
        this.isInsuranceScanned = true;
        break;
    }
    this.checkScannedStatus();
    return this._nav_.navigate([`/admin/scan`]);
  }

  public scanAdjuntar(documentType: string) {
    localStorage.setItem('CURRENT_ADJUNTO', documentType);

    switch (documentType) {
      case 'licencia':
        this.isLicenseScanned = true;
        break;
      case 'carnet':
        this.isRegistrationScanned = true;
        break;
      case 'cedula':
        this.isInsuranceScanned = true;
        break;
    }

    this.checkScannedStatus();
    this._nav_.navigate([`/admin/upload`]);
  }

  ngOnInit() {
     this.checkScannedStatus();
  }

}
