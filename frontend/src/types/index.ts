export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PurchaseRequest {
  sweetId: string;
  quantity: number;
}

export interface SearchFilters {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}