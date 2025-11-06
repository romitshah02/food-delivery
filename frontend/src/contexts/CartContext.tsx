import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart as addToCartAPI, updateCartItem, removeCartItem } from '../services/cart';
import type { CartItem } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: CartItem[];
  subtotal: number;
  isLoading: boolean;
  addToCart: (itemId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = async () => {
    if (!user) {
      setCart([]);
      setSubtotal(0);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getCart();
      setCart(data.cart);
      setSubtotal(data.subtotal);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (itemId: string, quantity: number = 1) => {
    try {
      await addToCartAPI(itemId, quantity);
      await refreshCart();
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await updateCartItem(cartItemId, quantity);
      await refreshCart();
      toast.success('Cart updated');
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart');
      throw error;
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await removeCartItem(cartItemId);
      await refreshCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
      throw error;
    }
  };

  const clearCart = () => {
    setCart([]);
    setSubtotal(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
