/**
 * DeveloperDashboard.tsx (UPDATED — billing cycle + api_hit_limit)
 *
 * Perubahan:
 *  - Ganti upload_limit → api_hit_limit
 *  - Ganti storage_gb → tidak lagi ditampilkan (plan baru tidak pakai storage)
 *  - Tambah billing_cycle badge (Monthly / Yearly) + savings info
 *  - Tampilkan sla_label dan support_channel di subscription card
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLayout } from "@/components/developer/DeveloperLayout";
import { UsageBar } from "@/components/developer/UsageBar";
import { developerService, DeveloperOverview } from "@/services/api/developer.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  BarChart3,
  Upload,
  Server,
  Clock,
  Zap,
  Key,
  ChevronRight,
  AlertTriangle,
  Headphones,
  Tag,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────────────────────────────────────

const fRp = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const SUPPORT_LABEL: Record<string, string> = {
  email:            "Email Support",
  whatsapp_email:   "WhatsApp & Email",
  "24_7_call":      "24/7 Call Center",
};

const CYCLE_LABEL: Record<string, string> = {
  monthly: "Bulanan",
  yearly:  "Tahunan",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const DeveloperDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [overview, setOverview] = useState<DeveloperOverview | null>(null);
  const [loading, setLoading]   = useState(true);
  const { toast }               = useToast();

  const load = () => {
    if (!id) return;
    setLoading(true);
    developerService
      .getOverview(id)
      .then((res) => { if (res.success) setOverview(res.data); })
      .catch(() => toast({ title: "Failed to load dashboard", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (!id) return null;

  if (loading) {
    return (
      <DeveloperLayout developerId={id}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </DeveloperLayout>
    );
  }

  const sub   = overview?.subscription;
  const usage = overview?.usage;
  const keys  = overview?.keys ?? [];
  const dev   = overview?.developer;

  const isActive    = sub?.status === "active";
  const isYearly    = sub?.billing_cycle === "yearly";
  const hasSavings  = isYearly && (sub?.savings_amount ?? 0) > 0;

  const statusColor = isActive
    ? "bg-secondary text-secondary-foreground"
    : "bg-destructive text-destructive-foreground";

  // Usage data — normalised
  const hitUsed   = usage?.uploads?.used   ?? 0;
  const hitLimit  = usage?.uploads?.limit  ?? sub?.api_hit_limit ?? 0;
  const hitPct    = usage?.uploads?.pct    ?? (hitLimit > 0 ? Math.round(hitUsed / hitLimit * 100) : 0);

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {dev?.full_name?.split(" ")[0] || "Developer"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {dev?.company_name || "Developer Account"} ·{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{id.slice(0, 8)}...</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sub && (
              <Badge className={statusColor}>
                {isActive ? "Active" : "Expired"}
              </Badge>
            )}
            {/* Billing cycle badge — NEW */}
            {sub && (
              <Badge variant="outline" className="gap-1.5">
                <RefreshCw className="w-3 h-3" />
                {CYCLE_LABEL[sub.billing_cycle ?? 'monthly']}
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={load} title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── No subscription banner ── */}
        {!sub && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">No active subscription</p>
              <p className="text-sm text-muted-foreground mt-1">
                Subscribe to a plan to get your API keys and start integrating.
              </p>
            </div>
            <Link to="/developer/pricing">
              <Button size="sm">View Plans</Button>
            </Link>
          </div>
        )}

        {/* ── Yearly savings banner — NEW ── */}
        {hasSavings && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 flex items-center gap-3">
            <Tag className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-800">
              Kamu hemat <strong>{fRp(sub!.savings_amount)}</strong> dengan paket tahunan dibanding membayar bulanan.
            </p>
          </div>
        )}

        {/* ── Subscription info cards ── */}
        {sub && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Plan name */}
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Plan</p>
                    <p className="font-bold">{sub.plan_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expiry */}
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expires</p>
                    <p className="font-bold">{format(parseISO(sub.end_date), "dd MMM yyyy")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Days remaining */}
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Days Remaining</p>
                    <p className="font-bold">{sub.days_remaining} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate limit */}
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Server className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate Limit</p>
                    <p className="font-bold">{sub.rate_limit_rpm} req/min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Subscription detail row — sla + support ── */}
        {sub && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* SLA info */}
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Server className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SLA</p>
                    <p className="font-bold">{sub.sla_label || sub.support_level || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support channel */}
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Headphones className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Support Channel</p>
                    <p className="font-bold">
                      {SUPPORT_LABEL[sub.support_channel ?? ''] ?? sub.support_channel ?? '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Usage ── */}
        {usage && (
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                API Hit Usage This Month
              </CardTitle>
              <Link to={`/developer/${id}/usage`}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Details <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* API Hit bar — NEW (ganti storage + uploads) */}
              <UsageBar
                label="API Hit / bulan"
                used={hitUsed}
                limit={hitLimit}
                unit=" hits"
                pct={hitPct}
              />
              {/* Storage bar — tampilkan hanya jika plan masih punya storage_gb */}
              {sub?.storage_gb && sub.storage_gb > 0 && usage.storage && (
                <UsageBar
                  label="Storage"
                  used={Math.round((usage.storage.used_mb / 1024) * 10) / 10}
                  limit={sub.storage_gb}
                  unit=" GB"
                  pct={usage.storage.pct}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Today stats ── */}
        {usage && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Requests Today</p>
                    <p className="text-2xl font-bold">{usage.today_requests.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${usage.error_rate_24h > 5 ? "bg-destructive/10" : "bg-secondary/10"}`}>
                    <BarChart3 className={`h-4 w-4 ${usage.error_rate_24h > 5 ? "text-destructive" : "text-secondary"}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Error Rate (24h)</p>
                    <p className="text-2xl font-bold">{usage.error_rate_24h}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── API Keys quick view ── */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> API Keys
            </CardTitle>
            <Link to={`/developer/${id}/keys`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Manage <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {keys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No keys yet. Keys will be generated after payment.</p>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${k.status === "active" ? "bg-secondary" : "bg-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-mono font-medium">{k.key_prefix}••••••••</p>
                        <p className="text-xs text-muted-foreground capitalize">{k.key_type} key · {k.status}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{k.request_count.toLocaleString()} requests</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperDashboard;