import { Routes } from "@angular/router";
import { CotizacionPage } from "./pages/cotizacion/cotizacion.page";
import { ResultPage } from "./pages/result/result.page";
import { OcrPage } from "./pages/ocr/ocr.page";
import { UploadPage } from "./pages/upload/upload.page";
import { ImagePage } from "./pages/image/image.page";
import { FormpaymentPage } from "./pages/formpayment/formpayment.page";
import { CodepaymentPage } from "./pages/codepayment/codepayment.page";
import { FinallyPage } from "./pages/finally/finally.page";


export const ADMIN_ROUTES : Routes = [
  
    {
        path:'',
        redirectTo:'cotizacion',
        pathMatch:'full'
    },
    {
        path:'cotizacion',
        component:CotizacionPage
    },
    {
        path:'result',
        component:ResultPage
    },
    {
        path:'ocr',
        component:OcrPage
    },
    {
        path:'upload',
        component:UploadPage
    },
    {
        path:'scan',
        component:ImagePage
    },
    {
        path:'sypago',
        component:FormpaymentPage
    },
    {
        path:'code_verify',
        component:CodepaymentPage
    },
    {
        path:'finally',
        component:FinallyPage
    }
]