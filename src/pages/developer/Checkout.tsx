/**
 * DeveloperCheckout.tsx (UPDATED — billing cycle support)
 *
 * Perubahan dari versi sebelumnya:
 *  - Baca billing_cycle dari URL query (?billing_cycle=yearly)
 *  - Tampilkan toggle monthly/yearly di halaman checkout
 *  - Harga yang ditampilkan berubah sesuai billing_cycle
 *  - subscribe() dipanggil dengan billing_cycle
 *  - Tampilkan savings amount jika yearly
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { developerService, BillingCycle } from "@/services/api/developer.service";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ShieldCheck,
  Receipt,
  CreditCard,
  Clock,
  Zap,
  Check,
  AlertCircle,
  Lock,
  ChevronRight,
  Info,
  Tag,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OrderBreakdown {
  plan: {
    id: string;
    slug: string;
    name: string;
    color_tag?: string;
    api_hit_limit: number;
    rate_limit_rpm: number;
    sla_label: string;
    support_channel: string;
    support_level: string;
    features: string[];
    // Legacy compat
    storage_gb?: number;
    upload_limit?: number;
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
    // NEW
    billing_cycle: BillingCycle;
    price_per_month: number;
    price_per_month_formatted: string;
    savings_amount: number;
    savings_formatted: string;
    discount_pct: number;
    duration_days: number;
  };
  period_days: number;
  note: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function LineItem({
  label,
  value,
  sub,
  bold,
  large,
  border,
  green,
}: {
  label: string;
  value: string;
  sub?: string;
  bold?: boolean;
  large?: boolean;
  border?: boolean;
  green?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 ${border ? "border-t border-dashed border-slate-200 mt-1" : ""}`}>
      <div>
        <p className={`${large ? "text-base" : "text-sm"} ${bold ? "font-bold text-slate-800" : "text-slate-600"}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <p className={`shrink-0 tabular-nums ${large ? "text-lg font-extrabold text-blue-600" : ""} ${bold && !large ? "font-bold text-slate-800" : ""} ${!bold && !large ? "text-sm text-slate-700" : ""} ${green ? "!text-emerald-600 font-semibold" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-600">
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-emerald-600" />
      </div>
      {text}
    </div>
  );
}

// Billing Cycle mini toggle di checkout
function CycleToggle({
  value,
  onChange,
  discountPct,
}: {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
  discountPct?: number;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 w-fit mx-auto">
      {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
        <button
          key={cycle}
          onClick={() => onChange(cycle)}
          className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            value === cycle
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {cycle === 'monthly' ? 'Bulanan' : 'Tahunan'}
          {cycle === 'yearly' && discountPct && discountPct > 0 && (
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold leading-none">
              -{discountPct}%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const DeveloperCheckout = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan_id") ?? "";

  // NEW: baca billing_cycle dari URL, default monthly
  const initialCycle = (searchParams.get("billing_cycle") as BillingCycle) ?? "monthly";

  const navigate   = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast }  = useToast();
  const { pay, isLoaded } = useMidtransSnap();

  const [order,         setOrder]         = useState<OrderBreakdown | null>(null);
  const [loadingOrder,  setLoadingOrder]  = useState(true);
  const [companyName,   setCompanyName]   = useState("");
  const [paying,        setPaying]        = useState(false);
  const [hasActiveSub,  setHasActiveSub]  = useState(false);
  // NEW: billing cycle state — bisa diubah di halaman ini juga
  const [billingCycle,  setBillingCycle]  = useState<BillingCycle>(initialCycle);

  /* ── Guard: harus login ── */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/developer/checkout?plan_id=${planId}&billing_cycle=${billingCycle}`, { replace: true });
    }
  }, [isAuthenticated]);

  /* ── Load order breakdown — re-fetch saat billing_cycle berubah ── */
  useEffect(() => {
    if (!planId) {
      navigate("/developer/pricing");
      return;
    }
    setLoadingOrder(true);
    developerService
      .calculateOrder(planId, billingCycle)   // NEW: kirim billing_cycle
      .then((res) => {
        if (res.success) setOrder(res.data);
        else navigate("/developer/pricing");
      })
      .catch(() => navigate("/developer/pricing"))
      .finally(() => setLoadingOrder(false));
  }, [planId, billingCycle]);   // re-run saat billingCycle berubah

  /* ── Cek subscription aktif ── */
  useEffect(() => {
    if (!isAuthenticated) return;
    developerService.getMe().then((res) => {
      if (res.success && res.data?.subscription?.status === "active") {
        setHasActiveSub(true);
      }
    });
  }, [isAuthenticated]);

  /* ── Handler bayar ── */
  const handlePay = async () => {
    if (!order) return;
    setPaying(true);

    try {
      // NEW: kirim billing_cycle ke subscribe()
      const res = await developerService.subscribe(order.plan.id, billingCycle, companyName || undefined);

      if (!res.success) {
        toast({
          title: "Gagal membuat order",
          description: res.error ?? "Silakan coba lagi",
          variant: "destructive",
        });
        setPaying(false);
        return;
      }

      const { token, payment_url, developer_id } = res.data;
      const invoiceId = res.data.invoice_id;

      const goToFinish = () =>
        navigate(`/developer/payment/finish?invoice_id=${invoiceId}&developer_id=${developer_id}`);

      if (isLoaded && token) {
        await pay(token, {
          onSuccess: goToFinish,
          onPending: goToFinish,
          onError: (result) => {
            console.error('Midtrans payment error:', result);
            toast({
              title: "Pembayaran gagal",
              description: "Silakan coba lagi atau pilih metode pembayaran lain.",
              variant: "destructive",
            });
            setPaying(false);
          },
          onClose: async () => {
            try {
              const statusRes = await developerService.getInvoiceStatus(invoiceId);
              if (statusRes.success && statusRes.data.subscription_active) {
                goToFinish();
              } else {
                setPaying(false);
              }
            } catch {
              setPaying(false);
            }
          },
        });
      } else {
        window.location.href = payment_url;
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Terjadi kesalahan";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setPaying(false);
    }
  };

  /* ─────────────────────────────────────────────
     Loading skeleton
  ───────────────────────────────────────────── */
  if (loadingOrder) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex-1 container max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 rounded-xl" />
              <Skeleton className="h-4 w-72 rounded-xl" />
              <Skeleton className="h-12 w-56 rounded-xl mx-auto" />
              <Skeleton className="h-[280px] rounded-2xl" />
              <Skeleton className="h-[160px] rounded-2xl" />
            </div>
            <Skeleton className="h-[460px] rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const { plan, breakdown, period_days } = order;
  const isYearly   = billingCycle === 'yearly';
  const hasSavings = isYearly && breakdown.savings_amount > 0;

  /* ─────────────────────────────────────────────
     Main render
  ───────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Header />

      <main className="flex-1 py-10">
        <div className="container max-w-5xl mx-auto px-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link
              to="/developer/pricing"
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Pilih Paket
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-700">Review Order</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-400">Pembayaran</span>
          </div>

          {/* Active sub warning */}
          {hasActiveSub && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Kamu sudah punya subscription aktif</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Melanjutkan pembayaran akan me-renew subscription ke paket <strong>{plan.name}</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">

            {/* ══ KIRI ══ */}
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Review Order</h1>
                <p className="text-sm text-slate-500 mt-1">Periksa detail sebelum melanjutkan ke pembayaran.</p>
              </div>

              {/* ── Billing cycle toggle ── */}
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <p className="text-sm font-bold text-slate-700 text-center mb-4">Pilih Siklus Pembayaran</p>
                <CycleToggle
                  value={billingCycle}
                  onChange={setBillingCycle}
                  discountPct={breakdown.discount_pct}
                />
                {hasSavings && (
                  <div className="mt-4 flex items-center gap-2 justify-center rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm text-emerald-700">
                      Kamu hemat <strong>{breakdown.savings_formatted}</strong> dengan pembayaran tahunan
                    </p>
                  </div>
                )}
              </div>

              {/* Plan detail card */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Paket yang dipilih</p>
                      <h2 className="text-2xl font-extrabold text-white">{plan.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-white">{breakdown.price_per_month_formatted}</p>
                      <p className="text-xs text-blue-200">per bulan</p>
                      {isYearly && (
                        <p className="text-xs text-blue-200 mt-0.5">
                          Dibayar {breakdown.subtotal_formatted} / tahun
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan specs */}
                <div className="px-6 py-5 grid grid-cols-3 gap-4 border-b border-slate-100">
                  {[
                    {
                      label: "API Hit / bulan",
                      value: plan.api_hit_limit > 0 ? plan.api_hit_limit.toLocaleString("id-ID") : "∞",
                      icon: "🎯",
                    },
                    {
                      label: "Rate Limit",
                      value: `${plan.rate_limit_rpm} rpm`,
                      icon: "⚡",
                    },
                    {
                      label: "SLA",
                      value: plan.sla_label || `${plan.support_level}`,
                      icon: "🛡️",
                    },
                  ].map((spec) => (
                    <div key={spec.label} className="text-center">
                      <p className="text-2xl mb-1">{spec.icon}</p>
                      <p className="text-base font-bold text-slate-800">{spec.value}</p>
                      <p className="text-xs text-slate-500">{spec.label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {plan.features.map((f) => <FeatureRow key={f} text={f} />)}
                </div>
              </div>

              {/* Company name input */}
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Detail Akun Developer</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Akan muncul di invoice dan dashboard kamu.</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Email</Label>
                  <Input
                    value={user?.email ?? ""}
                    disabled
                    className="rounded-xl bg-slate-50 text-slate-500 border-slate-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company" className="text-xs font-semibold text-slate-600">
                    Nama Perusahaan <span className="font-normal text-slate-400">(opsional)</span>
                  </Label>
                  <Input
                    id="company"
                    placeholder="PT Contoh Teknologi"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100 text-sm"
                  />
                </div>
              </div>

              {/* Info notes */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 space-y-2">
                <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Yang perlu kamu ketahui
                </p>
                {[
                  "API Keys dikirim ke email setelah pembayaran berhasil",
                  "Subscription aktif langsung otomatis via webhook Midtrans",
                  "Tidak ada auto-renew — kamu perpanjang manual kapan saja",
                  "Upload count reset setiap awal periode baru",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-blue-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ KANAN: Order summary ══ */}
            <div className="sticky top-6 space-y-4">

              {/* Receipt card */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800">Ringkasan Pembayaran</h3>
                </div>

                <div className="px-6 pb-5 pt-2 divide-y divide-slate-100">
                  {/* Durasi */}
                  <LineItem
                    label={`Paket ${plan.name}`}
                    value={breakdown.price_per_month_formatted}
                    sub={`${isYearly ? 'per bulan (dibayar tahunan)' : 'per bulan'}`}
                  />

                  {/* Subtotal */}
                  <LineItem
                    label={isYearly ? "Subtotal (12 bulan)" : "Subtotal"}
                    value={breakdown.subtotal_formatted}
                    sub={`Berlaku ${breakdown.duration_days ?? period_days} hari`}
                  />

                  {/* Savings — hanya tampil jika yearly */}
                  {hasSavings && (
                    <LineItem
                      label={`Diskon Tahunan (${breakdown.discount_pct}%)`}
                      value={`- ${breakdown.savings_formatted}`}
                      green
                    />
                  )}

                  {/* PPN */}
                  <LineItem
                    label={`PPN ${breakdown.ppn_rate}%`}
                    value={breakdown.ppn_formatted}
                    sub="Pajak Pertambahan Nilai"
                  />

                  {/* Service fee */}
                  <LineItem
                    label="Biaya Layanan"
                    value={breakdown.service_fee_formatted}
                    sub="Platform & payment processing"
                  />

                  {/* Total */}
                  <LineItem
                    label="Total Pembayaran"
                    value={breakdown.total_formatted}
                    bold
                    large
                    border
                  />
                </div>
              </div>

              {/* Validity badge */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Aktif {breakdown.duration_days ?? period_days} hari
                  </p>
                  <p className="text-xs text-slate-500">Mulai dari tanggal pembayaran berhasil</p>
                </div>
              </div>

              {/* Bayar button */}
              <Button
                onClick={handlePay}
                disabled={paying}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base
                  shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {paying ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Membuka payment gateway...
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5" />
                    Bayar {breakdown.total_formatted}
                  </span>
                )}
              </Button>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Lock className="w-3 h-3" /> SSL Encrypted
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-3 h-3" /> Powered by Midtrans
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Zap className="w-3 h-3" /> Instan
                </div>
              </div>

              {/* Payment methods */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-center text-xs text-slate-400 font-medium mb-2">Metode pembayaran tersedia</p>
                <div className="flex flex-wrap gap-2 justify-center text-xs font-semibold">
                  {["BCA VA", "Mandiri VA", "BNI VA", "GoPay", "QRIS", "Kartu Kredit", "Alfamart", "Indomaret"].map((m) => (
                    <span key={m} className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 leading-relaxed px-2">{order.note}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DeveloperCheckout;