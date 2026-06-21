import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CategoryDto,
  ProductDto,
  CategoryParams,
  ProductParams,
  PaginatedResult,
  PaginationMetaData
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:44395/api/Catgories';

  /**
   * Helper to parse the custom X-Pagination header.
   */
  private parsePaginationHeader(headers: HttpHeaders): PaginationMetaData {
    const paginationHeader = headers.get('X-Pagination');
    if (!paginationHeader) {
      return {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
        hasPrevious: false,
        hasNext: false
      };
    }
    try {
      const parsed = JSON.parse(paginationHeader);
      return {
        currentPage: parsed.currentPage ?? parsed.CurrentPage ?? 1,
        totalPages: parsed.totalPages ?? parsed.TotalPages ?? 1,
        pageSize: parsed.pageSize ?? parsed.PageSize ?? 10,
        totalCount: parsed.totalCount ?? parsed.TotalCount ?? 0,
        hasPrevious: parsed.hasPrevious ?? parsed.HasPrevious ?? false,
        hasNext: parsed.hasNext ?? parsed.HasNext ?? false
      };
    } catch {
      return {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
        hasPrevious: false,
        hasNext: false
      };
    }
  }

  /**
   * Get all categories. Optionally supports search/pagination query params.
   */
  getCategories(params?: CategoryParams): Observable<CategoryDto[]> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    let httpParams = new HttpParams();
    if (params) {
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.ordereby) httpParams = httpParams.set('ordereby', params.ordereby);
    }
    return this.http.get<CategoryDto[]>(this.baseUrl, { headers, params: httpParams });
  }

  /**
   * Get all categories with pagination metadata.
   */
  getCategoriesWithPagination(params?: CategoryParams): Observable<PaginatedResult<CategoryDto>> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    let httpParams = new HttpParams();
    if (params) {
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.ordereby) httpParams = httpParams.set('ordereby', params.ordereby);
    }
    return this.http.get<CategoryDto[]>(this.baseUrl, {
      headers,
      params: httpParams,
      observe: 'response'
    }).pipe(
      map(response => {
        const items = response.body || [];
        const pagination = this.parsePaginationHeader(response.headers);
        return { items, pagination };
      })
    );
  }

  /**
   * Get a single category by its ID.
   */
  getCategoryById(id: number): Observable<CategoryDto> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<CategoryDto>(`${this.baseUrl}/${id}`, { headers });
  }

  /**
   * Get products under a category. Optionally supports minPrice, maxPrice, search, pagination, etc.
   */
  getProducts(categoryId: number, params?: ProductParams): Observable<ProductDto[]> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    let httpParams = new HttpParams();
    if (params) {
      if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.ordereby) httpParams = httpParams.set('ordereby', params.ordereby);
    }
    return this.http.get<ProductDto[]>(`${this.baseUrl}/${categoryId}/Products`, { headers, params: httpParams });
  }

  /**
   * Get products under a category with pagination metadata.
   */
  getProductsWithPagination(categoryId: number, params?: ProductParams): Observable<PaginatedResult<ProductDto>> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    let httpParams = new HttpParams();
    if (params) {
      if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.ordereby) httpParams = httpParams.set('ordereby', params.ordereby);
    }
    return this.http.get<ProductDto[]>(`${this.baseUrl}/${categoryId}/Products`, {
      headers,
      params: httpParams,
      observe: 'response'
    }).pipe(
      map(response => {
        const items = response.body || [];
        const pagination = this.parsePaginationHeader(response.headers);
        return { items, pagination };
      })
    );
  }

  /**
   * Get a single product details.
   */
  getProductById(categoryId: number, productId: number): Observable<ProductDto> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<ProductDto>(`${this.baseUrl}/${categoryId}/Products/${productId}`, { headers });
  }
}

