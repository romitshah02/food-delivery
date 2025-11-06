import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, subtotal, isLoading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      // Error already handled in context
    }
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeItem(cartItemId);
    } catch (error) {
      // Error already handled in context
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading cart...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some delicious items to get started!</p>
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
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Cart Items */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {cart.map((item) => (
            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Item Info */}
              <div className="flex-1 w-full">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">₹{item.price.toFixed(2)} each</p>
                {item.quantity > item.availableStock && (
                  <p className="text-red-600 text-sm mt-1">
                    Only {item.availableStock} available in stock
                  </p>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={item.quantity >= item.availableStock}
                >
                  +
                </button>
              </div>

              {/* Item Total */}
              <div className="sm:w-24 w-full sm:text-right">
                <p className="font-semibold text-lg text-gray-900 dark:text-white">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-600 hover:text-red-700 p-2 self-start sm:self-auto"
                title="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-gray-900 dark:text-white">Subtotal</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Shipping and taxes will be calculated at checkout
          </p>
          <button
            onClick={handleCheckout}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
