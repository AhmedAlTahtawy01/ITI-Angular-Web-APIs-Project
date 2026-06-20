export interface CategoryDto {
  id: number;
  name: string;
}

export enum ProductState {
  Pending = 0,
  Accepted = 1,
  Cancelled = 2
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  amount: number;
  description?: string;
  productState: ProductState;
  cateogryId: number;
}
