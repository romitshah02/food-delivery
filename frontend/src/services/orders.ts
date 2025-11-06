import { api } from '../utils/api';
import type { Order, OrderStatus } from '../types';

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function fetchOrders(params?: { page?: number; limit?: number; status?: OrderStatus }): Promise<OrdersResponse> {
  const response = await api.get<OrdersResponse>('/api/orders', { params });
  return response.data;
}

export async function fetchOrderDetails(orderId: string): Promise<Order> {
  const response = await api.get<Order>(`/api/orders/${orderId}`);
  return response.data;
}
