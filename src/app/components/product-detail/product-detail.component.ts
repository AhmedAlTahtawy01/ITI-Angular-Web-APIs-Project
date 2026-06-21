import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ProductDto } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  categoryId!: number;
  productId!: number;
  product: ProductDto | null = null;
  categoryName: string = '';
  isLoading = true;
  errorMessage = '';
  quantity = 1;

  cartToastMessage = '';
  cartToastVisible = false;
  private cartToastTimer: any;

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    const productId = Number(this.route.snapshot.paramMap.get('productId'));

    if (Number.isInteger(categoryId) && categoryId > 0 && Number.isInteger(productId) && productId > 0) {
      this.categoryId = categoryId;
      this.productId = productId;
      this.loadProductDetails();
    } else {
      this.errorMessage = 'Invalid URL parameters.';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.cartToastTimer) clearTimeout(this.cartToastTimer);
  }

  get availableStock(): number {
    if (!this.product) return 0;
    return Math.max(this.product.amount - this.cartService.getQuantityForProduct(this.product.id), 0);
  }

  loadProductDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getCategoryById(this.categoryId).subscribe({
      next: (cat) => {
        this.categoryName = cat.name;
      },
      error: () => {
        this.categoryName = 'Category';
      }
    });

    this.productService.getProductById(this.categoryId, this.productId).subscribe({
      next: (prod) => {
        this.product = prod;
        this.quantity = this.availableStock > 0 ? 1 : 0;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load product details. Make sure the API is active.';
        this.isLoading = false;
      }
    });
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.availableStock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    const quantityToAdd = Math.min(this.quantity, this.availableStock);
    if (quantityToAdd <= 0) {
      this.showCartToast(`"${this.product.name}" is already at the stock limit.`);
      return;
    }

    const added = this.cartService.addToCart(this.product, quantityToAdd);
    if (added) {
      this.showCartToast(`Added ${quantityToAdd}x "${this.product.name}" to cart.`);
      this.quantity = this.availableStock > 0 ? Math.min(this.quantity, this.availableStock) : 0;
    }
  }

  private showCartToast(message: string): void {
    if (this.cartToastTimer) clearTimeout(this.cartToastTimer);
    this.cartToastMessage = message;
    this.cartToastVisible = true;
    this.cartToastTimer = setTimeout(() => {
      this.cartToastVisible = false;
    }, 2200);
  }

  goBack(): void {
    this.router.navigate(['/products'], { queryParams: { categoryId: this.categoryId } });
  }
}
