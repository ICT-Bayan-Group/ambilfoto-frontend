/**
 * DeveloperCheckout.tsx
 *
 * Halaman review order sebelum bayar ke Midtrans.
 * Alur:
 *   1. Ambil plan_id dari URL query (?plan_id=xxx)
 *   2. GET /api/developer/calculate-order?plan_id=xxx → tampilkan breakdown
 *   3. GET /api/developer/me → cek apakah sudah ada subscription aktif
 *   4. User klik "Bayar" → POST /api/developer/subscribe → buka Midtrans Snap
 *   5. Setelah bayar → redirect ke /developer/:developerId (dashboard)
 *
 * Dipanggil dari DeveloperPricing.tsx:
 *   navigate(`/developer/checkout?plan_id=${plan.id}`)
 *
 * Route yang perlu ditambahkan di router:
 *   <Route path="/developer/checkout" element={<DeveloperCheckout />} />
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { developerService } from "@/services/api/developer.service";
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
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
interface OrderBreakdown {
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

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
function LineItem({
  label,
  value,
  sub,
  bold,
  large,
  border,
}: {
  label: string;
  value: string;
  sub?: string;
  bold?: boolean;
  large?: boolean;
  border?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3
        ${border ? "border-t border-dashed border-slate-200 mt-1" : ""}
      `}
    >
      <div>
        <p
          className={`${large ? "text-base" : "text-sm"} ${
            bold ? "font-bold text-slate-800" : "text-slate-600"
          }`}
        >
          {label}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <p
        className={`shrink-0 tabular-nums ${
          large ? "text-lg font-extrabold text-blue-600" : ""
        } ${bold && !large ? "font-bold text-slate-800" : ""} ${
          !bold && !large ? "text-sm text-slate-700" : ""
        }`}
      >
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

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
const DeveloperCheckout = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan_id") ?? "";

  const navigate   = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast }  = useToast();
  const { pay, isLoaded } = useMidtransSnap();

  const [order,         setOrder]         = useState<OrderBreakdown | null>(null);
  const [loadingOrder,  setLoadingOrder]  = useState(true);
  const [companyName,   setCompanyName]   = useState("");
  const [paying,        setPaying]        = useState(false);
  const [hasActiveSub,  setHasActiveSub]  = useState(false);

  /* ── Guard: harus login ── */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/developer/checkout?plan_id=${planId}`, {
        replace: true,
      });
    }
  }, [isAuthenticated]);

  /* ── Load order breakdown ── */
  useEffect(() => {
    if (!planId) {
      navigate("/developer/pricing");
      return;
    }
    setLoadingOrder(true);
    developerService
      .calculateOrder(planId)
      .then((res) => {
        if (res.success) setOrder(res.data);
        else navigate("/developer/pricing");
      })
      .catch(() => navigate("/developer/pricing"))
      .finally(() => setLoadingOrder(false));
  }, [planId]);

  /* ── Cek apakah sudah punya subscription aktif ── */
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
      const res = await developerService.subscribe(order.plan.id, companyName || undefined);

      if (!res.success) {
        toast({
          title: "Gagal membuat order",
          description: "Silakan coba lagi",
          variant: "destructive",
        });
        setPaying(false);
        return;
      }

      const { token, payment_url, developer_id, invoice_id } = res.data;

      if (isLoaded && token) {
        // Buka Midtrans Snap popup
        pay(token, {
          onSuccess: () =>
            navigate(`/developer/payment/finish?invoice_id=${invoice_id}&developer_id=${developer_id}`),
          onPending: () =>
            navigate(`/developer/payment/pending?invoice_id=${invoice_id}&developer_id=${developer_id}`),
          onError: () => {
            toast({ title: "Pembayaran gagal", variant: "destructive" });
            setPaying(false);
          },
          onClose: () => setPaying(false),
        });
      } else if (payment_url) {
        // Fallback: redirect langsung ke Midtrans jika Snap belum loaded
        window.location.href = payment_url;
      } else {
        toast({ title: "Error", description: "Token pembayaran tidak valid", variant: "destructive" });
        setPaying(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Terjadi kesalahan";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setPaying(false);
    }
  };

  /* ─────────────────────────────────────────────
     RENDER — loading skeleton
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
              <Skeleton className="h-[280px] rounded-2xl" />
              <Skeleton className="h-[160px] rounded-2xl" />
            </div>
            <Skeleton className="h-[420px] rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const { plan, breakdown, period_days } = order;

  /* ─────────────────────────────────────────────
     RENDER — main
  ───────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Header />

      <main className="flex-1 py-10">
        <div className="container max-w-5xl mx-auto px-4">

          {/* ── Breadcrumb ── */}
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

          {/* ── Active subscription warning ── */}
          {hasActiveSub && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Kamu sudah punya subscription aktif
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Melanjutkan pembayaran akan me-renew subscription kamu ke paket{" "}
                  <strong>{plan.name}</strong>. Subscription lama akan digantikan.
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">

            {/* ══ KIRI: Detail paket + form ══ */}
            <div className="space-y-5">

              {/* Header */}
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Review Order
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Periksa detail langganan sebelum melanjutkan ke pembayaran.
                </p>
              </div>

              {/* Plan detail card */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {/* Plan header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">
                        Paket yang dipilih
                      </p>
                      <h2 className="text-2xl font-extrabold text-white">
                        {plan.name}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-white">
                        {breakdown.subtotal_formatted}
                      </p>
                      <p className="text-xs text-blue-200">
                        per {period_days} hari
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan specs */}
                <div className="px-6 py-5 grid grid-cols-3 gap-4 border-b border-slate-100">
                  {[
                    {
                      label: "Storage",
                      value: `${plan.storage_gb} GB`,
                      icon: "💾",
                    },
                    {
                      label: "Upload / bulan",
                      value:
                        plan.upload_limit > 0
                          ? plan.upload_limit.toLocaleString("id-ID")
                          : "∞",
                      icon: "📸",
                    },
                    {
                      label: "Rate Limit",
                      value: `${plan.rate_limit_rpm} rpm`,
                      icon: "⚡",
                    },
                  ].map((spec) => (
                    <div key={spec.label} className="text-center">
                      <p className="text-2xl mb-1">{spec.icon}</p>
                      <p className="text-base font-bold text-slate-800">
                        {spec.value}
                      </p>
                      <p className="text-xs text-slate-500">{spec.label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {plan.features.map((f) => (
                    <FeatureRow key={f} text={f} />
                  ))}
                </div>
              </div>

              {/* Company name input */}
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Detail Akun Developer
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Akan muncul di invoice dan dashboard kamu.
                  </p>
                </div>

                {/* Email (readonly) */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Email
                  </Label>
                  <Input
                    value={user?.email ?? ""}
                    disabled
                    className="rounded-xl bg-slate-50 text-slate-500 border-slate-200 text-sm"
                  />
                </div>

                {/* Company name */}
                <div className="space-y-1">
                  <Label
                    htmlFor="company"
                    className="text-xs font-semibold text-slate-600"
                  >
                    Nama Perusahaan{" "}
                    <span className="font-normal text-slate-400">
                      (opsional)
                    </span>
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
                  <Info className="w-3.5 h-3.5" />
                  Yang perlu kamu ketahui
                </p>
                {[
                  "API Keys dikirim ke email setelah pembayaran berhasil",
                  "Subscription aktif langsung otomatis via webhook Midtrans",
                  "Tidak ada auto-renew — kamu perpanjang manual kapan saja",
                  "Data & storage aman meskipun subscription berakhir",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-blue-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ KANAN: Order summary + tombol bayar ══ */}
            <div className="sticky top-6 space-y-4">

              {/* Receipt card */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Header receipt */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Ringkasan Pembayaran
                  </h3>
                </div>

                <div className="px-6 pb-5 pt-2 divide-y divide-slate-100">
                  {/* Subtotal */}
                  <LineItem
                    label={`Paket ${plan.name}`}
                    value={breakdown.subtotal_formatted}
                    sub={`Berlaku ${period_days} hari`}
                  />

                  {/* PPN */}
                  <LineItem
                    label={`PPN ${breakdown.ppn_rate}%`}
                    value={breakdown.ppn_formatted}
                    sub="Pajak Pertambahan Nilai"
                  />

                  {/* Service Fee */}
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
                    Aktif {period_days} hari
                  </p>
                  <p className="text-xs text-slate-500">
                    Mulai dari tanggal pembayaran berhasil
                  </p>
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
                  <Lock className="w-3 h-3" />
                  SSL Encrypted
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-3 h-3" />
                  Powered by Midtrans
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Zap className="w-3 h-3" />
                  Instan
                </div>
              </div>

              {/* Supported payments logos */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-center text-xs text-slate-400 font-medium mb-2">
                  Metode pembayaran tersedia
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs font-semibold">
                  {[
                    "BCA VA",
                    "Mandiri VA",
                    "BNI VA",
                    "GoPay",
                    "QRIS",
                    "Kartu Kredit",
                    "Alfamart",
                    "Indomaret",
                  ].map((m) => (
                    <span
                      key={m}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 leading-relaxed px-2">
                {order.note}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DeveloperCheckout;