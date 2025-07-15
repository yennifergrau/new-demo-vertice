import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  template:`
      <div id="preloader">
      <div class="loader">
        <div class="spinner-border text-accent" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>`,
    standalone:true
})
export class LoadingComponent {
}
