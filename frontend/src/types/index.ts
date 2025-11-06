// Types for API responses
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  availableStock: number;
}

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  trackingId: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}