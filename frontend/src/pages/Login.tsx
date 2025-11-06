import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6 items-center">
        {/* Left marketing panel - visible on md+ */}
        <div className="hidden md:flex flex-col justify-center rounded-lg overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 p-8">
          <h3 className="text-2xl font-bold text-primary-700">Fresh food delivered</h3>
          <p className="mt-4 text-gray-700 dark:text-gray-700">
            Browse a wide selection of fresh items and get them delivered to your door. Save your cart across devices and enjoy quick checkout.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-700">
            <li>• Real-time inventory checks</li>
            <li>• Saved carts across devices</li>
            <li>• Order tracking & history</li>
          </ul>
        </div>

        {/* Right form panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-8 py-10 text-gray-900 dark:text-gray-100">
          <div className="max-w-lg mx-auto">
            <h2 className="text-center text-2xl font-extrabold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign in
                </button>
              </div>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}