import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { OrderDto, OrderState } from '../../models/order.model';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class OrderTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  order: OrderDto | null = null;
  isLoading = false;
  errorMessage = '';
  simulationMessage = '';
  isSimulating = false;

  userRole = '';
  orderId = 0;

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole() || '';
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.orderId = Number(idParam);
      if (!isNaN(this.orderId)) {
        this.loadOrder();
      } else {
        this.errorMessage = 'Invalid Order ID';
      }
    }
  }

  loadOrder(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (data) => {
        this.order = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load order tracking details.';
        this.isLoading = false;
      }
    });
  }

  // Get date estimate based on creation date
  getStepDate(step: string): Date | string {
    if (!this.order) return '';
    const createdDate = new Date(this.order.createdAt);
    
    if (step === 'Pending') {
      return createdDate;
    }
    
    if (step === 'Shipped') {
      if (this.order.orderState === 'Shipped' || this.order.orderState === 'Delivered') {
        // Return 1 day after creation as simulated shipped date
        return new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
      }
      return 'Pending shipment...';
    }
    
    if (step === 'Delivered') {
      if (this.order.orderState === 'Delivered') {
        // Return 3 days after creation as simulated delivery date
        return new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      }
      return 'Estimated in 2-3 business days';
    }
    
    return '';
  }

  isStepActive(step: string): boolean {
    if (!this.order) return false;
    const currentState = this.order.orderState;

    if (step === 'Pending') {
      return true; // Always placed if we have the order
    }
    if (step === 'Shipped') {
      return currentState === 'Shipped' || currentState === 'Delivered';
    }
    if (step === 'Delivered') {
      return currentState === 'Delivered';
    }
    return false;
  }

  isCurrentStep(step: string): boolean {
    if (!this.order) return false;
    return this.order.orderState === step;
  }

  simulateStateChange(newState: string): void {
    if (!this.order) return;
    this.isSimulating = true;
    this.simulationMessage = '';

    // Note: the route parameters require the owner's UserId, which is order.userId
    this.orderService.changeOrderState(this.order.id, newState, this.order.userId).subscribe({
      next: () => {
        this.isSimulating = false;
        this.simulationMessage = `Successfully transitioned status to ${newState}!`;
        this.loadOrder();
      },
      error: (err) => {
        this.isSimulating = false;
        if (err.status === 403) {
          this.errorMessage = 'Action Forbidden (403): You must be logged in as a "Delivery" user to change order states.';
        } else {
          this.errorMessage = err.error || 'Failed to update order status.';
        }
      }
    });
  }
}
