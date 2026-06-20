import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'user-profile',
    component: UserProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'wishlist',
    component: WishlistComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
