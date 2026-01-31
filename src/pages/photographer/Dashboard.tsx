import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { photographerService, PhotographerStats, Event } from "@/services/api/photographer.service";
import { paymentService, PhotographerWallet } from "@/services/api/payment.service";
import { 
  Camera, 
  Calendar, 
  Image, 
  Users, 
  Download, 
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Wallet,
  Banknote,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PhotographerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PhotographerStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [wallet, setWallet] = useState<PhotographerWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes, walletRes] = await Promise.all([
          photographerService.getStatistics(),
          photographerService.getMyEvents(),
          paymentService.getPhotographerWallet()
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (eventsRes.success && eventsRes.data) {
          setEvents(eventsRes.data);
        }
        if (walletRes.success && walletRes.data) {
          setWallet(walletRes.data.wallet);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentEvents = events.slice(0, 5);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount || 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Selamat datang kembali, {user?.full_name?.split(' ')[0]}! 📸
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola acara dan foto Anda dari dasbor
            </p>
          </div>
          <Link to="/photographer/events/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Acara
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.events.total_events || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Acara</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <Image className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.photos.total_photos || 0}</p>
                      <p className="text-sm text-muted-foreground">Foto Diunggah</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Users className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.photos.total_faces_detected || 0}</p>
                      <p className="text-sm text-muted-foreground">Wajah Terdeteksi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{wallet?.total_sales || 0}</p>
                      <p className="text-sm text-muted-foreground">Penjualan Foto</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Wallet Section */}
        <Card className="mb-8 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                Dompet Fotografer
              </CardTitle>
              <Link to="/photographer/wallet">
                <Button variant="ghost" size="sm" className="gap-1">
                  Lihat Detail <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-background/80 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Saldo</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
              </div>
              <div className="p-4 bg-background/80 rounded-lg">
                <p className="text-sm text-muted-foreground">Dapat Ditarik</p>
                <p className="text-xl font-bold">
                  {formatCurrency(wallet?.available_for_withdrawal || 0)}
                </p>
              </div>
              <div className="p-4 bg-background/80 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(wallet?.total_earned || 0)}
                </p>
              </div>
              <div className="p-4 bg-background/80 rounded-lg">
                <p className="text-sm text-muted-foreground">Tertunda</p>
                <p className="text-xl font-bold text-yellow-600">
                  {formatCurrency(wallet?.pending_withdrawal || 0)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link to="/photographer/wallet">
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                  <Banknote className="h-4 w-4" />
                  Ajukan Penarikan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Recent Events */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/photographer/events/new" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Plus className="h-4 w-4" />
                  Buat Acara Baru
                </Button>
              </Link>
              <Link to="/photographer/events" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Calendar className="h-4 w-4" />
                  Lihat Semua Acara
                </Button>
              </Link>
              <Link to="/photographer/profile" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Camera className="h-4 w-4" />
                  Edit Profil Bisnis
                </Button>
              </Link>
              <Link to="/photographer/photo-sales" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 text-primary border-primary/30 hover:bg-primary/10">
                  <BarChart3 className="h-4 w-4" />
                  Statistik Penjualan
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Acara Terbaru
                </CardTitle>
                <CardDescription>Aktivitas acara terbaru Anda</CardDescription>
              </div>
              <Link to="/photographer/events">
                <Button variant="ghost" size="sm" className="gap-1">
                  Lihat Semua <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Belum ada acara</p>
                  <Link to="/photographer/events/new">
                    <Button variant="link" className="mt-2">
                      Buat acara pertama Anda
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/photographer/events/${event.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{event.event_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.event_date), 'dd MMM yyyy', { locale: id })} • {event.photo_count || 0} foto
                        </p>
                      </div>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status === 'active' ? 'Aktif' : event.status === 'completed' ? 'Selesai' : event.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Keterlibatan Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats?.users.unique_users || 0}</p>
                  <p className="text-sm text-muted-foreground">Pengguna unik tercocokkan</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats?.events.active_events || 0}</p>
                  <p className="text-sm text-muted-foreground">Acara aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ringkasan Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(wallet?.total_earned || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total pendapatan</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats?.events.completed_events || 0}</p>
                  <p className="text-sm text-muted-foreground">Acara selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PhotographerDashboard;