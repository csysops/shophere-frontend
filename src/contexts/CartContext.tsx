import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { cartAPI } from '../services/api';
import { CART_REFRESH_EVENT } from './AuthContext';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl?: string;
  quantity: number;
  subtotal: number;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<any>;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState<number>(0);

  const fetchCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCart(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      
      // If 401 Unauthorized, clear auth data (token is invalid)
      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setCart(null);
        // Trigger auth refresh
        window.dispatchEvent(new Event(CART_REFRESH_EVENT));
      } else {
        setError(err.response?.data?.message || 'Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = () => {
    setShouldRefresh(prev => prev + 1);
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.addToCart(productId, quantity);
      setCart(response.data);
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.updateCartItem(cartItemId, quantity);
      setCart(response.data);
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      setError(err.response?.data?.message || 'Failed to update cart item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.removeFromCart(cartItemId);
      setCart(response.data);
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.message || 'Failed to remove from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.clearCart();
      setCart(response.data);
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.checkout();
      // Clear cart after successful checkout
      setCart(null);
      return response.data;
    } catch (err: any) {
      console.error('Error during checkout:', err);
      setError(err.response?.data?.message || 'Failed to checkout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart on mount if user is logged in, and when shouldRefresh changes
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [shouldRefresh]);

  // Listen for auth changes
  useEffect(() => {
    const handleCartRefresh = () => {
      refreshCart();
    };

    window.addEventListener(CART_REFRESH_EVENT, handleCartRefresh);

    return () => {
      window.removeEventListener(CART_REFRESH_EVENT, handleCartRefresh);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        checkout,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

