import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderDto } from '../../models/order.model';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  order: OrderDto | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    // Try to get from router state first
    const state = this.router.getCurrentNavigation()?.extras.state as { order: OrderDto };
    if (state && state.order) {
      this.order = state.order;
    } else {
      // Fallback: load using id parameter
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        const orderId = Number(idParam);
        if (!isNaN(orderId)) {
          this.loadOrder(orderId);
        } else {
          this.errorMessage = 'Invalid Order Identification.';
        }
      } else {
        this.errorMessage = 'No order details available.';
      }
    }
  }

  loadOrder(orderId: number): void {
    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.order = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load confirmation details.';
        this.isLoading = false;
      }
    });
  }
}
