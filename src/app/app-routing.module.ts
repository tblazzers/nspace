import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductivityFormComponent } from './pages/productivity-form/productivity-form.component';
import { SpaceComponent } from './pages/space/space.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectToAuthDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
  { path: "", component: LoginComponent, ...canActivate(redirectToAuthDashboard) },
  { path: "login", component: LoginComponent, ...canActivate(redirectToAuthDashboard) },
  { path: "register", component: RegisterComponent, ...canActivate(redirectToAuthDashboard) },
  { path: "dashboard", component: DashboardComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: "form", component: ProductivityFormComponent },
  { path: "space", component: SpaceComponent, ...canActivate(redirectUnauthorizedToLogin) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
