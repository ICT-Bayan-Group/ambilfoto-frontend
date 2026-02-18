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
  CalendarDays, BarChart3, Upload, Server,
  Clock, Zap, Key, ChevronRight, AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";

const DeveloperDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [overview, setOverview] = useState<DeveloperOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    developerService.getOverview(id)
      .then((res) => { if (res.success) setOverview(res.data); })
      .catch(() => toast({ title: "Failed to load dashboard", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return null;

  if (loading) {
    return (
      <DeveloperLayout developerId={id}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DeveloperLayout>
    );
  }

  const sub = overview?.subscription;
  const usage = overview?.usage;
  const keys = overview?.api_keys || [];
  const dev = overview?.developer;

  const statusColor = sub?.status === "active" ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground";

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {dev?.full_name?.split(" ")[0] || "Developer"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {dev?.company_name || "Developer Account"} · ID: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{id.slice(0, 8)}...</code>
            </p>
          </div>
          {sub && (
            <Badge className={statusColor}>
              {sub.status === "active" ? "Active" : "Expired"}
            </Badge>
          )}
        </div>

        {/* No subscription banner */}
        {!sub && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">No active subscription</p>
              <p className="text-sm text-muted-foreground mt-1">Subscribe to a plan to get your API keys and start integrating.</p>
            </div>
            <Link to="/pricing">
              <Button size="sm">View Plans</Button>
            </Link>
          </div>
        )}

        {/* Subscription info cards */}
        {sub && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Usage */}
        {usage && (
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Quota Usage This Month
              </CardTitle>
              <Link to={`/developer/${id}/usage`}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Details <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-5">
              <UsageBar
                label="Storage"
                used={Math.round(usage.storage.used_mb / 1024 * 10) / 10}
                limit={sub?.storage_gb || 0}
                unit=" GB"
                pct={usage.storage.pct}
              />
              <UsageBar
                label="Photo Uploads"
                used={usage.uploads.used}
                limit={usage.uploads.limit}
                unit=" photos"
                pct={usage.uploads.pct}
              />
            </CardContent>
          </Card>
        )}

        {/* Today stats */}
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

        {/* API Keys quick view */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              API Keys
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
