import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLayout } from "@/components/developer/DeveloperLayout";
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
  ChevronLeft,
  AlertTriangle,
  Headphones,
  Tag,
  RefreshCw,
  Activity,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─────────────────────────────────────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────────────────────────────────────

const fRp = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const fNum = (v: number) => new Intl.NumberFormat("id-ID").format(v);

/** Map semua variant support_channel → label yang mudah dibaca */
const SUPPORT_LABEL: Record<string, string> = {
  // New keys
  email:           "Email Support",
  email_wa:        "Email & WhatsApp",
  whatsapp_email:  "Email & WhatsApp",
  call_center:     "Call Center 24/7",
  "24_7_call":     "Call Center 24/7",
  // Legacy
  priority:        "Priority Support",
  enterprise:      "Enterprise Support",
};

const getSupportLabel = (channel: string | undefined): string => {
  if (!channel) return "Email Support";
  return SUPPORT_LABEL[channel.toLowerCase()] ?? channel;
};

const CYCLE_LABEL: Record<string, string> = {
  monthly: "Bulanan",
  yearly:  "Tahunan",
};

// ─────────────────────────────────────────────────────────────────────────────
// UsageRing — circular progress untuk API Hit
// ─────────────────────────────────────────────────────────────────────────────

interface UsageRingProps {
  pct: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const UsageRing = ({ pct, size = 64, strokeWidth = 6, color }: UsageRingProps) => {
  const r       = (size - strokeWidth) / 2;
  const circ    = 2 * Math.PI * r;
  const filled  = circ * (Math.min(pct, 100) / 100);
  const trackColor = "stroke-muted";

  const ringColor =
    color ??
    (pct >= 90 ? "#ef4444" : pct >= 70 ? "#f97316" : "#8b5cf6");

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        className={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth={strokeWidth}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ApiHitCard — improved card dengan ring + stats
// ─────────────────────────────────────────────────────────────────────────────

interface ApiHitCardProps {
  used: number;
  limit: number;
  pct: number;
  todayRequests: number;
  errorRate: number;
  dashboardId: string;
}

const ApiHitCard = ({ used, limit, pct, todayRequests, errorRate, dashboardId }: ApiHitCardProps) => {
  const remaining = Math.max(limit - used, 0);
  const isWarning = pct >= 80;
  const isDanger  = pct >= 90;

  const ringColor = isDanger ? "#ef4444" : isWarning ? "#f97316" : "#8b5cf6";
  const badgeVariant = isDanger ? "destructive" : isWarning ? "default" : "secondary";

  return (
    <Card className="shadow-soft overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          API Hit Usage Bulan Ini
        </CardTitle>
        <div className="flex items-center gap-2">
          {isWarning && (
            <Badge variant={badgeVariant} className="text-xs">
              {isDanger ? "⚠ Hampir Habis" : "Perhatian"}
            </Badge>
          )}
          <Link to={`/developer/${dashboardId}/usage`}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Detail <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6">
          {/* Ring visual */}
          <div className="relative shrink-0">
            <UsageRing pct={pct} size={80} strokeWidth={7} color={ringColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold" style={{ color: ringColor }}>{pct}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-2">
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: ringColor }}
              />
            </div>

            {/* Numbers */}
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{fNum(used)} <span className="text-muted-foreground font-normal">hit terpakai</span></span>
              <span className="text-muted-foreground">dari {fNum(limit)}</span>
            </div>

            {/* 3 mini stats */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">Sisa</p>
                <p className="text-sm font-bold">{fNum(remaining)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">Hari Ini</p>
                <p className="text-sm font-bold">{fNum(todayRequests)}</p>
              </div>
              <div className={`rounded-lg px-3 py-2 text-center ${errorRate > 5 ? "bg-destructive/10" : "bg-muted/50"}`}>
                <p className="text-xs text-muted-foreground">Error 24h</p>
                <p className={`text-sm font-bold ${errorRate > 5 ? "text-destructive" : ""}`}>{errorRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ApiKeysPaginated — API Keys section dengan pagination per 5 data
// ─────────────────────────────────────────────────────────────────────────────

interface ApiKeysPaginatedProps {
  keys: DeveloperOverview["keys"];
  dashboardId: string;
}

const KEYS_PER_PAGE = 5;

const statusDot: Record<string, string> = {
  active:   "bg-emerald-500",
  expired:  "bg-amber-400",
  revoked:  "bg-slate-400",
  inactive: "bg-slate-400",
};

const statusBadge: Record<string, string> = {
  active:   "text-emerald-700 bg-emerald-50 border-emerald-200",
  expired:  "text-amber-700 bg-amber-50 border-amber-200",
  revoked:  "text-slate-500 bg-slate-50 border-slate-200",
  inactive: "text-slate-500 bg-slate-50 border-slate-200",
};

const ApiKeysPaginated = ({ keys, dashboardId }: ApiKeysPaginatedProps) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(keys.length / KEYS_PER_PAGE);
  const start      = (page - 1) * KEYS_PER_PAGE;
  const pageKeys   = keys.slice(start, start + KEYS_PER_PAGE);

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          API Keys
          <span className="text-xs font-normal text-muted-foreground ml-1">
            ({keys.length} total)
          </span>
        </CardTitle>
        <Link to={`/developer/${dashboardId}/keys`}>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Kelola <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-2">
        {keys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Key className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada API key.</p>
            <p className="text-xs text-muted-foreground mt-1">Key akan dibuat otomatis setelah pembayaran berhasil.</p>
          </div>
        ) : (
          <>
            {/* Key list */}
            <div className="space-y-2">
              {pageKeys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${statusDot[k.status] ?? "bg-slate-400"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-medium truncate">
                        {k.key_preview || `${k.key_prefix}••••••••`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground capitalize">{k.key_type} key</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${statusBadge[k.status] ?? statusBadge.inactive}`}
                        >
                          {k.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-medium">{fNum(k.request_count)} req</p>
                    <p className="text-xs text-muted-foreground">
                      {k.last_used_at
                        ? `Terakhir: ${format(parseISO(k.last_used_at), "dd MMM", { locale: idLocale })}`
                        : "Belum dipakai"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {start + 1}–{Math.min(start + KEYS_PER_PAGE, keys.length)} dari {keys.length} key
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      className="h-7 w-7 p-0 text-xs"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
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
      .catch(() => toast({ title: "Gagal memuat dashboard", variant: "destructive" }))
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
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </DeveloperLayout>
    );
  }

  const sub   = overview?.subscription;
  const usage = overview?.usage;
  const keys  = overview?.keys ?? [];
  const dev   = overview?.developer;

  const isActive   = sub?.status === "active";
  const isYearly   = sub?.billing_cycle === "yearly";
  const hasSavings = isYearly && (sub?.savings_amount ?? 0) > 0;

  const statusColor = isActive
    ? "bg-secondary text-secondary-foreground"
    : "bg-destructive text-destructive-foreground";

  const hitUsed  = usage?.uploads?.used   ?? 0;
  const hitLimit = usage?.uploads?.limit  ?? sub?.api_hit_limit ?? 0;
  const hitPct   = usage?.uploads?.pct    ?? (hitLimit > 0 ? Math.round((hitUsed / hitLimit) * 100) : 0);

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">
              Selamat datang, {dev?.full_name?.split(" ")[0] || "Developer"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {dev?.company_name || "Developer Account"} ·{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{id.slice(0, 8)}...</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sub && (
              <Badge className={statusColor}>
                {isActive ? "Aktif" : "Kadaluarsa"}
              </Badge>
            )}
            {sub && (
              <Badge variant="outline" className="gap-1.5">
                <RefreshCw className="w-3 h-3" />
                {CYCLE_LABEL[sub.billing_cycle ?? "monthly"]}
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
              <p className="font-semibold text-destructive">Belum ada langganan aktif</p>
              <p className="text-sm text-muted-foreground mt-1">
                Subscribe ke salah satu plan untuk mendapatkan API key dan mulai integrasi.
              </p>
            </div>
            <Link to="/developer/pricing">
              <Button size="sm">Lihat Plan</Button>
            </Link>
          </div>
        )}

        {/* ── Yearly savings banner ── */}
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
                    <p className="text-xs text-muted-foreground">Plan Aktif</p>
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
                    <p className="text-xs text-muted-foreground">Berlaku Hingga</p>
                    <p className="font-bold">
                      {format(parseISO(sub.end_date), "dd MMM yyyy", { locale: idLocale })}
                    </p>
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
                    <p className="text-xs text-muted-foreground">Sisa Hari</p>
                    <p className="font-bold">{sub.days_remaining} hari</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate limit */}
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wifi className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate Limit</p>
                    <p className="font-bold">{sub.rate_limit_rpm} req/mnt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── SLA + Support row ── */}
        {sub && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SLA Response Time</p>
                    <p className="font-bold">{sub.sla_label || sub.support_level || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Headphones className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saluran Support</p>
                    <p className="font-bold">
                      {getSupportLabel(sub.support_channel)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── API Hit Usage — IMPROVED ── */}
        {usage && (
          <ApiHitCard
            used={hitUsed}
            limit={hitLimit}
            pct={hitPct}
            todayRequests={usage.today_requests}
            errorRate={usage.error_rate_24h}
            dashboardId={id}
          />
        )}

        {/* ── Storage bar (legacy plans only) ── */}
       {(sub?.storage_gb ?? 0) > 0 && usage?.storage != null && (
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {Math.round((usage.storage.used_mb / 1024) * 10) / 10} GB dipakai
                  </span>
                  <span className="text-muted-foreground">dari {sub.storage_gb} GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${Math.min(usage.storage.pct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{usage.storage.pct}% terpakai</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── API Keys dengan Pagination ── */}
        <ApiKeysPaginated keys={keys} dashboardId={id} />

      </div>
    </DeveloperLayout>
  );
};

export default DeveloperDashboard;