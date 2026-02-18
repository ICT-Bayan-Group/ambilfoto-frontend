import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api';

const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  slug: string;
  name: string;
  storage_gb: number;
  upload_limit: number;
  price: number;
  price_formatted: string;
  upload_label: string;
  storage_label: string;
  rate_limit_rpm: number;
  sla_hours: number;
  support_level: string;
  is_custom: number;
  features: string[];
}

export interface DeveloperProfile {
  id: string;
  user_id: number;
  company_name: string;
  website: string;
  email: string;
  full_name: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'expired' | 'cancelled';
  plan_id: string;
  plan_slug: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  storage_gb: number;
  upload_limit: number;
  rate_limit_rpm: number;
  sla_hours: number;
  support_level: string;
  features: string[];
}

export interface UsageStat {
  storage: { used_mb: number; limit_mb: number; pct: number };
  uploads: { used: number; limit: number; pct: number };
  today_requests: number;
  error_rate_24h: number;
}

export interface ApiKey {
  id: string;
  key_type: 'dev' | 'prod';
  key_prefix: string;
  status: 'active' | 'expired' | 'revoked';
  is_active: boolean;
  created_at: string;
  expires_at: string;
  last_used_at: string | null;
  request_count: number;
  revoked_at: string | null;
  revoke_reason: string | null;
}

export interface DeveloperOverview {
  developer: DeveloperProfile;
  subscription: Subscription | null;
  usage: UsageStat | null;
  current_month: { used_mb: number; upload_count: number } | null;
  api_keys: ApiKey[];
}

export interface Invoice {
  id: string;
  invoice_number: string;
  plan_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paid_at: string | null;
  created_at: string;
  expires_at: string;
}

export interface SubscribeResponse {
  invoice_id: string;
  invoice_number: string;
  order_id: string;
  plan: { id: string; name: string; price: number; price_formatted: string };
  developer_id: string;
  payment_url: string;
  token: string;
}

export interface UsageAnalytics {
  period_days: number;
  totals: {
    requests: number;
    success: number;
    errors: number;
    success_rate: number;
    avg_response_ms: number;
  };
  by_endpoint: { endpoint: string; count: number; errors: number }[];
  daily_trend: { date: string; requests: number; errors: number }[];
}

export interface RealtimeUsage {
  uploads: { used: number; limit: number; remaining: number; pct: number };
  storage: { used_mb: number; limit_mb: number; remaining_mb: number; pct: number };
  expires_in_days: number;
  subscription_end: string;
}

// ─── Types baru untuk calculateOrder & getMe ─────────────────────────────────

export interface OrderBreakdown {
  plan: {
    id: string;
    slug: string;
    name: string;
    storage_gb: number;
    upload_limit: number;
    rate_limit_rpm: number;
    support_level: string;
    features: string[];
  };
  breakdown: {
    subtotal: number;
    subtotal_formatted: string;
    ppn_rate: number;
    ppn: number;
    ppn_formatted: string;
    service_fee: number;
    service_fee_formatted: string;
    total: number;
    total_formatted: string;
  };
  period_days: number;
  note: string;
}

export interface DeveloperMe {
  developer_id: string;
  company_name: string;
  website: string;
  subscription: {
    id: string;
    status: 'active' | 'expired' | 'cancelled';
    plan_slug: string;
    plan_name: string;
    end_date: string;
    days_remaining: number;
  } | null;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const developerService = {
  // Plans
  async getPlans(): Promise<{ success: boolean; data: Plan[] }> {
    const res = await authApi.get('/developer/plans');
    return res.data;
  },

  // ✅ Hitung breakdown harga sebelum bayar (subtotal + PPN + service fee)
  async calculateOrder(planId: string): Promise<{ success: boolean; data: OrderBreakdown }> {
    const res = await authApi.get('/developer/calculate-order', {
      params: { plan_id: planId },
    });
    return res.data;
  },

  // ✅ Cek apakah user sudah punya developer account & subscription aktif
  async getMe(): Promise<{ success: boolean; has_developer_account: boolean; data: DeveloperMe | null }> {
    const res = await authApi.get('/developer/me');
    return res.data;
  },

  // Subscribe
  async subscribe(planId: string, companyName?: string): Promise<{ success: boolean; data: SubscribeResponse }> {
    const res = await authApi.post('/developer/subscribe', {
      plan_id: planId,
      company_name: companyName,
    });
    return res.data;
  },

  // Renew
  async renew(planId: string): Promise<{ success: boolean; data: SubscribeResponse }> {
    const res = await authApi.post('/developer/renew', { plan_id: planId });
    return res.data;
  },

  // Overview
  async getOverview(developerId: string): Promise<{ success: boolean; data: DeveloperOverview }> {
    const res = await authApi.get(`/developer/${developerId}`);
    return res.data;
  },

  // Update profile
  async updateProfile(
    developerId: string,
    data: { company_name?: string; website?: string; description?: string; contact_phone?: string }
  ): Promise<{ success: boolean; message: string }> {
    const res = await authApi.put(`/developer/${developerId}/profile`, data);
    return res.data;
  },

  // Invoices
  async getInvoices(
    developerId: string,
    page = 1,
    limit = 10
  ): Promise<{ success: boolean; data: { invoices: Invoice[]; pagination: { total: number; page: number; limit: number; pages: number } } }> {
    const res = await authApi.get(`/developer/${developerId}/invoices`, { params: { page, limit } });
    return res.data;
  },

  // Invoice status (setelah redirect dari Midtrans)
  async getInvoiceStatus(invoiceId: string): Promise<{ success: boolean; data: {
    invoice_id: string;
    invoice_number: string;
    status: 'pending' | 'paid' | 'cancelled';
    amount: number;
    plan_name: string;
    plan_slug: string;
    developer_id: string;
    paid_at: string | null;
    subscription_active: boolean;
  }}> {
    const res = await authApi.get(`/developer/invoice/${invoiceId}/status`);
    return res.data;
  },

  // API Keys
  async getKeys(developerId: string): Promise<{ success: boolean; data: ApiKey[] }> {
    const res = await authApi.get(`/developer/${developerId}/keys`);
    return res.data;
  },

  async regenerateKey(
    developerId: string,
    keyType: 'dev' | 'prod'
  ): Promise<{ success: boolean; data: { key_type: string; raw_key: string; key_prefix: string; expires_at: string }; warning: string }> {
    const res = await authApi.post(`/developer/${developerId}/key/regenerate`, { key_type: keyType });
    return res.data;
  },

  async revokeKey(
    developerId: string,
    keyId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await authApi.post(`/developer/${developerId}/key/revoke`, { key_id: keyId, reason });
    return res.data;
  },

  // Usage Analytics
  async getUsageAnalytics(
    developerId: string,
    days = 30
  ): Promise<{ success: boolean; data: UsageAnalytics }> {
    const res = await authApi.get(`/developer/${developerId}/usage`, { params: { days } });
    return res.data;
  },

  async getRealtimeUsage(developerId: string): Promise<{ success: boolean; data: RealtimeUsage }> {
    const res = await authApi.get(`/developer/${developerId}/usage/realtime`);
    return res.data;
  },
};