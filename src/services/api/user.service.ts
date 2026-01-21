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

// ============ INTERFACES ============

export interface UserPhoto {
  match_id?: string;
  event_photo_id: string;
  photo_id: string;
  filename: string;
  faces_count?: number;
  
  // Event info
  event_id: string;
  event_name: string;
  event_type?: string;
  event_date: string;
  event_location?: string;
  event_description?: string;
  
  // Photographer info
  photographer_id?: string;
  business_name?: string;
  photographer_name: string;
  
  // Face match info
  similarity: number;
  confidence?: number;
  match_date: string;
  
  // Pricing
  price_cash?: number;
  price_points?: number;
  price?: number;
  price_in_points?: number;
  is_for_sale?: boolean;
  sold_count?: number;
  
  // Purchase status
  is_purchased: boolean;
  purchased_at?: string;
  purchase_price?: number;
  payment_method?: 'cash' | 'points';
  
  // URLs
  preview_url: string;
  download_url?: string | null;
  
  // CTA from backend
  cta?: 'BUY' | 'DOWNLOAD' | 'FREE_DOWNLOAD' | 'VIEW';
  price_display?: string;
  
  // Legacy fields
  id?: string;
  upload_timestamp?: string;
}

export interface EventBrowse {
  id: string;
  event_name: string;
  event_type?: string;
  event_date: string;
  location?: string;
  description?: string;
  photographer_name: string;
  photo_count: number;
  is_public: boolean;
}

export interface PhotoDetail {
  id: string;
  event_id: string;
  filename: string;
  preview_url: string;
  event_name: string;
  event_date: string;
  event_location?: string;
  photographer_id: string;
  photographer_name: string;
  price_cash: number;
  price_points: number;
  is_for_sale: boolean;
  is_purchased: boolean;
}

export interface UserBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
  recent_transactions: {
    transaction_type: string;
    amount: number;
    description: string;
    created_at: string;
  }[];
  last_updated: string;
}

export interface MatchPhotosData {
  embedding: number[];
}

export interface PurchaseResponse {
  success: boolean;
  message?: string;
  data?: {
    transaction_id: string;
    purchase_id?: string;
    order_id?: string;
    photo: {
      id: string;
      filename: string;
      event_name: string;
    };
    amount?: number;
    payment_url?: string;
    token?: string;
    expired_at?: string;
    payment?: {
      method: string;
      points_used: number;
      cash_value: number;
      balance_before?: number;
      balance_after?: number;
    };
    download_url?: string;
  };
  error?: string;
  error_code?: string;
  details?: {
    required?: number;
    available?: number;
    shortage?: number;
    photo_id?: string;
    price_points?: number;
    price_cash?: number;
  };
}

export interface MyPhotosResponse {
  success: boolean;
  data?: UserPhoto[];
  matched_count?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  error?: string;
}

// ============ SERVICE ============

export const userService = {
  // ============ USER BALANCE & WALLET ============
  
  async getBalance(): Promise<{ success: boolean; data?: UserBalance; error?: string }> {
    const response = await userApi.get('/user/balance');
    return response.data;
  },

  // ============ MY PHOTOS (MATCHED PHOTOS) ============

  async getMyPhotos(params?: { page?: number; limit?: number }): Promise<MyPhotosResponse> {
    const response = await userApi.get('/user/my-photos', { params });
    return response.data;
  },

  // ============ PHOTO PURCHASE ============

  async purchasePhoto(photoId: string, paymentMethod: 'cash' | 'points'): Promise<PurchaseResponse> {
    const response = await userApi.post(`/user/photos/${photoId}/purchase`, { 
      payment_method: paymentMethod 
    });
    return response.data;
  },

  // ============ PHOTO DOWNLOAD ============

  async downloadPhoto(photoId: string): Promise<void> {
    // This will trigger a redirect to the actual download URL
    const downloadUrl = `${userApi.defaults.baseURL}/user/photos/${photoId}/download`;
    const token = localStorage.getItem('auth_token');
    
    // Create a temporary link with authorization
    const link = document.createElement('a');
    link.href = `${downloadUrl}?token=${token}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async downloadPhotoBlob(photoId: string): Promise<Blob> {
    const response = await userApi.get(`/user/photos/${photoId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ============ FACE MATCHING ============

    async matchPhotos(data: MatchPhotosData): Promise<MyPhotosResponse> {
    const response = await userApi.post('/user/match-face', data);
    return response.data;
  },

  // ============ BROWSE EVENTS ============

  async browseEvents(): Promise<{ success: boolean; data?: EventBrowse[]; error?: string }> {
    const response = await userApi.get('/user/events');
    return response.data;
  },

  async getEventPhotos(eventId: string): Promise<MyPhotosResponse> {
    const response = await userApi.get(`/user/events/${eventId}/photos`);
    return response.data;
  },

  async getPhotoDetails(photoId: string): Promise<{ success: boolean; data?: PhotoDetail; error?: string }> {
    const response = await userApi.get(`/user/photos/${photoId}`);
    return response.data;
  },

  // ============ STATISTICS ============

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
