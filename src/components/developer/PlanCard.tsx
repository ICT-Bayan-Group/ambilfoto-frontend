/**
 * PlanCard.tsx (UPDATED — billing cycle aware)
 *
 * Perubahan:
 *  - Terima prop billingCycle: 'monthly' | 'yearly'
 *  - Tampilkan harga sesuai billing cycle
 *  - Tampilkan badge "Hemat X%" jika yearly dan ada discount
 *  - Ganti upload_limit → api_hit_limit
 *  - Ganti storage_gb → tidak lagi ditampilkan di new plans
 *  - Tampilkan sla_label dan support_channel
 */

import { Check, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plan, BillingCycle } from "@/services/api/developer.service";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fRp = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v);

const SUPPORT_ICON: Record<string, string> = {
  email:          "📧",
  whatsapp_email: "💬",
  email_wa:       "💬",
  "24_7_call":    "📞",
  call_center:    "📞",
  none:           "—",
};

const SUPPORT_LABEL: Record<string, string> = {
  email:          "Email Support",
  whatsapp_email: "Email & WhatsApp",
  email_wa:       "Email & WhatsApp",
  "24_7_call":    "24/7 Call Center",
  call_center:    "24/7 Call Center",
  none:           "Tidak Ada",
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: Plan;
  billingCycle?: BillingCycle;  // NEW
  isPopular?: boolean;
  onSelect: (plan: Plan) => void;
  loading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const PlanCard = ({
  plan,
  billingCycle = "monthly",
  isPopular = false,
  onSelect,
  loading = false,
}: PlanCardProps) => {
  const isCustom  = plan.is_custom === 1;
  const isYearly  = billingCycle === "yearly";

  // ── Harga — support dua struktur:
  //   a) Sudah di-normalise oleh getPlans(): plan.price_monthly / plan.price_yearly
  //   b) Fallback langsung dari API: plan.pricing.monthly.price / plan.pricing.yearly.price
  const pricingRaw         = (plan as any).pricing ?? {};
  const monthlyRaw         = pricingRaw.monthly ?? {};
  const yearlyRaw          = pricingRaw.yearly  ?? {};

  const priceMonthly       = plan.price_monthly ?? monthlyRaw.price ?? (plan as any).price ?? 0;
  const priceYearly        = plan.price_yearly  ?? yearlyRaw.price  ?? priceMonthly;
  const priceFmtMonthly    = plan.price_monthly_formatted ?? monthlyRaw.price_formatted ?? fRp(priceMonthly);
  const priceFmtYearly     = plan.price_yearly_formatted  ?? yearlyRaw.price_formatted  ?? fRp(priceYearly);

  const displayPriceFmt    = isYearly ? priceFmtYearly : priceFmtMonthly;
  const discountPct        = plan.discount_yearly_pct
    ?? (priceMonthly > 0 && priceYearly < priceMonthly
        ? Math.round((1 - priceYearly / priceMonthly) * 100)
        : 0);
  const hasYearlyDiscount  = isYearly && discountPct > 0;
  const yearlyTotal        = isYearly
    ? (yearlyRaw.total_formatted ?? `Rp ${(priceYearly * 12).toLocaleString('id-ID')}`)
    : null;

  // ── API hit limit — support nested limits atau flat
  const limitsRaw          = (plan as any).limits ?? {};
  const hitLimit           = plan.api_hit_limit ?? limitsRaw.api_hit_limit ?? (plan as any).upload_limit ?? 0;
  const hitLabel           = plan.upload_label
    ?? (hitLimit > 0 ? `${hitLimit.toLocaleString("id-ID")} hit/bulan` : "By Request");

  // ── SLA + support — support nested limits atau flat
  const slaLabel           = plan.sla_label        ?? limitsRaw.sla_label        ?? plan.support_level  ?? "-";
  const supportChannel     = plan.support_channel  ?? limitsRaw.support_channel  ?? "email";
  const rateLimit          = plan.rate_limit_rpm   ?? limitsRaw.rate_limit_rpm   ?? 0;
  const supportLabel       = SUPPORT_LABEL[supportChannel] ?? supportChannel;
  const supportIcon        = SUPPORT_ICON[supportChannel]  ?? "📧";

  // Card accent color from plan.color_tag (e.g. "#1976D2")
  const accentColor        = plan.color_tag ?? "#2196F3";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${
        isPopular ? "border-blue-400 ring-2 ring-blue-200" : "border-slate-200"
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-blue-600 text-white text-[10px] px-2 py-0.5 font-bold shadow-sm">
            ⭐ Popular
          </Badge>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6 gap-5">

        {/* ── Plan name + segment ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>
            {plan.target_segment ?? plan.slug}
          </p>
          <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
          {plan.positioning && (
            <p className="text-xs text-slate-500 mt-1">{plan.positioning}</p>
          )}
        </div>

        {/* ── Pricing ── */}
        <div>
          {isCustom ? (
            <div>
              <p className="text-2xl font-extrabold text-slate-900">Hubungi Kami</p>
              <p className="text-xs text-slate-500 mt-1">Harga custom sesuai kebutuhan</p>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-extrabold text-slate-900">{displayPriceFmt}</p>
                <p className="text-xs text-slate-500 mb-1">/ bulan</p>
              </div>

              {/* Yearly total & savings */}
              {isYearly && (
                <div className="mt-1">
                  <p className="text-xs text-slate-500">
                    Dibayar {yearlyTotal} / tahun
                  </p>
                  {hasYearlyDiscount && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      Hemat {discountPct}%
                    </span>
                  )}
                </div>
              )}

              {/* Monthly price hint jika yearly */}
              {!isYearly && discountPct > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Bayar tahunan, hemat {discountPct}%
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Key specs ── */}
        <div className="space-y-2 border-t border-b border-slate-100 py-4">
          {/* API hit */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> API Hit
            </span>
            <span className="font-semibold text-slate-800">{hitLabel}</span>
          </div>

          {/* Rate limit */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Rate Limit</span>
            <span className="font-semibold text-slate-800">{rateLimit > 0 ? `${rateLimit} rpm` : '-'}</span>
          </div>

          {/* SLA */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">SLA</span>
            <span className="font-semibold text-slate-800">{slaLabel}</span>
          </div>

          {/* Support channel */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-violet-400" /> Support
            </span>
            <span className="font-semibold text-slate-800">
              {supportIcon} {supportLabel}
            </span>
          </div>
        </div>

        {/* ── Features ── */}
        <div className="flex-1 space-y-2">
          {(plan.features ?? []).map((f) => (
            <div key={f} className="flex items-start gap-2 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              </div>
              {f}
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <Button
          onClick={() => onSelect(plan)}
          disabled={loading}
          className={`w-full rounded-xl font-bold transition-all duration-200 ${
            isCustom
              ? "bg-slate-800 hover:bg-slate-900 text-white"
              : isPopular
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800"
          }`}
        >
          {loading
            ? "Loading..."
            : isCustom
              ? "Hubungi Sales →"
              : "Pilih Paket →"}
        </Button>
      </div>
    </div>
  );
};