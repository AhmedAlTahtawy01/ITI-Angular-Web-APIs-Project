import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CategoryDto, ProductDto, PaginationMetaData, ProductParams } from '../../models/product.model';

@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProductCatalogComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categories: CategoryDto[] = [];
  products: ProductDto[] = [];
  selectedCategoryId: number | null = null;
  isLoading = false;
  isCategoriesLoading = true;
  errorMessage = '';

  // Filter & Pagination state
  searchQuery = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  orderBy = '';
  pageNumber = 1;
  pageSize = 9;

  pagination: PaginationMetaData = {
    currentPage: 1,
    totalPages: 1,
    pageSize: 9,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false
  };

  viewMode: 'grid' | 'list' = 'grid';

  // Cart toast
  cartToastMessage = '';
  cartToastVisible = false;
  private cartToastTimer: any;

  // Debouncing
  private searchSubject = new Subject<string>();
  private priceSubject = new Subject<void>();
  private searchSubscription?: Subscription;
  private priceSubscription?: Subscription;

  ngOnInit(): void {
    this.loadCategories();

    // Debounced search — 450ms delay
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(450),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.pageNumber = 1;
      this.loadProducts();
    });

    // Debounced price filter — 600ms delay so user can finish typing
    this.priceSubscription = this.priceSubject.pipe(
      debounceTime(600)
    ).subscribe(() => {
      this.pageNumber = 1;
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.priceSubscription?.unsubscribe();
    if (this.cartToastTimer) clearTimeout(this.cartToastTimer);
  }

  loadCategories(): void {
    this.isCategoriesLoading = true;
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isCategoriesLoading = false;
        if (data.length > 0) {
          const categoryId = Number(this.route.snapshot.queryParamMap.get('categoryId'));
          const initialCategory = data.some(cat => cat.id === categoryId) ? categoryId : data[0].id;
          this.selectCategory(initialCategory);
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load categories. Make sure the API server is running on localhost:44395.';
        this.isCategoriesLoading = false;
      }
    });
  }

  selectCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.pageNumber = 1;
    this.loadProducts();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPriceChange(): void {
    this.priceSubject.next();
  }

  applySort(): void {
    this.pageNumber = 1;
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.orderBy = '';
    this.pageNumber = 1;
    this.loadProducts();
  }

  loadProducts(): void {
    if (this.selectedCategoryId === null) return;

    this.isLoading = true;
    this.errorMessage = '';

    const params: ProductParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    if (this.searchQuery) {
      params.searchTerm = this.searchQuery;
    }
    if (this.minPrice !== null && this.minPrice >= 0) {
      params.minPrice = this.minPrice;
    }
    if (this.maxPrice !== null && this.maxPrice > 0) {
      params.maxPrice = this.maxPrice;
    }
    if (this.orderBy) {
      params.ordereby = this.orderBy;
    }

    this.productService.getProductsWithPagination(this.selectedCategoryId, params).subscribe({
      next: (res) => {
        this.products = res.items;
        this.pagination = res.pagination;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load products for this category.';
        this.isLoading = false;
      }
    });
  }

  addToCart(product: ProductDto, event: Event): void {
    event.stopPropagation();
    const added = this.cartService.addToCart(product);
    this.showCartToast(added ? `"${product.name}" added to cart.` : `"${product.name}" is already at the stock limit.`);
  }

  goToProductDetail(productId: number): void {
    if (this.selectedCategoryId !== null) {
      this.router.navigate(['/products', this.selectedCategoryId, productId]);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pageNumber = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  /** Get the name of the currently selected category */
  get selectedCategoryName(): string {
    const cat = this.categories.find(c => c.id === this.selectedCategoryId);
    return cat ? cat.name : '';
  }

  /** Show a toast notification and auto-dismiss after 2.2 seconds */
  private showCartToast(message: string): void {
    if (this.cartToastTimer) clearTimeout(this.cartToastTimer);
    this.cartToastMessage = message;
    this.cartToastVisible = true;
    this.cartToastTimer = setTimeout(() => {
      this.cartToastVisible = false;
    }, 2200);
  }
}

