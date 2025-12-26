import { create } from 'zustand';
import { ordersAPI } from '../services/api';

/**
 * Order Store - For managing orders
 */

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface CreateOrderInput {
  productId: string;
  quantity: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMyOrders: () => Promise<void>;
  createOrder: (orderData: CreateOrderInput) => Promise<Order>;
  clearError: () => void;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  fetchMyOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await ordersAPI.getMyOrders();
      set({ orders: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch orders';
      set({ error: errorMessage, loading: false, orders: [] });
      throw err;
    }
  },

  createOrder: async (orderData: CreateOrderInput) => {
    set({ loading: true, error: null });
    try {
      const { data } = await ordersAPI.create(orderData);
      
      // Add the new order to the orders list
      set((state) => ({
        orders: [data, ...state.orders],
        currentOrder: data,
        loading: false,
      }));
      
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));

