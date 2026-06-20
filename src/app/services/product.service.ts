import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDto, ProductDto } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'https://localhost:44395/api/Catgories';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.baseUrl);
  }

  getProducts(categoryId: number): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.baseUrl}/${categoryId}/Products`);
  }
}
