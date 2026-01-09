import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api';

const userApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
userApi.interceptors.response.use(
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

export interface UserPhoto {
  id: string;
  event_photo_id: string;
  photo_id: string;
  filename: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_location?: string;
  event_description?: string;
  photographer_name: string;
  similarity: number;
  match_date: string;
  preview_url: string;
  is_purchased: boolean;
  purchase_price?: number;
  price?: number;
  price_in_points?: number;
}

export interface MatchPhotosData {
  face_image: string;
}

export interface PaymentData {
  event_photo_id: string;
  amount: number;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    order_id: string;
    snap_token: string;
    gross_amount: number;
  };
  error?: string;
}

export interface DownloadData {
  event_photo_id: string;
  transaction_id: string;
}

export const userService = {
  // Match photos by face
  async matchPhotos(data: MatchPhotosData): Promise<{ success: boolean; data?: UserPhoto[]; error?: string }> {
    const response = await userApi.post('/user/match-photos', data);
    return response.data;
  },

  // Get user's matched photos
  async getMyPhotos(): Promise<{ success: boolean; data?: UserPhoto[]; error?: string }> {
    const response = await userApi.get('/user/my-photos');
    return response.data;
  },

  // Create payment for photo
  async createPayment(data: PaymentData): Promise<PaymentResponse> {
    const response = await userApi.post('/user/payment/create', data);
    return response.data;
  },

  // Verify payment status
  async verifyPayment(orderId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await userApi.get(`/user/payment/status/${orderId}`);
    return response.data;
  },

  // Download photo after payment
  async downloadPhoto(data: DownloadData): Promise<{ success: boolean; data?: { download_url: string }; error?: string }> {
    const response = await userApi.post('/user/download', data);
    return response.data;
  },

  // Get user statistics
  async getUserStats(): Promise<{ 
    success: boolean; 
    data?: { 
      total_matched_photos: number;
      total_downloads: number;
      total_spent: number;
      recent_matches: number;
    }; 
    error?: string 
  }> {
    const response = await userApi.get('/user/statistics');
    return response.data;
  },
};
