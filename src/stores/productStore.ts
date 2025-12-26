import { create } from 'zustand';
import { productsAPI } from '../services/api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string;
  averageRating?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProductsResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Product[];
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  total: number;
  page: number;
  pageSize: number;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (productData: {
    name: string;
    description?: string;
    price: number;
    sku: string;
    categoryId: string;
    imageUrl?: string;
  }) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<{
    name: string;
    description?: string;
    price: number;
    sku: string;
    categoryId: string;
    imageUrl?: string;
  }>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  clearError: () => void;
  clearCurrentProduct: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  total: 0,
  page: 1,
  pageSize: 10,
  filters: {
    page: 1,
    pageSize: 10,
    sort: 'updatedAt',
    order: 'desc',
  },
  loading: false,
  error: null,

  setFilters: (filters: ProductFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  fetchProducts: async (filters?: ProductFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = { ...get().filters, ...filters };
      const { data } = await productsAPI.getAll(currentFilters);
      
      set({
        products: data.items || [],
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 10,
        filters: currentFilters,
        loading: false,
      });
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to fetch products';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await productsAPI.getById(id);
      set({
        currentProduct: data,
        loading: false,
      });
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to fetch product';
      set({ error: errorMessage, loading: false, currentProduct: null });
      throw err;
    }
  },

  createProduct: async (productData: {
    name: string;
    description?: string;
    price: number;
    sku: string;
    categoryId: string;
    imageUrl?: string;
  }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await productsAPI.create(productData);
      
      // Add the new product to the list
      set((state) => ({
        products: [data, ...state.products],
        total: state.total + 1,
        loading: false,
      }));
      
      return data;
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to create product';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  updateProduct: async (id: string, productData: Partial<{
    name: string;
    description?: string;
    price: number;
    sku: string;
    categoryId: string;
    imageUrl?: string;
  }>) => {
    set({ loading: true, error: null });
    try {
      const { data } = await productsAPI.update(id, productData);
      
      // Update the product in the list
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? data : p)),
        currentProduct: state.currentProduct?.id === id ? data : state.currentProduct,
        loading: false,
      }));
      
      return data;
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to update product';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  deleteProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await productsAPI.delete(id);
      
      // Remove the product from the list
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        total: state.total - 1,
        currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
        loading: false,
      }));
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to delete product';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },
}));

