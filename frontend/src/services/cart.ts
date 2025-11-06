import { api } from '../utils/api';
import type { CartItem } from '../types';

export interface CartResponse {
  cart: CartItem[];
  subtotal: number;
}

export async function getCart(): Promise<CartResponse> {
  const response = await api.get<CartResponse>('/cart');
  return response.data;
}

export async function addToCart(itemId: string, quantity: number = 1) {
  const response = await api.post('/cart/items', { itemId, quantity });
  return response.data;
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const response = await api.patch(`/cart/items/${cartItemId}`, { quantity });
  return response.data;
}

export async function removeCartItem(cartItemId: string) {
  const response = await api.delete(`/cart/items/${cartItemId}`);
  return response.data;
}

export async function mergeCart(items: Array<{ itemId: string; quantity: number }>) {
  const response = await api.post('/cart/merge', { items });
  return response.data;
}
