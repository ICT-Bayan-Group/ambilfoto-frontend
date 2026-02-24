/**
 * EarningDetailModal.tsx
 *
 * Modal detail transaksi pembelian foto untuk fotografer.
 * Desain: clean, professional, emerald/teal accent — NO purple.
 * Struktur: Header status → Info pembeli → Rincian harga → Detail foto
 */

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EarningRecord } from "@/services/api/payment.service";
import {
  CheckCircle2,
  Clock,
  Copy,
  X,
  User,
  CreditCard,
  Image as ImageIcon,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

// Backend mengirim lebih banyak field daripada yang ada di interface dasar
// Kita extend agar field tambahan bisa dipakai
export interface EarningRecordFull extends EarningRecord {
  // Sudah ada di base: id, amount, photographer_share, photo_filename, event_name, buyer_name, paid_at
  // Fields tambahan dari API response aktual
  transaction_type?: string;
  payment_method?: "cash" | "points";
  payment_method_label?: string;
  amount_formatted?: string;
  photographer_share_formatted?: string;
  platform_fee?: string | number;
  platform_fee_formatted?: string;
  escrow_status?: string;
  midtrans_order_id?: string | null;
  description?: string;
  created_at?: string;
  confirmation_deadline?: string | null;
}

interface EarningDetailModalProps {
  earning: EarningRecordFull | null;
  open: boolean;
  onClose: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fRp = (v: string | number | undefined | null): string => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(isNaN(n) ? 0 : n);
};

const fDate = (d: string | undefined | null): string => {
  if (!d) return "—";
  try {
    return format(parseISO(d), "dd MMM yyyy, HH:mm", { locale: idLocale });
  } catch {
    return d;
  }
};

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

// ─── Escrow badge ─────────────────────────────────────────────────────────

const EscrowBadge = ({ status }: { status: string | undefined }) => {
  if (!status) return null;
  const map: Record<string, { label: string; cls: string }> = {
    RELEASED: { label: "Dana Cair", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    HELD: { label: "Dana Ditahan", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    PENDING: { label: "Menunggu", cls: "bg-slate-50 text-slate-600 border-slate-200" },
  };
  const meta = map[status] ?? { label: status, cls: "bg-slate-50 text-slate-600 border-slate-200" };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.cls}`}>
      {meta.label}
    </span>
  );
};

// ─── Payment Method Badge ────────────────────────────────────────────────

const PaymentBadge = ({ label }: { method?: string; label?: string }) => {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
      <CreditCard className="h-3 w-3" />
      {label ?? "Tunai/Transfer"}
    </span>
  );
};

// ─── Row helper ─────────────────────────────────────────────────────────

const Row = ({
  label,
  value,
  valueClass = "",
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  mono?: boolean;
}) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-dashed border-border last:border-0">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <span className={`text-sm text-right ${mono ? "font-mono" : "font-medium"} ${valueClass}`}>
      {value}
    </span>
  </div>
);

// ─── Main Modal ──────────────────────────────────────────────────────────

export const EarningDetailModal = ({ earning, open, onClose }: EarningDetailModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!earning) return null;

  const amount = typeof earning.amount === "string"
    ? parseFloat(earning.amount)
    : earning.amount ?? 0;
  const share = typeof earning.photographer_share === "string"
    ? parseFloat(earning.photographer_share)
    : earning.photographer_share ?? 0;
  const fee = typeof earning.platform_fee === "string"
    ? parseFloat(earning.platform_fee)
    : (earning.platform_fee ?? 0);

  const feePercent = amount > 0 ? Math.round((fee / amount) * 100) : 0;
  const sharePercent = amount > 0 ? Math.round((share / amount) * 100) : 0;

  const orderId = earning.midtrans_order_id ?? earning.id;

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("ID Transaksi disalin");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm w-full p-0 overflow-hidden rounded-2xl border-0 shadow-2xl gap-0">

        {/* ── Header: Status strip ── */}
        <div className="bg-emerald-500 px-6 pt-6 pb-5 relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>

          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">Selesai</span>
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs text-emerald-100 mb-1">Penghasilan Kamu</p>
            <p className="text-3xl font-bold text-white tracking-tight">
              {earning.photographer_share_formatted ?? fRp(share)}
            </p>
          </div>

          {/* Escrow badge only */}
          <div className="flex items-center gap-2 mt-3">
            <EscrowBadge status={earning.escrow_status} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto max-h-[65vh]">

          {/* ── Pembayaran dari ── */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="h-3 w-3" /> Pembayaran dari
                </p>
                <p className="font-semibold text-base">{earning.buyer_name}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>

          {/* ── Info transaksi ── */}
          <div className="px-6 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Info Transaksi
            </p>

            <div className="space-y-0">
              <Row
                label="Waktu Pembayaran"
                value={fDate(earning.paid_at)}
              />
              {earning.created_at && (
                <Row
                  label="Waktu Transaksi"
                  value={fDate(earning.created_at)}
                />
              )}
              <Row
                label="Metode Pembayaran"
                value={
                  <PaymentBadge
                    label={earning.payment_method_label}
                  />
                }
              />
              {/* Invoice / Order ID */}
              <div className="flex items-start justify-between gap-4 py-2.5">
                <span className="text-sm text-muted-foreground shrink-0">Invoice ID</span>
                <button
                  onClick={copyOrderId}
                  className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-sm font-mono font-medium">
                    {orderId.length > 20
                      ? orderId.slice(0, 10) + "..." + orderId.slice(-6)
                      : orderId}
                  </span>
                  {copied
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    : <Copy className="h-3.5 w-3.5" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* ── Rincian Harga ── */}
          <div className="px-6 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Rincian Harga
            </p>

            <div className="space-y-0">
              {/* Net Kreator */}
              <div className="flex items-center justify-between py-2.5 border-b border-dashed border-border">
                <span className="text-sm text-muted-foreground">
                  Net Photographer ({sharePercent}%)
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  {earning.photographer_share_formatted ?? fRp(share)}
                </span>
              </div>

              {/* Platform fee */}
              <div className="flex items-center justify-between py-2.5 border-b border-dashed border-border">
                <span className="text-sm text-muted-foreground">
                  Biaya Platform ({feePercent}%)
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {earning.platform_fee_formatted ?? fRp(fee)}
                </span>
              </div>

              {/* Divider + */}
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">Harga dasar (100%)</span>
                <span className="text-sm font-medium">
                  {earning.amount_formatted ?? fRp(amount)}
                </span>
              </div>

              {/* Harga Jual */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm font-semibold">Harga Jual</span>
                <span className="text-base font-bold text-emerald-600">
                  {earning.amount_formatted ?? fRp(amount)}
                </span>
              </div>
            </div>

            </div>

          {/* ── Detail Konten (Foto) ── */}
          <div className="px-6 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Detail Konten
            </p>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
              {/* Thumbnail placeholder */}
              <div className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-border overflow-hidden">
                <ImageIcon className="h-6 w-6 text-slate-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{earning.photo_filename}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {earning.event_name}
                </p>
                <p className="text-xs font-medium text-emerald-600 mt-1">
                  {earning.amount_formatted ?? fRp(amount)}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* ── Escrow info ── */}
          {earning.escrow_status && (
            <div className="px-6 py-4">
              <div className={`flex items-start gap-3 p-3 rounded-xl border ${
                earning.escrow_status === "RELEASED"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <ShieldCheck className={`h-4 w-4 mt-0.5 shrink-0 ${
                  earning.escrow_status === "RELEASED" ? "text-emerald-600" : "text-amber-600"
                }`} />
                <div>
                  <p className={`text-xs font-semibold ${
                    earning.escrow_status === "RELEASED" ? "text-emerald-700" : "text-amber-700"
                  }`}>
                    {earning.escrow_status === "RELEASED"
                      ? "Dana telah cair ke saldo"
                      : "Dana dalam penahanan escrow"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {earning.escrow_status === "RELEASED"
                      ? "Transaksi ini sudah final. Dana sudah masuk ke saldo wallet kamu."
                      : "Dana akan dicairkan setelah periode konfirmasi pembeli selesai."}
                  </p>
                  {earning.confirmation_deadline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Deadline konfirmasi: {fDate(earning.confirmation_deadline)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            className="w-full h-10 text-sm font-medium"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default EarningDetailModal;