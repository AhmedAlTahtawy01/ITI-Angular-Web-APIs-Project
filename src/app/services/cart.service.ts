import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductDto } from '../models/product.model';

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private saveCart(items: CartItem[]): void {
    localStorage.setItem('cart_items', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }

  private loadCart(): void {
    const saved = localStorage.getItem('cart_items');
    if (saved) {
      try {
        this.cartItemsSubject.next(JSON.parse(saved));
      } catch {
        this.cartItemsSubject.next([]);
      }
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addToCart(product: ProductDto, quantity: number = 1): void {
    const current = this.getCartItems();
    const existing = current.find(item => item.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
      this.saveCart([...current]);
    } else {
      this.saveCart([...current, { product, quantity }]);
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    let current = this.getCartItems();
    const item = current.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        current = current.filter(i => i.product.id !== productId);
      }
      this.saveCart([...current]);
    }
  }

  removeFromCart(productId: number): void {
    const current = this.getCartItems();
    this.saveCart(current.filter(item => item.product.id !== productId));
  }

  clearCart(): void {
    this.saveCart([]);
  }

  getCartTotalCount(): number {
    return this.getCartItems().reduce((acc, item) => acc + item.quantity, 0);
  }

  getCartTotalPrice(): number {
    return this.getCartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }
}
