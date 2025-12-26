import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for file uploads (without Content-Type header - browser will set it)
const uploadApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    // Don't set Content-Type - browser will set it with boundary for multipart/form-data
  },
});

// Request interceptor for upload API to add auth token
uploadApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', config.url, '- Token present:', !!token);
    } else {
      console.warn('⚠️ No access token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error('🚫 401 Unauthorized - Token may be invalid or expired');
      console.log('Token in localStorage:', localStorage.getItem('accessToken') ? 'EXISTS' : 'MISSING');
      
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {

          console.warn(' Token refresh not implemented - user needs to login again');
        } else {
          console.error(' No refresh token available');
        }
        
        // For now, clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Trigger event for AuthContext to update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('auth-invalid'));
        
        // Don't redirect immediately if we're already on login page
        if (!window.location.pathname.includes('/login')) {
          console.log('🔄 Redirecting to login in 2 seconds...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh error:', refreshError);
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API Service Functions

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  register: (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => api.post('/api/auth/register', userData),
  
  getProfile: () => api.get('/api/users/profile'),
  
  updateProfile: (userData: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) => api.patch('/api/users/profile', userData),
  
  resendVerification: (email: string) =>
    api.post('/api/auth/resend-verification', { email }),
  
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  
  resetPassword: (resetCode: string, newPassword: string) =>
    api.post('/api/auth/reset-password', { resetCode, newPassword }),
};

// Products
export const productsAPI = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => api.get('/api/products', { params }),
  
  getById: (id: string) => api.get(`/api/products/${id}`),
  
  create: (productData: {
    name: string;
    description?: string;
    price: number;
    sku: string;
    categoryId: string;
    imageUrl?: string;
  }) => api.post('/api/products', productData),
  
  update: (id: string, productData: Partial<{
    name: string;
    description?: string;
    price: number;
    sku: string;
    categoryId: string;
    imageUrl?: string;
  }>) => api.put(`/api/products/${id}`, productData),
  
  delete: (id: string) => api.delete(`/api/products/${id}`),
  
  updateInventory: (id: string, quantity: number) => 
    api.patch(`/api/products/${id}/inventory`, { quantity }),
};

// Orders
export const ordersAPI = {
  create: (orderData: {
    productId: string;
    quantity: number;
  }) => api.post('/api/orders', orderData),
  
  getMyOrders: () => api.get('/api/orders/my-orders'),
  
  updateOrderStatus: (orderId: string, status: string) =>
    api.put(`/api/orders/${orderId}/status`, { status }),
  
  // Admin endpoints
  getAllOrders: (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    userId?: string;
    sortBy?: 'createdAt' | 'total' | 'status';
    sortOrder?: 'asc' | 'desc';
  }) => api.get('/api/orders/admin/all', { params }),

  getOrderByIdAdmin: (orderId: string) =>
    api.get(`/api/orders/admin/${orderId}`),
  
  updateOrderStatusAdmin: (orderId: string, status: string) =>
    api.patch(`/api/orders/admin/${orderId}/status`, { status }),
};

// Categories (if implemented)
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  
  create: (categoryData: {
    name: string;
    slug: string;
  }) => api.post('/api/categories', categoryData),
};

// Cart
export const cartAPI = {
  getCart: () => api.get('/api/carts'),
  
  addToCart: (productId: string, quantity: number) =>
    api.post('/api/carts/items', { productId, quantity }),
  
  updateCartItem: (cartItemId: string, quantity: number) =>
    api.put(`/api/carts/items/${cartItemId}`, { quantity }),
  
  removeFromCart: (cartItemId: string) =>
    api.delete(`/api/carts/items/${cartItemId}`),
  
  clearCart: () => api.delete('/api/carts'),
  
  checkout: () => api.post('/api/carts/checkout'),
};

// Reviews
export const reviewsAPI = {
  create: (reviewData: {
    productId: string;
    rating: number;
    comment?: string;
  }) => api.post('/api/reviews', reviewData),
  
  getProductReviews: (productId: string) =>
    api.get(`/api/reviews/product/${productId}`),
  
  getMyReviews: () => api.get('/api/reviews/my-reviews'),
  
  update: (reviewId: string, reviewData: {
    rating?: number;
    comment?: string;
  }) => api.put(`/api/reviews/${reviewId}`, reviewData),
  
  delete: (reviewId: string) => api.delete(`/api/reviews/${reviewId}`),
};

// Upload
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadApi.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

