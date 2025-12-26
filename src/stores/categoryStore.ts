import { create } from 'zustand';
import { categoriesAPI } from '../services/api';



export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
}

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: CreateCategoryInput) => Promise<Category>;
  clearError: () => void;
  clearCurrentCategory: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await categoriesAPI.getAll();
      set({ categories: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch categories';
      set({ error: errorMessage, loading: false, categories: [] });
      throw err;
    }
  },

  createCategory: async (categoryData: CreateCategoryInput) => {
    set({ loading: true, error: null });
    try {
      const { data } = await categoriesAPI.create(categoryData);
      
      // Add the new category to the list
      set((state) => ({
        categories: [...state.categories, data],
        loading: false,
      }));
      
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create category';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentCategory: () => {
    set({ currentCategory: null });
  },
}));

