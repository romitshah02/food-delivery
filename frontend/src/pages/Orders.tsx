import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../services/orders';
import type { Order, OrderStatus } from '../types';

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => fetchOrders({ status: statusFilter }),
  });

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statuses: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Failed to load orders</div>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold mr-4">Order History</h1>
        
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === 'ALL' ? undefined : status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                (status === 'ALL' && !statusFilter) || status === statusFilter
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No orders found</p>
          <button
            onClick={() => window.location.href = '/menu'}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order #{order.trackingId.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-primary-600">₹{order.subtotal.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-4 py-2 rounded-md ${
                page === data.pagination.page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
