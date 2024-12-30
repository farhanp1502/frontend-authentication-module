import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/guard/auth.guard';
import { LandingComponent } from './components/landing/landing.component';
import { OtpComponent } from './components/otp/otp.component';
import { SingupResetPassComponent } from './components/singup-reset-pass/singup-reset-pass.component';

const routes: Routes = [
  {
    path: 'mohini',
    redirectTo: '', 
    pathMatch: 'prefix' // Let Nginx or React handle the path
  },
  {
    path: 'create-project',
    redirectTo: '', 
    pathMatch: 'prefix' // Let Nginx or React handle the path
  },
  {path:'login', component: LoginComponent, canActivate:[AuthGuard] },
  {path:'signup', component: SingupResetPassComponent,data: { mode: 'signup' }, canActivate:[AuthGuard] },
  {path:'landing', component: LandingComponent, canActivate:[AuthGuard] },
  {path:'reset-password', component: SingupResetPassComponent,data: { mode: 'reset' } , canActivate:[AuthGuard] },
  {path:'otp', component: OtpComponent, canActivate:[AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class SlRoutingRoutingModule { }