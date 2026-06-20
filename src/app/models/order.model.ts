import { ProductDto } from './product.model';

export type OrderState = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderDetailsDto {
  productId: number;
  cateogryId: number;
  unitPrice: number;
  amount: number;
  product?: ProductDto;
}

export interface OrderDto {
  id: number;
  totalPrice: number;
  userId: string;
  adress: string;
  orderState: OrderState;
  createdAt: string;
  orderDetails?: OrderDetailsDto[];
}

export interface OrderDetailsForCreationDto {
  productId: number;
  cateogryId: number;
  amount: number;
}

export interface OrderForCreationDto {
  adress: string;
  orderDetails: OrderDetailsForCreationDto[];
}
