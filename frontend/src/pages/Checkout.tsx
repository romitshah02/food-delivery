import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { checkout } from '../services/checkout';
import type { OutOfStockError } from '../services/checkout';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState<OutOfStockError['details']>([]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setOutOfStockItems([]);

    try {
      const response = await checkout();
      
      // Clear cart and show success
      clearCart();
      toast.success(`Order placed successfully! Tracking ID: ${response.trackingId}`);
      
      // Redirect to orders page
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error: any) {
      if (error.response?.data?.error === 'OUT_OF_STOCK') {
        setOutOfStockItems(error.response.data.details);
        toast.error('Some items are out of stock');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some items to checkout!</p>
          <button
            onClick={() => navigate('/menu')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Out of Stock Warning */}
      {outOfStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="text-red-800 dark:text-red-400 font-semibold mb-2">Items Out of Stock</h3>
          <ul className="space-y-1">
            {outOfStockItems.map((item, index) => {
              const cartItem = cart.find(c => c.itemId === item.itemId);
              return (
                <li key={index} className="text-red-700 dark:text-red-300 text-sm">
                  {cartItem?.name || 'Item'}: Requested {item.requested}, but only {item.available} available
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => navigate('/cart')}
            className="mt-3 text-red-700 dark:text-red-400 underline text-sm"
          >
            Update cart quantities
          </button>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cart.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary-600">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Payment processing is simulated for this demo. Click "Place Order" to complete your purchase.
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="w-full mt-3 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
