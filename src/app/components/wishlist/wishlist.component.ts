import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class WishlistComponent {
  wishlistItems = [
    { id: 1, name: 'Product 1', price: 100, imageUrl: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Product 2', price: 200, imageUrl: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Product 3', price: 300, imageUrl: 'https://via.placeholder.com/150' }
  ];

  removeFromWishlist(itemId: number) {
    this.wishlistItems = this.wishlistItems.filter(item => item.id !== itemId);
  }
}
