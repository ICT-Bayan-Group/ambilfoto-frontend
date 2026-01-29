import axios from 'axios';

const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';

const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================
// INTERCEPTORS
// =====================
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// =====================
// TYPES
// =====================
export interface RegisterData {
  email: string;
  phone?: string;
  password: string;
  full_name: string;
  role?: 'user' | 'photographer';
}

export interface RegisterFaceData {
  face_image: string;
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
  role: 'user' | 'photographer' | 'admin';
  profile_photo?: string;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  photographer_id?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: UserProfile;
    token?: string;
    similarity?: number;
  };
  error?: string;
}

// =====================
// SERVICE
// =====================
export const authService = {
  /**
   * Register user (NO FACE)
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await authApi.post('/auth/register', data);
    return response.data;
  },

  /**
   * Register face after signup
   */
  async registerFace(faceImage: string): Promise<AuthResponse> {
    const response = await authApi.put('/auth/register/face', {
      face_image: faceImage,
    });
    return response.data;
  },

  /**
   * Login email/password
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await authApi.post('/auth/login', data);
    return response.data;
  },

  /**
   * Login using face biometric
   */
  async loginWithFace(data: FaceLoginData): Promise<AuthResponse> {
    const response = await authApi.post('/auth/login/face', data);
    return response.data;
  },

  /**
   * Get logged-in user profile
   */
  async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
    const response = await authApi.get('/auth/profile');
    return response.data;
  },

  async verifyToken(): Promise<{ success: boolean; data: any }> {
    const response = await authApi.get('/auth/verify');
    return response.data;
  },

  async updateProfile(data: {
    full_name?: string;
    phone?: string;
    profile_photo?: string;
  }): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    const response = await authApi.put('/auth/profile', data);
    return response.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await authApi.put('/auth/profile/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Update face after login (security)
   */
  async updateFaceBiometric(
    faceImage: string,
    password: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await authApi.put('/auth/profile/face', {
      face_image: faceImage,
      password,
    });
    return response.data;
  },

  async deleteAccount(
    password: string,
    confirmation: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await authApi.delete('/auth/profile', {
      data: { password, confirmation },
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};
