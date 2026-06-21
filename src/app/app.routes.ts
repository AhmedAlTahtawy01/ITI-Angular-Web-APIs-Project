import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { ProductCatalogComponent } from './components/product-catalog/product-catalog.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { DeliveryDashboardComponent } from './components/delivery-dashboard/delivery-dashboard.component';
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
  {
    path: 'products',
    component: ProductCatalogComponent,
    canActivate: [authGuard]
  },
  {
    path: 'products/:categoryId/:productId',
    component: ProductDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    component: OrderHistoryComponent,
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id/confirm',
    component: OrderConfirmationComponent,
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id/track',
    component: OrderTrackingComponent,
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id/detail',
    component: OrderDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'delivery',
    component: DeliveryDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Delivery'] }
  },
  { path: '**', redirectTo: 'login' }
];
