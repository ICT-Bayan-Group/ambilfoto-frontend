import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Camera, Image, Download, DollarSign, Activity, 
  Server, Database, AlertCircle, CheckCircle, RefreshCw,
  TrendingUp, Calendar, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService, DashboardStats } from '@/services/api/admin.service';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Gagal memuat statistik dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Kelola dan monitor sistem AmbilFoto
            </p>
          </div>
          <Button onClick={fetchStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Server Application</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={stats?.system_health.database === 'OK' ? 'default' : 'destructive'}>
                {stats?.system_health.database === 'OK' ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Error</>
                )}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Server</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={stats?.system_health.ai_server === 'OK' ? 'default' : 'destructive'}>
                {stats?.system_health.ai_server === 'OK' ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> {stats?.system_health.ai_server}</>
                )}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.users.total_users || 0)}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.users.today_registrations || 0} hari ini
              </p>
              <div className="mt-2 flex gap-2 text-xs">
                <Badge variant="outline">{stats?.users.regular_users} User</Badge>
                <Badge variant="outline">{stats?.users.photographers} Fotografer</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.events.total_events || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.events.active_events || 0} aktif
              </p>
              <div className="mt-2 flex gap-2 text-xs">
                <Badge variant="outline">{stats?.events.public_events} Publik</Badge>
                <Badge variant="outline">{stats?.events.private_events} Privat</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.photos.total_photos || 0)}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.photos.today_uploads || 0} hari ini
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatNumber(stats?.photos.total_faces_detected || 0)} wajah terdeteksi
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.downloads.total_revenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatCurrency(stats?.downloads.today_revenue || 0)} hari ini
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatNumber(stats?.downloads.total_downloads || 0)} downloads
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Face Matches</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.matches.total_matches || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.matches.unique_users_matched || 0} unique users
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg confidence: {((stats?.matches.avg_confidence || 0) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">API Keys</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.api_keys.total_api_keys || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.api_keys.active_keys || 0} aktif
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatNumber(stats?.api_keys.total_tokens_used || 0)} tokens used
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Token Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.tokens.total_revenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.tokens.total_transactions || 0} transaksi
              </p>
              <div className="mt-2 flex gap-2 text-xs">
                <Badge variant="outline">{stats?.tokens.purchases} Purchase</Badge>
                <Badge variant="outline">{stats?.tokens.renewals} Renewal</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Link to="/admin/users">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Users className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Users</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/events">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Camera className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Events</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/downloads">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Download className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Downloads</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/revenue">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <DollarSign className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Revenue</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/logs">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Activity className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Logs</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/storage">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Database className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Storage</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru (24 Jam)</CardTitle>
            <CardDescription>Top aktivitas dalam 24 jam terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{activity.action}</span>
                  <Badge variant="secondary">{activity.count}x</Badge>
                </div>
              ))}
              {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada aktivitas terbaru
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
