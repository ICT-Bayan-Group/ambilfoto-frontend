/**
 * PaymentResult.tsx
 *
 * Halaman yang ditampilkan setelah redirect dari Midtrans Snap.
 * Handles 3 status: finish (sukses), pending (menunggu), error (gagal)
 *
 * Routes yang perlu ditambahkan:
 *   <Route path="/developer/payment/finish"  element={<PaymentResult status="success" />} />
 *   <Route path="/developer/payment/pending" element={<PaymentResult status="pending" />} />
 *   <Route path="/developer/payment/error"   element={<PaymentResult status="error"   />} />
 *
 * URL params yang diterima:
 *   ?invoice_id=xxx&developer_id=xxx
 *   (Midtrans juga bisa kirim ?order_id=xxx, kita handle keduanya)
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { developerService } from "@/services/api/developer.service";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  LayoutDashboard,
  RefreshCw,
  Mail,
  Copy,
  Check,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
type ResultStatus = "success" | "pending" | "error";

interface InvoiceStatus {
  invoice_id: string;
  invoice_number: string;
  status: string;
  amount: number;
  plan_name: string;
  plan_slug: string;
  developer_id: string;
  paid_at: string | null;
  subscription_active: boolean;
}

/* ─────────────────────────────────────────────────────────────────
   CONFIG PER STATUS
───────────────────────────────────────────────────────────────── */
const CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    iconBg:    "bg-emerald-50",
    ringColor: "ring-emerald-200",
    title:     "Pembayaran Berhasil! 🎉",
    subtitle:  "Subscription kamu sudah aktif. API Keys dikirim ke email.",
    badgeBg:   "bg-emerald-50 border-emerald-200 text-emerald-700",
    badgeText: "Pembayaran Dikonfirmasi",
  },
  pending: {
    icon: Clock,
    iconColor: "text-amber-500",
    iconBg:    "bg-amber-50",
    ringColor: "ring-amber-200",
    title:     "Menunggu Konfirmasi Pembayaran",
    subtitle:  "Pembayaranmu sedang diproses. Subscription akan aktif otomatis setelah dikonfirmasi.",
    badgeBg:   "bg-amber-50 border-amber-200 text-amber-700",
    badgeText: "Menunggu Konfirmasi",
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-500",
    iconBg:    "bg-red-50",
    ringColor: "ring-red-200",
    title:     "Pembayaran Gagal",
    subtitle:  "Transaksi tidak dapat diproses. Kamu bisa coba lagi kapan saja.",
    badgeBg:   "bg-red-50 border-red-200 text-red-700",
    badgeText: "Pembayaran Gagal",
  },
};

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */
const PaymentResult = ({ status: initialStatus }: { status: ResultStatus }) => {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();

  const invoiceId    = searchParams.get("invoice_id") ?? "";
  const developerId  = searchParams.get("developer_id") ?? "";

  const [invoice,     setInvoice]     = useState<InvoiceStatus | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [status,      setStatus]      = useState<ResultStatus>(initialStatus);
  const [copied,      setCopied]      = useState(false);
  const [pollCount,   setPollCount]   = useState(0);

  /* ── Ambil & polling status invoice ── */
  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await developerService.getInvoiceStatus(invoiceId);
        if (res.success && res.data) {
          setInvoice(res.data);
          // Override status berdasarkan data aktual
          if (res.data.subscription_active || res.data.status === "paid") {
            setStatus("success");
          } else if (res.data.status === "cancelled") {
            setStatus("error");
          } else {
            setStatus("pending");
          }
        }
      } catch (_) {/* silent */}
      setLoading(false);
    };

    fetchStatus();

    // Jika pending, poll setiap 5 detik sampai 12x (1 menit)
    if (initialStatus === "pending") {
      const interval = setInterval(() => {
        setPollCount((c) => c + 1);
        fetchStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [invoiceId, pollCount >= 12 ? null : pollCount]);

  /* ── Copy invoice number ── */
  const copyInvoice = () => {
    if (!invoice?.invoice_number) return;
    navigator.clipboard.writeText(invoice.invoice_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  /* ── Format Rupiah ── */
  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md space-y-5">

          {/* ── Icon + heading ── */}
          <div className="text-center space-y-4">
            <div
              className={`mx-auto w-20 h-20 rounded-full ${cfg.iconBg} ring-8 ${cfg.ringColor}
                flex items-center justify-center`}
            >
              <Icon className={`w-9 h-9 ${cfg.iconColor}`} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {cfg.title}
              </h1>
              <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                {cfg.subtitle}
              </p>
            </div>

            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold border rounded-full px-3 py-1 ${cfg.badgeBg}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {cfg.badgeText}
            </span>
          </div>

          {/* ── Invoice detail card ── */}
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : invoice ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Nomor Invoice
                    </p>
                    <p className="text-sm font-bold text-slate-800 font-mono">
                      {invoice.invoice_number}
                    </p>
                  </div>
                  <button
                    onClick={copyInvoice}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600
                      transition-colors bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Detail rows */}
              <div className="px-6 py-4 space-y-3 text-sm divide-y divide-slate-50">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Paket</span>
                  <span className="font-semibold text-slate-800">
                    {invoice.plan_name}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Dibayar</span>
                  <span className="font-bold text-slate-800">
                    {formatRupiah(invoice.amount)}
                  </span>
                </div>
                {invoice.paid_at && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Waktu Bayar</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(invoice.paid_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`font-bold ${
                      status === "success"
                        ? "text-emerald-600"
                        : status === "pending"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {status === "success"
                      ? "Lunas"
                      : status === "pending"
                      ? "Menunggu"
                      : "Gagal"}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── Status-specific info box ── */}
          {status === "success" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 space-y-2">
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Cek email kamu sekarang
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                API Keys (dev + prod) sudah dikirim ke email kamu. Keys ini hanya
                ditampilkan <strong>satu kali</strong> — simpan segera ke tempat
                yang aman.
              </p>
            </div>
          )}

          {status === "pending" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <p className="text-xs font-bold text-amber-700">
                  Memantau status pembayaran...
                </p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Halaman ini akan otomatis terupdate saat pembayaran dikonfirmasi.
                Jika kamu sudah bayar via transfer bank, konfirmasi bisa memakan
                waktu hingga <strong>15 menit</strong>.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-xs text-red-700 leading-relaxed">
                Pembayaran tidak berhasil diproses. Tidak ada dana yang ditarik.
                Kamu bisa memilih paket kembali dan mencoba dengan metode
                pembayaran lain.
              </p>
            </div>
          )}

          {/* ── CTA buttons ── */}
          <div className="space-y-2.5">
            {status === "success" && (invoice?.developer_id || developerId) && (
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-200"
                onClick={() =>
                  navigate(
                    `/developer/${invoice?.developer_id ?? developerId}`
                  )
                }
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Buka Developer Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {status === "pending" && (invoice?.developer_id || developerId) && (
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-slate-200 font-semibold"
                onClick={() =>
                  navigate(
                    `/developer/${invoice?.developer_id ?? developerId}`
                  )
                }
              >
                Lihat Dashboard Sementara
              </Button>
            )}

            {(status === "error" || status === "pending") && (
              <Button
                variant={status === "error" ? "default" : "outline"}
                className={`w-full h-12 rounded-xl font-bold ${
                  status === "error"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200"
                    : "border-slate-200"
                }`}
                onClick={() => navigate("/developer/pricing")}
              >
                {status === "error" ? "Coba Lagi" : "Pilih Paket Lain"}
              </Button>
            )}

            <Link to="/" className="block">
              <Button
                variant="ghost"
                className="w-full h-11 rounded-xl text-slate-500 hover:text-slate-700 text-sm"
              >
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentResult;