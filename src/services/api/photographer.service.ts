import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api';

const photographerApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
photographerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
photographerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Event {
  id: string;
  photographer_id: string;
  event_name: string;
  event_type?: string;
  event_date: string;
  location?: string;
  description?: string;
  is_public: boolean;
  access_code?: string;
  watermark_enabled: boolean;
  price_per_photo: number;
  status: 'active' | 'completed' | 'archived';
  total_photos: number;
  photo_count?: number;
  matched_users_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface EventPhoto {
  id: string;
  event_id: string;
  ai_photo_id: string;
  filename: string;
  faces_count: number;
  upload_order?: number;
  matched_users?: number;
  is_deleted: boolean;
  price?: number;
  price_in_points?: number;
  created_at: string;
}

export interface CreateEventData {
  event_name: string;
  event_type?: string;
  event_date: string;
  location?: string;
  description?: string;
  is_public?: boolean;
  access_code?: string;
  watermark_enabled?: boolean;
  price_per_photo?: number;
}

export interface UpdateEventData {
  event_name?: string;
  event_type?: string;
  event_date?: string;
  location?: string;
  description?: string;
  is_public?: boolean;
  access_code?: string;
  watermark_enabled?: boolean;
  price_per_photo?: number;
  status?: 'active' | 'completed' | 'archived';
}

export interface PhotographerProfile {
  id: string;
  user_id: string;
  business_name?: string;
  bio?: string;
  portfolio_url?: string;
  bank_account?: string;
  bank_name?: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_photo?: string;
  created_at: string;
}

export interface PhotographerStats {
  events: {
    total_events: number;
    active_events: number;
    completed_events: number;
  };
  photos: {
    total_photos: number;
    total_faces_detected: number;
  };
  downloads: {
    total_downloads: number;
    total_revenue: number;
  };
  users: {
    unique_users: number;
  };
}

export interface UploadPhotoData {
  face_image: string;
  filename: string;
  upload_order?: number;
}

export interface PhotoSaleRecord {
  photo_id: string;
  ai_photo_id: string;
  filename: string;
  event_id: string;
  event_name: string;
  price: number;
  total_sales: number;
  total_revenue: number;
  view_count?: number;
  last_sale_at?: string;
}

export interface PhotoSalesData {
  summary: {
    total_photos: number;
    total_sales: number;
    total_revenue: number;
    avg_revenue_per_photo: number;
  };
  photos: PhotoSaleRecord[];
  top_performers: PhotoSaleRecord[];
}

export const photographerService = {
  // Profile
  async getProfile(): Promise<{ success: boolean; data?: PhotographerProfile; error?: string }> {
    const response = await photographerApi.get('/photographer/profile');
    return response.data;
  },

  async updateProfile(data: {
    business_name?: string;
    bio?: string;
    portfolio_url?: string;
    bank_account?: string;
    bank_name?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await photographerApi.put('/photographer/profile', data);
    return response.data;
  },

  // Statistics
  async getStatistics(): Promise<{ success: boolean; data?: PhotographerStats; error?: string }> {
    const response = await photographerApi.get('/photographer/statistics');
    return response.data;
  },

  // Events
  async createEvent(data: CreateEventData): Promise<{ success: boolean; data?: { event_id: string; event_name: string; event_date: string }; error?: string }> {
    const response = await photographerApi.post('/photographer/events', data);
    return response.data;
  },

  async getMyEvents(): Promise<{ success: boolean; data?: Event[]; error?: string }> {
    const response = await photographerApi.get('/photographer/events');
    return response.data;
  },

  async getEventDetails(eventId: string): Promise<{ success: boolean; data?: { event: Event; photos: EventPhoto[] }; error?: string }> {
    const response = await photographerApi.get(`/photographer/events/${eventId}`);
    return response.data;
  },

  async updateEvent(eventId: string, data: UpdateEventData): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await photographerApi.put(`/photographer/events/${eventId}`, data);
    return response.data;
  },

  async deleteEvent(eventId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await photographerApi.delete(`/photographer/events/${eventId}`);
    return response.data;
  },

  // Photos
  async uploadPhoto(eventId: string, data: UploadPhotoData): Promise<{ 
    success: boolean; 
    data?: { 
      photo_id: string; 
      ai_photo_id: string; 
      faces_detected: number;
      dropbox_uploaded: boolean;
    }; 
    error?: string 
  }> {
    const response = await photographerApi.post(`/photographer/events/${eventId}/photos`, data);
    return response.data;
  },

  async deletePhoto(eventId: string, photoId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await photographerApi.delete(`/photographer/events/${eventId}/photos/${photoId}`);
    return response.data;
  },

  // Update single photo pricing
  async updatePhotoPricing(eventId: string, photoId: string, data: {
    price_cash: number;
    price_points: number;
    is_for_sale: boolean;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await photographerApi.put(`/photographer/events/${eventId}/photos/${photoId}/pricing`, data);
    return response.data;
  },

  // Bulk update pricing for all photos in event
  async updateBulkPricing(eventId: string, data: {
    price_cash: number;
    price_points: number;
    is_for_sale: boolean;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await photographerApi.put(`/photographer/events/${eventId}/photos/bulk-pricing`, data);
    return response.data;
  },

  // Photo Sales Statistics
  async getPhotoSales(): Promise<{ success: boolean; data?: PhotoSalesData; error?: string }> {
    const response = await photographerApi.get('/photographer/photo-sales');
    return response.data;
  },
};
