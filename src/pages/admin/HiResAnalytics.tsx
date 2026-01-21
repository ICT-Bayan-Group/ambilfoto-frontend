import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, RefreshCw, FileImage, Clock, CheckCircle, 
  AlertTriangle, TrendingUp, Users, Timer, Package,
  BarChart3, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { hiresService, HiResAnalytics, HiResQueueItem } from '@/services/api/hires.service';

const AdminHiResAnalytics = () => {
  const [analytics, setAnalytics] = useState<HiResAnalytics | null>(null);
  const [queue, setQueue] = useState<HiResQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [queueFilter, setQueueFilter] = useState('pending');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, queueRes] = await Promise.all([
        hiresService.getAnalytics(period),
        hiresService.getAdminQueue({ status: queueFilter === 'all' ? undefined : queueFilter })
      ]);
      
      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      if (queueRes.success && queueRes.data) {
        setQueue(queueRes.data.queue || []);
      }
    } catch (error) {
      toast.error('Gagal memuat data analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, queueFilter]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  const getSLAComplianceColor = (pct: number) => {
    if (pct >= 90) return 'text-green-600';
    if (pct >= 70) return 'text-yellow-600';
    return 'text-destructive';
  };

  if (isLoading && !analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                Hi-Res Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor SLA dan performa pengiriman Hi-Res
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Hari</SelectItem>
                <SelectItem value="30d">30 Hari</SelectItem>
                <SelectItem value="90d">90 Hari</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(analytics?.stats.total_deliveries || 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Deliveries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(analytics?.stats.delivered || 0)}</p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={analytics?.stats.overdue ? 'border-destructive/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(analytics?.stats.overdue || 0)}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Timer className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.stats.avg_upload_hours?.toFixed(1) || 0}h</p>
                  <p className="text-sm text-muted-foreground">Avg Upload Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SLA Compliance */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SLA Compliance
              </CardTitle>
              <CardDescription>Target: Upload dalam 24 jam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Within SLA</span>
                  <span className="font-bold text-green-600">{formatNumber(analytics?.stats.within_sla || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Missed SLA</span>
                  <span className="font-bold text-destructive">{formatNumber(analytics?.stats.missed_sla || 0)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Compliance Rate</span>
                    <span className={`text-xl font-bold ${getSLAComplianceColor(
                      ((analytics?.stats.within_sla || 0) / (analytics?.stats.total_deliveries || 1)) * 100
                    )}`}>
                      {(((analytics?.stats.within_sla || 0) / (analytics?.stats.total_deliveries || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={((analytics?.stats.within_sla || 0) / (analytics?.stats.total_deliveries || 1)) * 100}
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Pending</span>
                  </div>
                  <span className="font-bold">{formatNumber(analytics?.stats.pending || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Uploaded</span>
                  </div>
                  <span className="font-bold">{formatNumber(analytics?.stats.uploaded || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Delivered</span>
                  </div>
                  <span className="font-bold">{formatNumber(analytics?.stats.delivered || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span>Overdue</span>
                  </div>
                  <span className="font-bold">{formatNumber(analytics?.stats.overdue || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photographer Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Photographer Performance
            </CardTitle>
            <CardDescription>SLA compliance per fotografer</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.by_photographer && analytics.by_photographer.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photographer</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Delivered</TableHead>
                    <TableHead className="text-center">Overdue</TableHead>
                    <TableHead className="text-center">Avg Hours</TableHead>
                    <TableHead className="text-center">SLA %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.by_photographer.map((photographer) => (
                    <TableRow key={photographer.photographer_id}>
                      <TableCell className="font-medium">{photographer.business_name}</TableCell>
                      <TableCell className="text-center">{photographer.total}</TableCell>
                      <TableCell className="text-center">{photographer.delivered}</TableCell>
                      <TableCell className="text-center">
                        {photographer.overdue > 0 ? (
                          <Badge variant="destructive">{photographer.overdue}</Badge>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {photographer.avg_hours != null ? photographer.avg_hours.toFixed(1) : '-'}h
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${getSLAComplianceColor(Number(photographer.sla_compliance_pct) || 0)}`}>
                          {Number(photographer.sla_compliance_pct || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Belum ada data photographer
              </p>
            )}
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.daily_trend && analytics.daily_trend.length > 0 ? (
              <div className="space-y-2">
                {analytics.daily_trend.slice(0, 7).map((day) => (
                  <div key={day.date} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <span className="w-24 text-sm font-medium">
                      {format(new Date(day.date), 'dd MMM', { locale: id })}
                    </span>
                    <div className="flex-1">
                      <Progress 
                        value={(day.delivered / (day.total || 1)) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Total: {day.total}</span>
                      <span className="text-green-600">✓ {day.delivered}</span>
                      {day.overdue > 0 && (
                        <span className="text-destructive">⚠ {day.overdue}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Belum ada data trend
              </p>
            )}
          </CardContent>
        </Card>

        {/* Queue Monitor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Queue Monitor
                </CardTitle>
                <CardDescription>Antrian Hi-Res dari semua fotografer</CardDescription>
              </div>
              <Select value={queueFilter} onValueChange={setQueueFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {queue.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.slice(0, 10).map((item) => (
                    <TableRow key={item.queue_id || item.id}>
                      <TableCell className="font-medium">{item.filename || item.photo_filename}</TableCell>
                      <TableCell>{item.event_name}</TableCell>
                      <TableCell>{item.buyer_name || item.user_name}</TableCell>
                      <TableCell>
                        {item.is_overdue ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" /> Overdue
                          </Badge>
                        ) : item.status === 'pending' ? (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                        ) : (
                          <Badge className="gap-1 bg-blue-600">
                            <CheckCircle className="h-3 w-3" /> Uploaded
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={`text-center ${item.is_overdue ? 'text-destructive font-bold' : ''}`}>
                        {item.hours_since_payment != null ? item.hours_since_payment.toFixed(1) : '0'}h
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada antrian
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminHiResAnalytics;