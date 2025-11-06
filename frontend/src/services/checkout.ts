import { api } from '../utils/api';

export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  trackingId: string;
}

export interface OutOfStockError {
  error: 'OUT_OF_STOCK';
  details: Array<{
    itemId: string;
    requested: number;
    available: number;
  }>;
}

export async function checkout(): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>('/api/checkout');
  return response.data;
}
