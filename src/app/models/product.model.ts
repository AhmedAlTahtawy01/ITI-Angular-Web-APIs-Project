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

export interface CategoryParams {
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  ordereby?: string;
}

export interface ProductParams {
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  ordereby?: string;
}

export interface PaginationMetaData {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMetaData;
}

