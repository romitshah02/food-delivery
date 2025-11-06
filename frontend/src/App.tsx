import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

// Create a client for React Query
const queryClient = new QueryClient();

// Create routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout>
      <Outlet />
    </Layout>,
    children: [
      {
        path: '/',
        element: <div>Home Page - Coming Soon</div>,
      },
      {
        path: '/menu',
        element: <div>Menu Page - Coming Soon</div>,
      },
      {
        path: '/cart',
        element: (
          <ProtectedRoute>
            <div>Cart Page - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <ProtectedRoute>
            <div>Orders Page - Coming Soon</div>
          </ProtectedRoute>
        ),
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
