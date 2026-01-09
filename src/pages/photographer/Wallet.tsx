import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { paymentService, PhotographerWallet, EarningRecord, WithdrawalRequest } from "@/services/api/payment.service";
import { 
  Wallet, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  Send,
  Ban,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
  Banknote
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const PhotographerWalletPage = () => {
  const [wallet, setWallet] = useState<PhotographerWallet | null>(null);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.getPhotographerWallet();
      
      if (response.success && response.data) {
        setWallet(response.data.wallet);
        setEarnings(response.data.recent_earnings || []);
        setWithdrawals(response.data.withdrawal_requests || []);
      }
    } catch (error) {
      toast.error('Gagal memuat data FOTOPOIN');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to safely convert to number
  const toNumber = (value: string | number | undefined | null): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = toNumber(amount);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    const availableBalance = toNumber(wallet?.available_for_withdrawal);
    
    if (!amount || amount < 100000) {
      toast.error('Penarikan minimum adalah Rp 100.000');
      return;
    }

    if (amount > availableBalance) {
      toast.error('Saldo tidak mencukupi');
      return;
    }

    try {
      setIsWithdrawing(true);
      const response = await paymentService.requestWithdrawal(amount);
      
      if (response.success) {
        toast.success('Permintaan penarikan berhasil diajukan!');
        setDialogOpen(false);
        setWithdrawAmount("");
        fetchWalletData();
      } else {
        toast.error(response.error || 'Gagal mengajukan penarikan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCancelWithdraw = async (requestId: string) => {
    try {
      const response = await paymentService.cancelWithdrawal(requestId);
      if (response.success) {
        toast.success('Penarikan dibatalkan');
        fetchWalletData();
      } else {
        toast.error(response.error || 'Gagal membatalkan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Dibayar</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500"><CheckCircle2 className="h-3 w-3 mr-1" />Disetujui</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Menunggu</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const availableBalance = toNumber(wallet?.available_for_withdrawal);
  const isWithdrawEnabled = availableBalance >= 100000;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wallet className="h-8 w-8" />
              FOTOPOIN Saya
            </h1>
            <p className="text-muted-foreground mt-1">
              Pantau FOTOPOIN Anda dan ajukan penarikan dana
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!isWithdrawEnabled}>
                <Send className="h-4 w-4" />
                Ajukan Penarikan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajukan Penarikan</DialogTitle>
                <DialogDescription>
                  Transfer saldo ke rekening bank Anda. Minimum Rp 100.000.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
                  <p className="text-2xl font-bold">{formatCurrency(availableBalance)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah Penarikan</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Minimal 100000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min={100000}
                    max={availableBalance}
                  />
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-600">Catatan</p>
                      <p className="text-muted-foreground">
                        Proses penarikan akan diverifikasi oleh admin dalam 1-3 hari kerja.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleWithdraw} disabled={isWithdrawing}>
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Ajukan Penarikan
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Saldo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Banknote className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(availableBalance)}</p>
                      <p className="text-sm text-muted-foreground">Dapat Ditarik</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(wallet?.total_earned || 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Penghasilan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Send className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(wallet?.total_withdrawn || 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Ditarik</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Pending Withdrawal Alert */}
        {wallet && toNumber(wallet.pending_withdrawal) > 0 && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Penarikan Menunggu</p>
                    <p className="text-sm text-muted-foreground">
                      Penarikan sedang diproses oleh admin
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-yellow-600">
                  {formatCurrency(wallet.pending_withdrawal)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Penghasilan Terkini
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <History className="h-4 w-4" />
              Riwayat Penarikan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                  Penghasilan Terkini
                </CardTitle>
                <CardDescription>Penjualan terbaru dari foto Anda</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : earnings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Belum ada penghasilan</p>
                    <p className="text-sm">Penghasilan dari penjualan foto akan muncul di sini</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {earnings.map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">{earning.photo_filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {earning.event_name} • Dibeli oleh {earning.buyer_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(earning.paid_at), 'dd MMM yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{formatCurrency(earning.photographer_share)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            dari {formatCurrency(earning.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Riwayat Penarikan
                </CardTitle>
                <CardDescription>Pantau permintaan penarikan Anda</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Send className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Belum ada penarikan</p>
                    <p className="text-sm">Riwayat penarikan akan muncul di sini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawals.map((wd) => (
                      <div key={wd.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xl font-bold">{formatCurrency(wd.amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {wd.bank_name} - {wd.bank_account}
                            </p>
                          </div>
                          {getStatusBadge(wd.status)}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Diajukan: {format(new Date(wd.requested_at), 'dd MMM yyyy HH:mm')}
                          </span>
                          
                          {wd.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleCancelWithdraw(wd.id)}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Batalkan
                            </Button>
                          )}
                        </div>

                        {wd.admin_note && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                            <p className="font-medium">Catatan Admin:</p>
                            <p className="text-muted-foreground">{wd.admin_note}</p>
                          </div>
                        )}

                        {wd.paid_at && (
                          <p className="mt-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4 inline mr-1" />
                            Dibayar pada {format(new Date(wd.paid_at), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default PhotographerWalletPage;