import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Fresh Food Delivered to Your Door
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Browse our wide selection of fresh groceries, add them to your cart, and enjoy fast delivery. 
          Your cart syncs across all devices!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/menu"
            className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-medium"
          >
            Browse Menu
          </Link>
          {!user && (
            <Link
              to="/register"
              className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-lg font-medium"
            >
              Sign Up
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Easy Shopping
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse items by category and add them to your cart with one click
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Secure Checkout
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fast and secure payment process with real-time stock validation
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Track Orders
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your order status and view your complete order history
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
