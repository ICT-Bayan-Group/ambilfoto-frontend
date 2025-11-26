import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api';

const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
authApi.interceptors.response.use(
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

export interface RegisterData {
  email: string;
  phone?: string;
  password: string;
  full_name: string;
  face_image: string;
  role?: 'user' | 'photographer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface FaceLoginData {
  face_image: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: string;
  profile_photo?: string;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: UserProfile;
    token: string;
    similarity?: number;
  };
  error?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await authApi.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await authApi.post('/auth/login', data);
    return response.data;
  },

  async loginWithFace(data: FaceLoginData): Promise<AuthResponse> {
    const response = await authApi.post('/auth/login/face', data);
    return response.data;
  },

  async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
    const response = await authApi.get('/auth/profile');
    return response.data;
  },

  async verifyToken(): Promise<{ success: boolean; data: any }> {
    const response = await authApi.get('/auth/verify');
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};
