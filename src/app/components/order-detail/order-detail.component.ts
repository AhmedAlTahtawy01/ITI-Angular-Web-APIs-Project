import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderDto } from '../../models/order.model';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order: OrderDto | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const orderId = Number(idParam);
      if (!isNaN(orderId)) {
        this.loadOrderDetails(orderId);
      } else {
        this.errorMessage = 'Invalid Order ID';
      }
    }
  }

  loadOrderDetails(orderId: number): void {
    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.order = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load order details.';
        this.isLoading = false;
      }
    });
  }
}
