import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { OrderForCreationDto } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  totalPrice = 0;
  isSubmitting = false;
  errorMessage = '';

  private sub = new Subscription();

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      address: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.sub.add(
      this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
        this.totalPrice = this.cartService.getCartTotalPrice();
      })
    );

    this.loadUserAddress();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadUserAddress(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          if (user && user.adress) {
            this.checkoutForm.patchValue({ address: user.adress });
          }
        },
        error: () => {
          // Silent fallback, user can still enter address manually
        }
      });
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  submitOrder(): void {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const orderPayload: OrderForCreationDto = {
      adress: this.checkoutForm.value.address,
      orderDetails: this.cartItems.map(item => ({
        productId: item.product.id,
        cateogryId: item.product.cateogryId,
        amount: item.quantity
      }))
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (createdOrder) => {
        this.cartService.clearCart();
        this.isSubmitting = false;
        // Redirect to order confirmation page
        this.router.navigate(['/orders', createdOrder.id, 'confirm'], {
          state: { order: createdOrder }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || err.error || 'Failed to place the order. Please ensure stock is sufficient.';
      }
    });
  }

  get address() {
    return this.checkoutForm.get('address');
  }
}
