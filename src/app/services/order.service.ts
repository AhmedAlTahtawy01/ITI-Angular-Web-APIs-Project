import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderDto, OrderForCreationDto } from '../models/order.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUsersUrl = 'https://localhost:44395/api/Users';
  private baseDeliveryUrl = 'https://localhost:44395/api/Delivery';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  createOrder(order: OrderForCreationDto): Observable<OrderDto> {
    const userId = this.authService.getUserId() || '';
    return this.http.post<OrderDto>(`${this.baseUsersUrl}/${userId}/Orders`, order);
  }

  getOrders(pageNumber: number = 1, pageSize: number = 10): Observable<OrderDto[]> {
    const userId = this.authService.getUserId() || '';
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<OrderDto[]>(`${this.baseUsersUrl}/${userId}/Orders`, { params });
  }

  getOrderById(orderId: number): Observable<OrderDto> {
    const userId = this.authService.getUserId() || '';
    return this.http.get<OrderDto>(`${this.baseUsersUrl}/${userId}/Orders/${orderId}`);
  }

  changeOrderState(orderId: number, state: string, targetUserId?: string): Observable<any> {
    // If targetUserId is not provided, default to current user
    const userId = targetUserId || this.authService.getUserId() || '';
    const params = new HttpParams().set('orderState', state);

    // Call the delivery endpoint: PUT api/Delivery/{UserId}/Orders/{OrderId}?orderState={state}
    return this.http.put<any>(`${this.baseDeliveryUrl}/${userId}/Orders/${orderId}`, null, { params });
  }

  getDeliveryPendingOrders(pageNumber: number = 1, pageSize: number = 10): Observable<OrderDto[]> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<OrderDto[]>(`${this.baseDeliveryUrl}/Pending-Orders`, { params });
  }

  getDeliveryShippedOrders(pageNumber: number = 1, pageSize: number = 10): Observable<OrderDto[]> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<OrderDto[]>(`${this.baseDeliveryUrl}/Shipped-Orders`, { params });
  }

  getDeliveryDeliveredOrders(pageNumber: number = 1, pageSize: number = 10): Observable<OrderDto[]> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<OrderDto[]>(`${this.baseDeliveryUrl}/Delivered-Orders`, { params });
  }
}
