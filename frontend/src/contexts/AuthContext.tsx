import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Token exists, we're logged in
      // Store basic user info from token or create a placeholder
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        setUser({ id: '', email: userEmail });
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userEmail', response.data.user.email);
      setUser(response.data.user);
    } catch (err) {
      setError('Invalid credentials');
      throw err;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/register', credentials);
      // Backend returns user only on register, need to login after
      localStorage.setItem('userEmail', response.data.user.email);
      setUser(response.data.user);
      // Auto-login after registration
      await login({ email: credentials.email, password: credentials.password });
    } catch (err) {
      setError('Registration failed');
      throw err;
    }
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Call logout endpoint to revoke session
      api.post('/api/auth/logout', { refreshToken }).catch(() => {
        // Ignore errors on logout
      });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}