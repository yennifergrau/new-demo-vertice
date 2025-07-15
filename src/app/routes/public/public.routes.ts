import { Routes } from "@angular/router";
import { AuthPage } from "./pages/auth/auth.page";
import { RegisterPage } from "./pages/register/register.page";


export const PUBLIC_ROUTES : Routes = [

    {
        path:'login',
        component:AuthPage
    },
    {
        path:'register',
        component:RegisterPage
    },
    {
        path:'',
        redirectTo:'login',
        pathMatch:'full'
    },
]