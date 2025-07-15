import { Routes } from '@angular/router';
import { PublicPage } from './routes/public/public.page';
import { PUBLIC_ROUTES } from './routes/public/public.routes';
import { AdminPage } from './routes/admin/admin.page';
import { ADMIN_ROUTES } from './routes/admin/admin.routes';
import { UiComponent } from './shared/ui/ui.component';

export const routes: Routes = [

  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path:'',
     children:PUBLIC_ROUTES,
    component:PublicPage
   
  },
  {
    path:'admin',
    children:ADMIN_ROUTES,
    component:AdminPage,

  },
  {
    path:'**',
    component:UiComponent
  }
];
