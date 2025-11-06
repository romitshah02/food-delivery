import { api } from '../utils/api';
import type { Item } from '../types';

export async function fetchItems(params?: { category?: string; search?: string }) {
  const response = await api.get<Item[]>('/items', { params });
  return response.data;
}

export async function fetchItemById(id: string) {
  const response = await api.get<Item>(`/items/${id}`);
  return response.data;
}
