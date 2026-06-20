import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CategoryDto, ProductDto } from '../../models/product.model';

@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductCatalogComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);

  categories: CategoryDto[] = [];
  products: ProductDto[] = [];
  selectedCategoryId: number | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (data.length > 0) {
          this.selectCategory(data[0].id);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load categories.';
        this.isLoading = false;
      }
    });
  }

  selectCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts(categoryId).subscribe({
      next: (data) => {
        // filter accepted products only or show them all
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products for this category.';
        this.isLoading = false;
      }
    });
  }

  addToCart(product: ProductDto): void {
    this.cartService.addToCart(product);
  }
}
