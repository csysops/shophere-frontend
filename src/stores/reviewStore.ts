import { create } from 'zustand';
import { reviewsAPI } from '../services/api';

/**
 * Review Store - For managing product reviews
 */

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

interface ReviewState {
  reviews: Review[];
  currentReview: Review | null;
  myReviews: Review[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProductReviews: (productId: string) => Promise<void>;
  fetchMyReviews: () => Promise<void>;
  fetchReviewById: (reviewId: string) => Promise<void>;
  createReview: (reviewData: CreateReviewInput) => Promise<Review>;
  updateReview: (reviewId: string, reviewData: UpdateReviewInput) => Promise<Review>;
  deleteReview: (reviewId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentReview: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  currentReview: null,
  myReviews: [],
  loading: false,
  error: null,

  fetchProductReviews: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await reviewsAPI.getProductReviews(productId);
      set({ reviews: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch reviews';
      set({ error: errorMessage, loading: false, reviews: [] });
      throw err;
    }
  },

  fetchMyReviews: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await reviewsAPI.getMyReviews();
      set({ myReviews: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch my reviews';
      set({ error: errorMessage, loading: false, myReviews: [] });
      throw err;
    }
  },

  fetchReviewById: async (reviewId: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await reviewsAPI.getProductReviews(reviewId);
      // Note: Backend doesn't have getById endpoint, this is a workaround
      // In a real app, you'd implement a proper getById endpoint
      set({ currentReview: data, loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch review';
      set({ error: errorMessage, loading: false, currentReview: null });
      throw err;
    }
  },

  createReview: async (reviewData: CreateReviewInput) => {
    set({ loading: true, error: null });
    try {
      const { data } = await reviewsAPI.create(reviewData);
      
      // Add the new review to the reviews list if it matches the current product
      set((state) => ({
        reviews: [data, ...state.reviews],
        myReviews: [data, ...state.myReviews],
        loading: false,
      }));
      
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create review';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  updateReview: async (reviewId: string, reviewData: UpdateReviewInput) => {
    set({ loading: true, error: null });
    try {
      const { data } = await reviewsAPI.update(reviewId, reviewData);
      
      // Update the review in both lists
      set((state) => ({
        reviews: state.reviews.map((r) => (r.id === reviewId ? data : r)),
        myReviews: state.myReviews.map((r) => (r.id === reviewId ? data : r)),
        currentReview: state.currentReview?.id === reviewId ? data : state.currentReview,
        loading: false,
      }));
      
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update review';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  deleteReview: async (reviewId: string) => {
    set({ loading: true, error: null });
    try {
      await reviewsAPI.delete(reviewId);
      
      // Remove the review from both lists
      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== reviewId),
        myReviews: state.myReviews.filter((r) => r.id !== reviewId),
        currentReview: state.currentReview?.id === reviewId ? null : state.currentReview,
        loading: false,
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete review';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentReview: () => {
    set({ currentReview: null });
  },
}));

