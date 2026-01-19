import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Calendar, CreditCard, Camera, Coins, Percent, ShoppingCart, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/api/admin.service';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminRevenue = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRevenueAnalytics({ period });
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data revenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [period]);

  const formatCurrency = (num: number | string) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatShortCurrency = (num: number | string) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (value >= 1000000) {
      return `Rp${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `Rp${(value / 1000).toFixed(0)}K`;
    }
    return `Rp${value}`;
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
    topup: parseFloat(item.topup_revenue) || 0,
    photo_fee: parseFloat(item.photo_platform_fee) || 0,
    api: item.api_revenue || 0,
    total: parseFloat(item.total_platform_revenue) || 0,
  })).reverse();

  // Transform revenue sources for pie chart
  const revenueSourcesData = Object.entries(revenueSources).map(([key, value]: [string, any]) => ({
    name: key === 'point_topup' ? 'Top Up FotoPoin' : 
          key === 'photo_platform_fee' ? 'Fee Foto' : 
          key === 'api_token' ? 'API Token' : key,
    value: parseFloat(value.amount) || 0,
    percentage: parseFloat(value.percentage) || 0,
  })).filter(item => item.value > 0);

  // Transform payment method data for bar chart
  const paymentMethodData = byPaymentMethod.map((item: any) => ({
    name: item.payment_method === 'Transfer' ? 'Transfer' : 
          item.payment_method === 'bank_transfer' ? 'Transfer Bank' : 
          item.payment_method || 'Unknown',
    transactions: item.transaction_count || 0,
    amount: parseFloat(item.total_amount) || 0,
    type: item.transaction_type,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Revenue Analytics</h1>
            <p className="text-muted-foreground">Analisis pendapatan platform - Periode: {period}</p>
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
              <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
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
              <CardTitle className="text-sm font-medium">Unique Buyers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.unique_buyers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Photo Gross Sales</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.photo_gross_sales)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">FotoPoin Top Up</CardTitle>
              <Coins className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.point_topup_revenue)}</div>
              <p className="text-xs text-muted-foreground">Revenue dari top up</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Photo Platform Fee</CardTitle>
              <Percent className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.photo_platform_fee)}</div>
              <p className="text-xs text-muted-foreground">Fee dari penjualan foto</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">API Token Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.api_token_revenue)}</div>
              <p className="text-xs text-muted-foreground">Revenue dari API</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Photographer Earnings</CardTitle>
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
              <CardTitle>Revenue Harian</CardTitle>
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
                      <Line type="monotone" dataKey="total" name="Total Revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="topup" name="Top Up" stroke="#00C49F" strokeWidth={2} />
                      <Line type="monotone" dataKey="photo_fee" name="Photo Fee" stroke="#0088FE" strokeWidth={2} />
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
              <CardTitle>Sumber Revenue</CardTitle>
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
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueSourcesData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Tidak ada data revenue
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
                      <Bar yAxisId="left" dataKey="amount" name="Total Amount" fill="#0088FE" />
                      <Bar yAxisId="right" dataKey="transactions" name="Transaksi" fill="#00C49F" />
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
              {byTransactionType.length > 0 ? (
                <div className="space-y-4">
                  {byTransactionType.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {item.transaction_type === 'point_topup' ? (
                            <Coins className="h-5 w-5 text-green-600" />
                          ) : item.transaction_type === 'photo_purchase' ? (
                            <Image className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ShoppingCart className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {item.transaction_type === 'point_topup' ? 'FotoPoin Top Up' : 
                             item.transaction_type === 'photo_purchase' ? 'Photo Purchase' : 
                             item.transaction_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.count} transaksi via {item.payment_method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.total_amount)}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>Platform: {formatCurrency(item.platform_revenue)}</span>
                          {parseFloat(item.photographer_share) > 0 && (
                            <span>| Photographer: {formatCurrency(item.photographer_share)}</span>
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
                <div className="space-y-3">
                  {topPhotos.map((photo: any, index: number) => (
                    <div key={photo.photo_id || index} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{photo.filename || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{photo.event_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(photo.total_revenue)}</p>
                        <Badge variant="secondary">{photo.sales_count} sales</Badge>
                      </div>
                    </div>
                  ))}
                </div>
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
                      <Bar dataKey="total_revenue" name="Revenue" fill="hsl(var(--primary))" />
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
