import { api } from '../utils/api';
import type { CartItem } from '../types';

export interface CartResponse {
  cart: CartItem[];
  subtotal: number;
}

export async function getCart(): Promise<CartResponse> {
  const response = await api.get<CartResponse>('/api/cart');
  return response.data;
}

export async function addToCart(itemId: string, quantity: number = 1) {
  const response = await api.post('/api/cart/items', { itemId, quantity });
  return response.data;
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const response = await api.patch(`/api/cart/items/${cartItemId}`, { quantity });
  return response.data;
}

export async function removeCartItem(cartItemId: string) {
  const response = await api.delete(`/api/cart/items/${cartItemId}`);
  return response.data;
}

export async function mergeCart(items: Array<{ itemId: string; quantity: number }>) {
  const response = await api.post('/api/cart/merge', { items });
  return response.data;
}
