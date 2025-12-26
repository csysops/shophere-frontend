// src/stores/cartStore.ts
import { create } from 'zustand';
import { cartAPI } from '../services/api';

/**
 * Cart Store - For managing shopping cart items
 */

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    sku: string;
    imageUrl?: string;
    categoryName?: string;
  };
}

export interface Cart {
  id: string;
  userId: string;
  cartItems: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<any>;
  clearError: () => void;
  
  // Computed properties
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await cartAPI.getCart();
      set({ cart: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch cart';
      set({ error: errorMessage, loading: false, cart: null });
      throw err;
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    set({ loading: true, error: null });
    try {
      const { data } = await cartAPI.addToCart(productId, quantity);
      set({ cart: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add to cart';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  updateCartItem: async (cartItemId: string, quantity: number) => {
    set({ loading: true, error: null });
    try {
      const { data } = await cartAPI.updateCartItem(cartItemId, quantity);
      set({ cart: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update cart item';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  removeFromCart: async (cartItemId: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await cartAPI.removeFromCart(cartItemId);
      set({ cart: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove from cart';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await cartAPI.clearCart();
      set({ cart: null, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to clear cart';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  checkout: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await cartAPI.checkout();
      // After successful checkout, clear the cart
      set({ cart: null, loading: false });
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to checkout';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  getTotalItems: () => {
    const { cart } = get();
    if (!cart || !cart.cartItems) return 0;
    return cart.cartItems.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    const { cart } = get();
    if (!cart || !cart.cartItems) return 0;
    return cart.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  },
}));

