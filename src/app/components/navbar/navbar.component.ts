import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class NavbarComponent implements OnInit, OnDestroy {
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);

  cartCount = 0;
  isLoggedIn = false;
  userRole = '';
  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.cartService.cartItems$.subscribe(() => {
        this.cartCount = this.cartService.getCartTotalCount();
      })
    );
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userRole = this.authService.getUserRole() || '';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  checkLoginStatus(): boolean {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userRole = this.authService.getUserRole() || '';
    return this.isLoggedIn;
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}
