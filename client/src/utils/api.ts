import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Initialize token from localStorage on app start
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      setAuthToken(null);
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api.request({
      method,
      url: endpoint,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

// Error handler
const handleApiError = (error: AxiosError): Error => {
  if (error.response?.data) {
    const apiError = error.response.data as ApiResponse<any>;
    return new Error(apiError.message || 'An error occurred');
  }
  
  if (error.request) {
    return new Error('Network error. Please check your connection.');
  }
  
  return new Error(error.message || 'An unexpected error occurred');
};

// Specific API methods
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<ApiResponse<{ token: string; user: any }>>('POST', '/auth/login', credentials),
  
  register: (userData: any) =>
    apiRequest<ApiResponse<{ token: string; user: any }>>('POST', '/auth/register', userData),
  
  getProfile: () =>
    apiRequest<ApiResponse<any>>('GET', '/auth/me'),
  
  updateProfile: (data: any) =>
    apiRequest<ApiResponse<any>>('PUT', '/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiRequest<ApiResponse<any>>('PUT', '/auth/password', data),
  
  logout: () =>
    apiRequest<ApiResponse<any>>('POST', '/auth/logout'),
};

export const listingsAPI = {
  getListings: (filters?: any) =>
    apiRequest<PaginatedResponse<any>>('GET', '/listings', null, { params: filters }),
  
  getListing: (id: string) =>
    apiRequest<ApiResponse<any>>('GET', `/listings/${id}`),
  
  createListing: (data: any) =>
    apiRequest<ApiResponse<any>>('POST', '/listings', data),
  
  updateListing: (id: string, data: any) =>
    apiRequest<ApiResponse<any>>('PUT', `/listings/${id}`, data),
  
  deleteListing: (id: string) =>
    apiRequest<ApiResponse<any>>('DELETE', `/listings/${id}`),
  
  contactListing: (id: string) =>
    apiRequest<ApiResponse<any>>('POST', `/listings/${id}/contact`),
  
  getUserListings: (params?: any) =>
    apiRequest<PaginatedResponse<any>>('GET', '/listings/user/me', null, { params }),
};

export const categoriesAPI = {
  getCategories: (includeStats?: boolean) =>
    apiRequest<ApiResponse<any[]>>('GET', '/categories', null, { 
      params: { includeStats } 
    }),
  
  getCategory: (slug: string) =>
    apiRequest<ApiResponse<any>>('GET', `/categories/${slug}`),
  
  createCategory: (data: any) =>
    apiRequest<ApiResponse<any>>('POST', '/categories', data),
  
  updateCategory: (id: string, data: any) =>
    apiRequest<ApiResponse<any>>('PUT', `/categories/${id}`, data),
  
  deleteCategory: (id: string) =>
    apiRequest<ApiResponse<any>>('DELETE', `/categories/${id}`),
};

export const usersAPI = {
  getUsers: (params?: any) =>
    apiRequest<PaginatedResponse<any>>('GET', '/users', null, { params }),
  
  getUser: (id: string) =>
    apiRequest<ApiResponse<any>>('GET', `/users/${id}`),
  
  getUserProfile: (username: string) =>
    apiRequest<ApiResponse<any>>('GET', `/users/profile/${username}`),
  
  updateUserStatus: (id: string, data: { isActive?: boolean; isVerified?: boolean }) =>
    apiRequest<ApiResponse<any>>('PUT', `/users/${id}/status`, data),
  
  updateUserRole: (id: string, data: { role: string }) =>
    apiRequest<ApiResponse<any>>('PUT', `/users/${id}/role`, data),
  
  deleteUser: (id: string) =>
    apiRequest<ApiResponse<any>>('DELETE', `/users/${id}`),
  
  addToFavorites: (listingId: string) =>
    apiRequest<ApiResponse<any>>('POST', `/users/favorites/${listingId}`),
  
  removeFromFavorites: (listingId: string) =>
    apiRequest<ApiResponse<any>>('DELETE', `/users/favorites/${listingId}`),
};

export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest<ApiResponse<{ url: string; publicId: string }>>('POST', '/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return apiRequest<ApiResponse<Array<{ url: string; publicId: string }>>>('POST', '/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  deleteImage: (publicId: string) =>
    apiRequest<ApiResponse<any>>('DELETE', `/upload/image/${publicId}`),
};

export const adminAPI = {
  getStats: () =>
    apiRequest<ApiResponse<any>>('GET', '/admin/stats'),
  
  getPendingListings: (params?: any) =>
    apiRequest<PaginatedResponse<any>>('GET', '/admin/listings/pending', null, { params }),
  
  moderateListing: (id: string, data: { action: 'approve' | 'reject'; moderationNotes?: string }) =>
    apiRequest<ApiResponse<any>>('PUT', `/admin/listings/${id}/moderate`, data),
  
  getAdminListings: (params?: any) =>
    apiRequest<PaginatedResponse<any>>('GET', '/admin/listings', null, { params }),
  
  featureListing: (id: string, featured: boolean) =>
    apiRequest<ApiResponse<any>>('PUT', `/admin/listings/${id}/feature`, { featured }),
  
  verifyListing: (id: string, verified: boolean) =>
    apiRequest<ApiResponse<any>>('PUT', `/admin/listings/${id}/verify`, { verified }),
  
  bulkAction: (data: { action: string; listingIds: string[]; moderationNotes?: string }) =>
    apiRequest<ApiResponse<any>>('POST', '/admin/listings/bulk-action', data),
  
  setupAdmin: () =>
    apiRequest<ApiResponse<any>>('POST', '/admin/setup'),
};

export default api;