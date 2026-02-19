import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLayout } from "@/components/developer/DeveloperLayout";
import { UsageBar } from "@/components/developer/UsageBar";
import { developerService, UsageAnalytics, RealtimeUsage } from "@/services/api/developer.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

const DAYS_OPTIONS = [7, 14, 30, 90];

const DeveloperUsage = () => {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [realtime, setRealtime] = useState<RealtimeUsage | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      developerService.getUsageAnalytics(id, days),
      developerService.getRealtimeUsage(id),
    ])
      .then(([aRes, rRes]) => {
        if (aRes.success) setAnalytics(aRes.data);
        if (rRes.success) setRealtime(rRes.data);
      })
      .catch(() => toast({ title: "Failed to load usage data", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id, days]);

  if (!id) return null;

  // Guard: realtime data valid only when uploads & storage are both present
  const hasRealtime = realtime && realtime.uploads && realtime.storage;

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" /> Usage & Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Monitor API usage and quota in real-time.</p>
          </div>
          <div className="flex gap-1.5">
            {DAYS_OPTIONS.map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>

        {/* Realtime quota */}
        {loading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : hasRealtime ? (
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Current Month Quota
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {realtime.expires_in_days} days remaining
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <UsageBar
                label="Photo Uploads"
                used={realtime.uploads.used}
                limit={realtime.uploads.limit}
                unit=""
                pct={realtime.uploads.pct}
              />
              <UsageBar
                label="Storage Used"
                used={Math.round(realtime.storage.used_mb / 1024 * 10) / 10}
                limit={Math.round(realtime.storage.limit_mb / 1024)}
                unit=" GB"
                pct={realtime.storage.pct}
              />
            </CardContent>
          </Card>
        ) : !loading && (
          <Card className="shadow-soft">
            <CardContent className="pt-6 pb-6 text-center text-muted-foreground text-sm">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No active subscription quota data available.
            </CardContent>
          </Card>
        )}

        {/* Summary stats */}
        {analytics && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Requests", value: analytics.totals.requests.toLocaleString(), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
              { label: "Successful", value: analytics.totals.success.toLocaleString(), icon: CheckCircle2, color: "text-secondary", bg: "bg-secondary/10" },
              { label: "Errors", value: analytics.totals.errors.toLocaleString(), icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
              { label: "Success Rate", value: `${analytics.totals.success_rate}%`, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="shadow-soft">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${bg}`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-bold text-lg leading-tight">{value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Daily trend chart */}
        {analytics && analytics.daily_trend.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Request Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.daily_trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Requests" />
                  <Bar dataKey="errors" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Errors" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Endpoint breakdown */}
        {analytics && analytics.by_endpoint.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Requests by Endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.by_endpoint.map((ep) => {
                  const total = analytics.totals.requests || 1;
                  const pct = Math.round((ep.count / total) * 100);
                  return (
                    <div key={ep.endpoint} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{ep.endpoint}</code>
                        <span className="text-muted-foreground text-xs">{ep.count.toLocaleString()} req · {ep.errors} errors</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state when no analytics data */}
        {!loading && analytics && analytics.daily_trend.length === 0 && analytics.by_endpoint.length === 0 && (
          <Card className="shadow-soft">
            <CardContent className="pt-6 pb-6 text-center text-muted-foreground text-sm">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No request data for the selected period.
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        )}
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperUsage;