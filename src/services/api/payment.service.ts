import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';

const paymentApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
paymentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
paymentApi.interceptors.response.use(
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

export interface PointPackage {
  id: string;
  name: string;
  display_name: string;
  points_amount: number;
  price: number;
  bonus_points: number;
  description: string;
  sort_order: number;
}

export interface TopUpRequest {
  package_id: string;
}

export interface TopUpResponse {
  transaction_id: string;
  order_id: string;
  package: {
    name: string;
    points: number;
    bonus: number;
    total_points: number;
  };
  amount: number;
  payment_url: string;
  token: string;
  expired_at: string;
}

export interface TransactionStatus {
  id: string;
  transaction_type: 'point_topup' | 'photo_purchase';
  payment_method: 'cash' | 'points';
  amount: number;
  points_amount: number;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  midtrans_order_id: string;
  payment_url?: string;
  created_at: string;
  paid_at?: string;
  package_name?: string;
}

export interface PhotoPurchaseResponse {
  transaction_id: string;
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
  };
  download_url?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: 'point_topup' | 'photo_purchase';
  payment_method: 'cash' | 'points';
  amount: number;
  points_amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  midtrans_order_id: string;
  paid_at?: string;
  created_at: string;
}

export interface UserWallet {
  point_balance: number;
  total_points_earned: number;
  total_points_spent: number;
  total_spent_cash: number;
  total_transactions: number;
}

export interface WalletHistoryItem {
  id: string;
  wallet_type: 'user' | 'photographer';
  transaction_type: 'topup' | 'purchase' | 'earning' | 'withdrawal';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface PurchasedPhoto {
  id: string;
  photo_id: string;
  filename: string;
  ai_photo_id: string;
  event_name: string;
  event_date: string;
  photographer_name: string;
  purchase_price: number;
  payment_method: 'cash' | 'points';
  download_count: number;
  last_downloaded_at?: string;
  purchased_at: string;
}

export interface PhotographerWallet {
  balance: string | number;
  total_earned: string | number;
  total_withdrawn: string | number;
  pending_withdrawal: string | number;
  available_for_withdrawal: string | number;
  total_sales: string | number;
}

export interface EarningRecord {
  id: string;
  amount: number;
  photographer_share: number;
  photo_filename: string;
  event_name: string;
  buyer_name: string;
  paid_at: string;
}

export interface WithdrawalRequest {
  id: string;
  photographer_id?: string;
  business_name?: string;
  photographer_name?: string;
  photographer_email?: string;
  photographer_phone?: string;
  amount: number;
  bank_name: string;
  bank_account: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  admin_name?: string;
  admin_note?: string;
  transfer_proof_url?: string;
  requested_at: string;
  processed_at?: string;
  paid_at?: string;
}

export interface WithdrawalSummary {
  total_requests: number;
  pending_amount: number;
  pending_count: number;
  paid_amount: number;
  paid_count: number;
}

export interface PlatformSetting {
  value: string;
  description: string;
  updated_at: string;
}

export interface PlatformSettings {
  platform_fee_percentage: PlatformSetting;
  point_to_idr_rate: PlatformSetting;
  min_withdrawal_amount: PlatformSetting;
}

export interface MarketplaceRevenue {
  period: string;
  summary: {
    total_photo_sales: number;
    total_topups: number;
    photo_revenue: number;
    topup_revenue: number;
    total_platform_fee: number;
    total_photographer_share: number;
    unique_buyers: number;
    active_photographers: number;
  };
  daily_revenue: {
    date: string;
    photo_sales: number;
    topups: number;
    photo_revenue: number;
    topup_revenue: number;
    platform_fee: number;
    photographer_share: number;
  }[];
  by_photographer: {
    photographer_id: string;
    business_name: string;
    photographer_name: string;
    transaction_count: number;
    revenue: number;
  }[];
  by_payment_method: {
    payment_method: string;
    transaction_count: number;
    total_amount: number;
    avg_amount: number;
  }[];
}

export interface WalletStatistics {
  user_wallets: {
    total_wallets: number;
    total_points_in_system: number;
    all_time_points_earned: number;
    all_time_points_spent: number;
    avg_balance_per_user: number;
  };
  photographer_wallets: {
    total_wallets: number;
    total_balance: number;
    all_time_earned: number;
    all_time_withdrawn: number;
    pending_withdrawals: number;
    avg_balance_per_photographer: number;
  };
  top_point_holders: {
    user_id: string;
    full_name: string;
    point_balance: number;
  }[];
  top_earners: {
    photographer_id: string;
    business_name: string;
    total_earned: number;
  }[];
}

export interface WithdrawalAnalytics {
  period: string;
  summary: {
    total_requests: number;
    total_amount: number;
    pending_count: number;
    pending_amount: number;
    approved_count: number;
    approved_amount: number;
    paid_count: number;
    paid_amount: number;
    rejected_count: number;
    avg_withdrawal_amount: number;
  };
  daily_requests: {
    date: string;
    count: number;
    amount: number;
  }[];
  by_photographer: {
    photographer_id: string;
    business_name: string;
    request_count: number;
    total_amount: number;
  }[];
  processing_time: {
    avg_hours: number;
    min_hours: number;
    max_hours: number;
  };
}

// ============ PAGINATION ============

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============ SERVICE ============

export const paymentService = {
  // ============ PUBLIC ============
  
  async getPointPackages(): Promise<{ success: boolean; data?: PointPackage[]; error?: string }> {
    const response = await paymentApi.get('/payment/packages');
    return response.data;
  },

  // ============ USER WALLET ============

  async createTopUp(packageId: string): Promise<{ success: boolean; message?: string; data?: TopUpResponse; error?: string }> {
    const response = await paymentApi.post('/payment/topup', { package_id: packageId });
    return response.data;
  },

  async purchasePhoto(photoId: string, paymentMethod: 'cash' | 'points'): Promise<{ success: boolean; message?: string; data?: PhotoPurchaseResponse; error?: string }> {
    const response = await paymentApi.post('/payment/purchase', { photo_id: photoId, payment_method: paymentMethod });
    return response.data;
  },

  async getTransactionStatus(transactionId: string): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    const response = await paymentApi.get(`/payment/transaction/${transactionId}`);
    return response.data;
  },

  async getUserWallet(): Promise<{ 
    success: boolean; 
    data?: { 
      wallet: UserWallet; 
      purchased_photos_count: number; 
      recent_transactions: Transaction[] 
    }; 
    error?: string 
  }> {
    const response = await paymentApi.get('/payment/wallet');
    return response.data;
  },

  async getWalletHistory(params?: { 
    page?: number; 
    limit?: number; 
    type?: 'topup' | 'purchase' | 'earning' | 'withdrawal' 
  }): Promise<{ 
    success: boolean; 
    data?: WalletHistoryItem[]; 
    pagination?: PaginationInfo; 
    error?: string 
  }> {
    const response = await paymentApi.get('/payment/wallet/history', { params });
    return response.data;
  },

  async getPurchasedPhotos(params?: { 
    page?: number; 
    limit?: number 
  }): Promise<{ 
    success: boolean; 
    data?: PurchasedPhoto[]; 
    pagination?: PaginationInfo; 
    error?: string 
  }> {
    const response = await paymentApi.get('/payment/purchased', { params });
    return response.data;
  },

  // ============ PHOTOGRAPHER WALLET ============

  async getPhotographerWallet(): Promise<{ 
    success: boolean; 
    data?: { 
      wallet: PhotographerWallet; 
      recent_earnings: EarningRecord[]; 
      withdrawal_requests: WithdrawalRequest[] 
    }; 
    error?: string 
  }> {
    const response = await paymentApi.get('/payment/photographer/wallet');
    return response.data;
  },

  async requestWithdrawal(amount: number): Promise<{ 
    success: boolean; 
    message?: string; 
    data?: { 
      request_id: string; 
      amount: number; 
      status: string; 
      bank_name: string; 
      bank_account: string; 
      note: string 
    }; 
    error?: string 
  }> {
    const response = await paymentApi.post('/payment/photographer/withdraw', { amount });
    return response.data;
  },

  async getMyWithdrawals(params?: { 
    status?: 'pending' | 'approved' | 'paid' | 'rejected'; 
    page?: number; 
    limit?: number 
  }): Promise<{ 
    success: boolean; 
    data?: WithdrawalRequest[]; 
    pagination?: PaginationInfo; 
    error?: string 
  }> {
    const response = await paymentApi.get('/payment/photographer/withdrawals', { params });
    return response.data;
  },

  async cancelWithdrawal(requestId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await paymentApi.delete(`/payment/photographer/withdrawals/${requestId}`);
    return response.data;
  },

  // ============ ADMIN WITHDRAWAL MANAGEMENT ============

  async getAllWithdrawals(params?: { 
    status?: 'pending' | 'approved' | 'paid' | 'rejected'; 
    page?: number; 
    limit?: number 
  }): Promise<{ 
    success: boolean; 
    data?: WithdrawalRequest[]; 
    summary?: WithdrawalSummary; 
    pagination?: PaginationInfo; 
    error?: string 
  }> {
    const response = await paymentApi.get('/payment/admin/withdrawals', { params });
    return response.data;
  },

  async processWithdrawal(requestId: string, data: { 
    action: 'approve' | 'reject' | 'mark_paid'; 
    admin_note?: string; 
    transfer_proof_url?: string 
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await paymentApi.post(`/payment/admin/withdrawals/${requestId}`, data);
    return response.data;
  },

  // ============ ADMIN ANALYTICS ============

  async getMarketplaceRevenue(params?: { 
    period?: '7d' | '30d' | '90d' | '1y'; 
    photographer_id?: string 
  }): Promise<{ success: boolean; data?: MarketplaceRevenue; error?: string }> {
    const response = await paymentApi.get('/admin/revenue', { params });
    return response.data;
  },

  async getWalletStatistics(): Promise<{ success: boolean; data?: WalletStatistics; error?: string }> {
    const response = await paymentApi.get('/admin/wallets');
    return response.data;
  },

  async getWithdrawalAnalytics(params?: { 
    period?: '7d' | '30d' | '90d'; 
    status?: 'pending' | 'approved' | 'paid' | 'rejected' 
  }): Promise<{ success: boolean; data?: WithdrawalAnalytics; error?: string }> {
    const response = await paymentApi.get('/admin/withdrawals/analytics', { params });
    return response.data;
  },

  async getPlatformSettings(): Promise<{ success: boolean; data?: PlatformSettings; error?: string }> {
    const response = await paymentApi.get('/admin/settings');
    return response.data;
  },

  async updatePlatformSetting(settingKey: string, settingValue: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await paymentApi.put('/admin/settings', { setting_key: settingKey, setting_value: settingValue });
    return response.data;
  },
};
