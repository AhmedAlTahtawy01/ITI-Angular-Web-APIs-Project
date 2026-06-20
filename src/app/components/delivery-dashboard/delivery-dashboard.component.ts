import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderDto } from '../../models/order.model';

@Component({
  selector: 'app-delivery-dashboard',
  templateUrl: './delivery-dashboard.component.html',
  styleUrls: ['./delivery-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class DeliveryDashboardComponent implements OnInit {
  private orderService = inject(OrderService);

  activeTab: 'Pending' | 'Shipped' | 'Delivered' = 'Pending';
  orders: OrderDto[] = [];
  isLoading = false;
  errorMessage = '';
  actionMessage = '';

  // Pagination parameters
  pageNumber = 1;
  pageSize = 10;
  hasMoreOrders = true;

  ngOnInit(): void {
    this.loadOrders();
  }

  setTab(tab: 'Pending' | 'Shipped' | 'Delivered'): void {
    this.activeTab = tab;
    this.pageNumber = 1;
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.actionMessage = '';

    let req$;
    if (this.activeTab === 'Pending') {
      req$ = this.orderService.getDeliveryPendingOrders(this.pageNumber, this.pageSize);
    } else if (this.activeTab === 'Shipped') {
      req$ = this.orderService.getDeliveryShippedOrders(this.pageNumber, this.pageSize);
    } else {
      req$ = this.orderService.getDeliveryDeliveredOrders(this.pageNumber, this.pageSize);
    }

    req$.subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
        this.hasMoreOrders = data.length === this.pageSize;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load delivery orders. Please verify role clearance.';
        this.isLoading = false;
      }
    });
  }

  transitionOrder(order: OrderDto, nextState: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.actionMessage = '';

    // The delivery endpoint: PUT api/Delivery/{UserId}/Orders/{OrderId}?orderState={state}
    this.orderService.changeOrderState(order.id, nextState, order.userId).subscribe({
      next: () => {
        this.actionMessage = `Order #${order.id} updated to ${nextState}!`;
        this.loadOrders();
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to update order status.';
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    if (this.hasMoreOrders) {
      this.pageNumber++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadOrders();
    }
  }
}
