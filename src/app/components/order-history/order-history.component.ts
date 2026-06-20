import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderDto, OrderState } from '../../models/order.model';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: OrderDto[] = [];
  isLoading = false;
  errorMessage = '';

  // Pagination params
  pageNumber = 1;
  pageSize = 10;
  hasMoreOrders = true; // Simple check since list is array of items

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.orderService.getOrders(this.pageNumber, this.pageSize).subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
        // Simple pagination state: if returned array length is less than page size, there is no more data
        this.hasMoreOrders = data.length === this.pageSize;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load order history. Make sure you are logged in.';
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClass(state: OrderState): string {
    switch (state) {
      case 'Pending':
        return 'badge-pending';
      case 'Shipped':
        return 'badge-shipped';
      case 'Delivered':
        return 'badge-delivered';
      case 'Cancelled':
        return 'badge-cancelled';
      default:
        return 'bg-secondary';
    }
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
