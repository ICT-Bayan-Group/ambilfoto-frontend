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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
  dashboard_url?: string;
}

// Backend returns limits nested; getOverview() normalises them to flat fields.
export interface Subscription {
  id: string;
  status: 'active' | 'expired' | 'cancelled';
  plan_id: string;
  plan_slug: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  features: string[];
  // Flat — available after getOverview() normalisation
  storage_gb: number;
  upload_limit: number;
  rate_limit_rpm: number;
  sla_hours: number;
  support_level: string;
  // Nested — as originally returned by backend (kept for reference)
  limits?: {
    storage_gb: number;
    upload_limit: number;
    rate_limit_rpm: number;
    sla_hours: number;
    support_level: string;
  };
}

export interface UsageStat {
  storage: {
    used_mb: number;
    used_gb: number;   // pre-calculated by getOverview()
    limit_gb: number;
    pct: number;
  };
  uploads: {
    used: number;
    limit: number;
    pct: number;
  };
  today_requests: number;
  error_rate_24h: number;
  this_month: { used_mb: number; upload_count: number };
}

// FIX: field names match backend response AND all component usage:
//   - key_type  (not `type`)       — used by DeveloperKeys, DeveloperPlayground, DeveloperDashboard
//   - key_preview (not `preview`)  — stored by backend
export interface ApiKey {
  id: string;
  key_type: 'dev' | 'prod';
  key_prefix: string;
  key_preview: string;
  status: 'active' | 'expired' | 'revoked' | 'inactive';
  is_active: boolean;
  created_at: string;
  expires_at: string;
  last_used_at: string | null;
  request_count: number;
}

// FIX: `keys` (not `api_keys`) — matches backend getOverview response
//      and fixes DeveloperDashboard.tsx `overview?.api_keys` → `overview?.keys`
export interface DeveloperOverview {
  developer: DeveloperProfile;
  subscription: Subscription | null;
  usage: UsageStat;
  keys: ApiKey[];
}

export interface Invoice {
  id: string;
  invoice_number: string;
  plan_name: string;
  plan_slug: string;
  amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paid_at: string | null;
  created_at: string;
  expired_at: string | null;
  pdf_url: string | null;
}

// FIX: getInvoices() returns this shape directly (flat, not nested under `data`).
//   DeveloperBilling.tsx accesses: res.data.invoices + res.data.pagination.pages
//   → Now we match that exact shape.
export interface InvoicesResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;   // normalised from total_pages
    };
  };
}

export interface SubscribeResponse {
  invoice_id: string;
  invoice_number: string;
  developer_id: string;
  plan: {
    id: string;
    slug: string;
    name: string;
    price: number;
    price_formatted: string;
  };
  payment_url: string;
  token: string;
  expired_at: string;
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
  by_endpoint: { endpoint: string; count: number; avg_ms: number; errors: number }[];
  daily_trend: { date: string; requests: number; errors: number }[];
}

export interface RealtimeUsage {
  uploads: { used: number; limit: number; remaining: number | null; pct: number };
  storage: { used_mb: number; limit_mb: number; remaining_mb: number; pct: number };
  expires_in_days: number;
}

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

export interface InvoiceStatus {
  invoice_id: string;
  invoice_number: string;
  status: 'pending' | 'paid' | 'cancelled';
  amount: number;
  plan_name: string;
  plan_slug: string;
  developer_id: string;
  paid_at: string | null;
  created_at: string;
  subscription_active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getInvoicePdfUrl(developerId: string, invoiceId: string): string {
  return `${AUTH_API_URL}/developer/${developerId}/invoices/${invoiceId}/pdf`;
}

/**
 * Trigger browser Save-As download for a receipt PDF.
 * Uses fetch (not <a href>) so the JWT Authorization header is sent.
 */
export async function downloadInvoicePdf(
  developerId: string,
  invoiceId: string,
  invoiceNumber: string
): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(getInvoicePdfUrl(developerId, invoiceId), {
    method: 'GET',
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try { const e = await response.json(); msg = e?.error ?? e?.message ?? msg; } catch {}
    throw new Error(msg);
  }

  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `AmbilFoto_Receipt_${invoiceNumber.replace(/[^A-Z0-9\-]/gi, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const developerService = {

  // ── Plans ─────────────────────────────────────────────────────────────────

  async getPlans(): Promise<{ success: boolean; data: Plan[] }> {
    const res = await authApi.get('/developer/plans');
    return res.data;
  },

  async calculateOrder(planId: string): Promise<{ success: boolean; data: OrderBreakdown }> {
    const res = await authApi.get('/developer/calculate-order', { params: { plan_id: planId } });
    return res.data;
  },

  // ── Identity ──────────────────────────────────────────────────────────────

  async getMe(): Promise<{
    success: boolean;
    has_developer_account: boolean;
    data: DeveloperMe | null;
  }> {
    const res = await authApi.get('/developer/me');
    return res.data;
  },

  // ── Subscription ──────────────────────────────────────────────────────────

  async subscribe(
    planId: string,
    companyName?: string
  ): Promise<{ success: boolean; error?: string; data: SubscribeResponse }> {
    const res = await authApi.post('/developer/subscribe', { plan_id: planId, company_name: companyName });
    return res.data;
  },

  async renew(planId: string): Promise<{ success: boolean; data: SubscribeResponse }> {
    const res = await authApi.post('/developer/renew', { plan_id: planId });
    return res.data;
  },

  async reconcilePayment(orderId: string): Promise<{
    success: boolean; message: string;
    data: { invoice_id: string; invoice_number: string; activated: boolean; midtrans_status: string };
  }> {
    const res = await authApi.post(`/developer/reconcile/${orderId}`);
    return res.data;
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getOverview(developerId: string): Promise<{ success: boolean; data: DeveloperOverview }> {
    const res = await authApi.get(`/developer/${developerId}`);
    const raw = res.data;

    // Normalise: flatten subscription.limits → top-level fields
    // so DeveloperDashboard can use sub.storage_gb / sub.rate_limit_rpm directly
    if (raw?.data?.subscription?.limits) {
      const lim = raw.data.subscription.limits;
      const sub = raw.data.subscription;
      raw.data.subscription = {
        ...sub,
        storage_gb:     sub.storage_gb     ?? lim.storage_gb,
        upload_limit:   sub.upload_limit   ?? lim.upload_limit,
        rate_limit_rpm: sub.rate_limit_rpm ?? lim.rate_limit_rpm,
        sla_hours:      sub.sla_hours      ?? lim.sla_hours,
        support_level:  sub.support_level  ?? lim.support_level,
      };
    }

    // Ensure usage.storage.used_gb is pre-calculated
    if (raw?.data?.usage?.storage) {
      const s = raw.data.usage.storage;
      s.used_gb  = s.used_gb  ?? Math.round((s.used_mb / 1024) * 100) / 100;
      s.limit_gb = s.limit_gb ?? (raw.data.subscription?.storage_gb ?? 0);
    }

    return raw;
  },

  async updateProfile(
    developerId: string,
    data: { company_name?: string; website?: string; description?: string; contact_phone?: string }
  ): Promise<{ success: boolean; message: string }> {
    const res = await authApi.put(`/developer/${developerId}/profile`, data);
    return res.data;
  },

  // ── Invoices ──────────────────────────────────────────────────────────────

  // FIX: returns { success, data: { invoices, pagination: { pages } } }
  // to match exactly what DeveloperBilling.tsx accesses:
  //   res.data.invoices
  //   res.data.pagination.pages
  async getInvoices(developerId: string, page = 1, limit = 10): Promise<InvoicesResponse> {
    const res = await authApi.get(`/developer/${developerId}/invoices`, { params: { page, limit } });
    const raw = res.data;

    // Backend returns: { success, data: Invoice[], pagination: { total, page, limit, total_pages } }
    const invoices: Invoice[] = Array.isArray(raw?.data) ? raw.data : (raw?.data?.invoices ?? []);
    const pg = raw?.pagination ?? raw?.data?.pagination ?? {};

    return {
      success: raw?.success ?? true,
      data: {
        invoices,
        pagination: {
          total: pg.total       ?? invoices.length,
          page:  pg.page        ?? page,
          limit: pg.limit       ?? limit,
          pages: pg.total_pages ?? pg.pages ?? 1,
        },
      },
    };
  },

  async getInvoiceStatus(invoiceId: string): Promise<{ success: boolean; data: InvoiceStatus }> {
    const res = await authApi.get(`/developer/invoice/${invoiceId}/status`);
    return res.data;
  },

  // ── PDF Receipt ───────────────────────────────────────────────────────────

  /**
   * Download receipt PDF and trigger browser Save-As dialog.
   *
   * @example
   * const [pdfLoading, setPdfLoading] = useState<string | null>(null);
   * await developerService.downloadReceiptPdf(
   *   developerId, invoice.id, invoice.invoice_number,
   *   (v) => setPdfLoading(v ? invoice.id : null),
   *   (msg) => toast({ title: msg, variant: 'destructive' })
   * );
   */
  async downloadReceiptPdf(
    developerId: string,
    invoiceId: string,
    invoiceNumber: string,
    setLoading?: (v: boolean) => void,
    onError?: (message: string) => void
  ): Promise<boolean> {
    try {
      setLoading?.(true);
      await downloadInvoicePdf(developerId, invoiceId, invoiceNumber);
      return true;
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Gagal mengunduh PDF');
      return false;
    } finally {
      setLoading?.(false);
    }
  },

  getReceiptPdfUrl: getInvoicePdfUrl,

  // ── API Keys ──────────────────────────────────────────────────────────────

  async getKeys(developerId: string): Promise<{ success: boolean; data: ApiKey[] }> {
    const res = await authApi.get(`/developer/${developerId}/keys`);
    return res.data;
  },

  async regenerateKey(
    developerId: string,
    keyType: 'dev' | 'prod'
  ): Promise<{
    success: boolean;
    message: string;
    data: { key_id: string; raw_key: string; preview: string; expires_at: string; key_type: 'dev' | 'prod' };
  }> {
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

  // ── Usage ─────────────────────────────────────────────────────────────────

  async getUsageAnalytics(
    developerId: string,
    days = 30
  ): Promise<{ success: boolean; data: UsageAnalytics }> {
    const res = await authApi.get(`/developer/${developerId}/usage`, { params: { days } });
    const raw = res.data;

    // Normalise field names from backend
    if (raw?.success && raw?.data?.totals) {
      const t = raw.data.totals;
      const requests = t.total_requests   ?? t.requests ?? 0;
      const success  = t.success_requests ?? t.success  ?? 0;
      const errors   = t.error_requests   ?? t.errors   ?? 0;
      return {
        success: true,
        data: {
          ...raw.data,
          totals: {
            requests, success, errors,
            avg_response_ms: t.avg_response_ms ?? 0,
            success_rate: t.success_rate ?? (requests > 0 ? Math.round((success / requests) * 1000) / 10 : 0),
          },
        },
      };
    }
    return raw;
  },

  async getRealtimeUsage(
    developerId: string
  ): Promise<{ success: boolean; data: RealtimeUsage | null }> {
    const res = await authApi.get(`/developer/${developerId}/usage/realtime`);
    return res.data;
  },
};