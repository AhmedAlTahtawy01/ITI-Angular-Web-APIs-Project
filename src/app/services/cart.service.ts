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

  getQuantityForProduct(productId: number): number {
    return this.getCartItems().find(item => item.product.id === productId)?.quantity ?? 0;
  }

  addToCart(product: ProductDto, quantity: number = 1): boolean {
    if (product.amount <= 0 || quantity <= 0) {
      return false;
    }

    const current = this.getCartItems();
    const existing = current.find(item => item.product.id === product.id);
    const requestedQuantity = (existing?.quantity ?? 0) + quantity;
    const cappedQuantity = Math.min(product.amount, requestedQuantity);

    if (existing) {
      const previousQuantity = existing.quantity;
      if (previousQuantity === cappedQuantity) {
        return false;
      }
      existing.quantity = cappedQuantity;
      existing.product = product;
      this.saveCart([...current]);
      return cappedQuantity > previousQuantity;
    }

    this.saveCart([...current, { product, quantity: cappedQuantity }]);
    return true;
  }

  updateQuantity(productId: number, quantity: number): void {
    let current = this.getCartItems();
    const item = current.find(i => i.product.id === productId);
    if (item) {
      item.quantity = Math.min(item.product.amount, quantity);
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
