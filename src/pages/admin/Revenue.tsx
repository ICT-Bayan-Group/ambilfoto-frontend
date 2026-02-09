import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Calendar, CreditCard, Camera, Coins, Percent, ShoppingCart, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/api/admin.service';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminRevenue = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [topPhotosPage, setTopPhotosPage] = useState(1);
  const photosPerPage = 5;

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRevenueAnalytics({ period });
      if (response.success) {
        console.log('📊 Revenue data received:', response.data);
        setData(response.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data revenue');
      console.error('Revenue fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
    setTopPhotosPage(1); // Reset pagination when period changes
  }, [period]);

  // Fungsi untuk parsing number dengan aman
  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and parse
      const cleaned = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatCurrency = (num: number | string) => {
    const value = parseNumber(num);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatShortCurrency = (num: number | string) => {
    const value = parseNumber(num);
    if (value >= 1000000000) {
      return `Rp${(value / 1000000000).toFixed(1)}M`;
    } else if (value >= 1000000) {
      return `Rp${(value / 1000000).toFixed(1)}jt`;
    } else if (value >= 1000) {
      return `Rp${(value / 1000).toFixed(0)}rb`;
    }
    return `Rp${Math.round(value)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const dailyRevenue = data?.daily_revenue || [];
  const byPaymentMethod = data?.by_payment_method || [];
  const byTransactionType = data?.by_transaction_type || [];
  const revenueSources = data?.revenue_sources || {};
  const topPhotos = data?.top_photos || [];
  const byPhotographer = data?.by_photographer || [];

  // Transform daily revenue data for chart
  const dailyRevenueData = dailyRevenue.map((item: any) => ({
    date: format(new Date(item.date), 'dd MMM', { locale: id }),
    // topup: parseNumber(item.topup_revenue), // HIDDEN: FotoPoin top-up
    photo_fee: parseNumber(item.photo_platform_fee),
    api: parseNumber(item.api_revenue),
    total: parseNumber(item.total_platform_revenue),
  })).reverse();

  // Transform revenue sources for pie chart
  const revenueSourcesData = [
    // HIDDEN: FotoPoin top-up revenue source
    // {
    //   name: 'Top-Up FotoPoin',
    //   value: parseNumber(revenueSources.point_topup?.amount),
    //   percentage: parseFloat(revenueSources.point_topup?.percentage || 0),
    //   color: COLORS[0]
    // },
    {
      name: 'Fee Penjualan Foto',
      value: parseNumber(revenueSources.photo_platform_fee?.amount),
      percentage: parseFloat(revenueSources.photo_platform_fee?.percentage || 0),
      color: COLORS[1]
    },
    {
      name: 'Token API',
      value: parseNumber(revenueSources.api_token?.amount),
      percentage: parseFloat(revenueSources.api_token?.percentage || 0),
      color: COLORS[2]
    },
  ].filter(item => item.value > 0);

  // Transform payment method data for bar chart
  const paymentMethodData = byPaymentMethod
    // HIDDEN: Filter out FotoPoin payment method
    .filter((item: any) => item.payment_method !== 'points')
    .map((item: any) => ({
      name: item.payment_method === 'Transfer' || item.payment_method === 'bank_transfer' ? 'Transfer Bank' : 
            item.payment_method === 'cash' ? 'Tunai' :
            // item.payment_method === 'points' ? 'FotoPoin' : // HIDDEN
            item.payment_method || 'Lainnya',
      transactions: item.transaction_count || 0,
      amount: parseNumber(item.total_amount),
      type: item.transaction_type,
    }));

  // Transform transaction type labels
  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      // 'point_topup': 'Top-Up FotoPoin', // HIDDEN
      'photo_purchase': 'Pembelian Foto',
      'api_token_purchase': 'Pembelian Token API'
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'cash': 'Tunai',
      // 'points': 'FotoPoin', // HIDDEN
      'bank_transfer': 'Transfer Bank',
      'Transfer': 'Transfer Bank'
    };
    return labels[method] || method;
  };

  // HIDDEN: Filter out point_topup transactions
  const filteredTransactionTypes = byTransactionType.filter(
    (item: any) => item.transaction_type !== 'point_topup'
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analitik Pendapatan</h1>
            <p className="text-muted-foreground">
              Analisis pendapatan platform - Periode: {period === '7d' ? '7 Hari' : period === '30d' ? '30 Hari' : period === '90d' ? '90 Hari' : '1 Tahun'}
            </p>
          </div>
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
              <SelectItem value="90d">90 Hari</SelectItem>
              <SelectItem value="1y">1 Tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan Platform</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_platform_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total_transactions || 0} transaksi
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.avg_transaction)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pembeli Unik</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.unique_buyers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Penjualan Kotor Foto</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.photo_gross_sales)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* HIDDEN: Top-Up FotoPoin Card
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top-Up FotoPoin</CardTitle>
              <Coins className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.point_topup_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                {revenueSources.point_topup?.percentage}% dari total
              </p>
            </CardContent>
          </Card>
          */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fee Platform Foto</CardTitle>
              <Percent className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.photo_platform_fee)}</div>
              <p className="text-xs text-muted-foreground">
                {revenueSources.photo_platform_fee?.percentage}% dari total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Token API</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.api_token_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                {revenueSources.api_token?.percentage}% dari total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Fotografer</CardTitle>
              <Camera className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(summary.photographer_earnings_total)}</div>
              <p className="text-xs text-muted-foreground">Total earning fotografer</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan Harian</CardTitle>
              <CardDescription>Trend pendapatan platform per hari</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {dailyRevenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={formatShortCurrency} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Total Pendapatan" stroke="hsl(var(--primary))" strokeWidth={2} />
                      {/* HIDDEN: Top-Up line */}
                      {/* <Line type="monotone" dataKey="topup" name="Top-Up" stroke="#10b981" strokeWidth={2} /> */}
                      <Line type="monotone" dataKey="photo_fee" name="Fee Foto" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Tidak ada data untuk periode ini
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sumber Pendapatan</CardTitle>
              <CardDescription>Distribusi pendapatan berdasarkan sumber</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {revenueSourcesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueSourcesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueSourcesData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Tidak ada data pendapatan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* By Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Per Metode Pembayaran</CardTitle>
              <CardDescription>Transaksi berdasarkan metode pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {paymentMethodData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentMethodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" tickFormatter={formatShortCurrency} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value: number, name: string) => 
                          name === 'amount' ? formatCurrency(value) : value
                        } 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="amount" name="Total Amount" fill="#3b82f6" />
                      <Bar yAxisId="right" dataKey="transactions" name="Transaksi" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Tidak ada data pembayaran
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* By Transaction Type */}
          <Card>
            <CardHeader>
              <CardTitle>Per Tipe Transaksi</CardTitle>
              <CardDescription>Breakdown berdasarkan jenis transaksi</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactionTypes.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactionTypes.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {/* HIDDEN: FotoPoin icon condition */}
                          {/* {item.transaction_type === 'point_topup' ? (
                            <Coins className="h-5 w-5 text-green-600" />
                          ) : */}
                          {item.transaction_type === 'photo_purchase' ? (
                            <Image className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ShoppingCart className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {getTransactionTypeLabel(item.transaction_type)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.count} transaksi via {getPaymentMethodLabel(item.payment_method)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.total_amount)}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>Platform: {formatCurrency(item.platform_revenue)}</span>
                          {parseNumber(item.photographer_share) > 0 && (
                            <span>| Fotografer: {formatCurrency(item.photographer_share)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Tidak ada data transaksi
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Photos & Photographers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Foto Terlaris</CardTitle>
              <CardDescription>Foto dengan penjualan tertinggi</CardDescription>
            </CardHeader>
            <CardContent>
              {topPhotos.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {topPhotos
                      .slice((topPhotosPage - 1) * photosPerPage, topPhotosPage * photosPerPage)
                      .map((photo: any, index: number) => {
                        const actualIndex = (topPhotosPage - 1) * photosPerPage + index;
                        return (
                          <div key={photo.id || actualIndex} className="flex items-center gap-4 p-3 rounded-lg border">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                              {actualIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{photo.filename || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground truncate">{photo.event_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(photo.gross_revenue)}</p>
                              <Badge variant="secondary">{photo.sales_in_period} penjualan</Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Pagination Controls */}
                  {topPhotos.length > photosPerPage && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Menampilkan {Math.min((topPhotosPage - 1) * photosPerPage + 1, topPhotos.length)}-{Math.min(topPhotosPage * photosPerPage, topPhotos.length)} dari {topPhotos.length} foto
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTopPhotosPage(prev => Math.max(1, prev - 1))}
                          disabled={topPhotosPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center px-3 text-sm font-medium">
                          {topPhotosPage} / {Math.ceil(topPhotos.length / photosPerPage)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTopPhotosPage(prev => Math.min(Math.ceil(topPhotos.length / photosPerPage), prev + 1))}
                          disabled={topPhotosPage >= Math.ceil(topPhotos.length / photosPerPage)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  Belum ada penjualan foto
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Photographers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Fotografer</CardTitle>
              <CardDescription>Fotografer dengan pendapatan tertinggi</CardDescription>
            </CardHeader>
            <CardContent>
              {byPhotographer.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byPhotographer} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={formatShortCurrency} />
                      <YAxis 
                        dataKey="business_name" 
                        type="category" 
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="gross_revenue" name="Pendapatan" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  Belum ada data fotografer
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;