import { useState, useEffect } from "react";
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
import { EarningDetailModal, EarningRecordFull } from "@/components/EarningDetailModal";
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
  Banknote,
  Building2,
  CreditCard,
  User,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

const PhotographerWalletPage = () => {
  const [wallet, setWallet] = useState<PhotographerWallet | null>(null);
  const [earnings, setEarnings] = useState<EarningRecordFull[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // ── Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [photographerNote, setPhotographerNote] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Detail modal
  const [detailEarning, setDetailEarning] = useState<EarningRecordFull | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { fetchWalletData(); }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.getPhotographerWallet();
      if (response.success && response.data) {
        setWallet(response.data.wallet);
        setEarnings((response.data.recent_earnings || []) as EarningRecordFull[]);
        setWithdrawals(response.data.withdrawal_requests || []);
      }
    } catch {
      toast.error('Gagal memuat data wallet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet && dialogOpen) {
      if (wallet.bank_name) setBankName(wallet.bank_name);
      if (wallet.bank_account) setBankAccount(wallet.bank_account);
    }
  }, [wallet, dialogOpen]);

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
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setWithdrawAmount("");
      setBankName(wallet?.bank_name || "");
      setBankAccount(wallet?.bank_account || "");
      setAccountHolder("");
      setPhotographerNote("");
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    const availableBalance = toNumber(wallet?.available_for_withdrawal);
    if (!amount || amount < 100000) { toast.error('Penarikan minimum adalah Rp 100.000'); return; }
    if (amount > availableBalance) { toast.error('Saldo tidak mencukupi'); return; }
    if (!bankName.trim()) { toast.error('Nama bank harus diisi'); return; }
    if (!bankAccount.trim()) { toast.error('Nomor rekening harus diisi'); return; }

    try {
      setIsWithdrawing(true);
      const response = await paymentService.requestWithdrawal({
        amount,
        bank_name: bankName.trim(),
        bank_account: bankAccount.trim(),
        account_holder: accountHolder.trim() || undefined,
        photographer_note: photographerNote.trim() || undefined,
      });
      if (response.success) {
        toast.success('Permintaan penarikan berhasil diajukan!');
        handleDialogChange(false);
        await fetchWalletData();
      } else {
        toast.error(response.error || 'Gagal mengajukan penarikan');
      }
    } catch {
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
        await fetchWalletData();
      } else {
        toast.error(response.error || 'Gagal membatalkan');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  const openDetail = (earning: EarningRecordFull) => {
    setDetailEarning(earning);
    setDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':     return <Badge className="bg-emerald-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Dibayar</Badge>;
      case 'approved': return <Badge className="bg-sky-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Disetujui</Badge>;
      case 'pending':  return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Menunggu</Badge>;
      case 'rejected': return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Ditolak</Badge>;
      default:         return <Badge variant="outline">{status}</Badge>;
    }
  };

  const availableBalance = toNumber(wallet?.available_for_withdrawal);
  const pendingWithdrawal = toNumber(wallet?.pending_withdrawal);
  const isWithdrawEnabled = availableBalance >= 100000;
  const hasPendingWithdrawal = withdrawals.some(w => w.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wallet className="h-8 w-8" />
              Pendapatan Saya
            </h1>
            <p className="text-muted-foreground mt-1">
              Pantau Pendapatan Anda dan ajukan penarikan dana
            </p>
          </div>

          {/* Withdraw Dialog */}
          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!isWithdrawEnabled}>
                <Send className="h-4 w-4" />
                Ajukan Penarikan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajukan Penarikan</DialogTitle>
                <DialogDescription>Transfer saldo ke rekening bank Anda. Minimum Rp 100.000.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Saldo Tersedia
                  </p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(availableBalance)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" /> Jumlah Penarikan (Rp)
                  </Label>
                  <Input id="amount" type="number" placeholder="100000" value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)} min={100000} max={availableBalance} className="text-lg" />
                  {withdrawAmount && parseInt(withdrawAmount) >= 100000 && (
                    <p className="text-sm font-medium text-emerald-600">≈ {formatCurrency(parseInt(withdrawAmount))}</p>
                  )}
                  {withdrawAmount && parseInt(withdrawAmount) < 100000 && (
                    <p className="text-sm text-red-500">Minimum penarikan Rp 100.000</p>
                  )}
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Informasi Rekening Bank
                  </p>
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="bank_name">Nama Bank <span className="text-red-500">*</span></Label>
                    <Input id="bank_name" placeholder="BCA, Mandiri, BNI, BRI, dll" value={bankName}
                      onChange={(e) => setBankName(e.target.value)} />
                  </div>
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="bank_account" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Nomor Rekening <span className="text-red-500">*</span>
                    </Label>
                    <Input id="bank_account" placeholder="1234567890" value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_holder" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Nama Pemilik Rekening (Opsional)
                    </Label>
                    <Input id="account_holder" placeholder="Nama sesuai buku rekening" value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Kosongkan jika sama dengan nama di profil</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photographer_note">Catatan untuk Admin (Opsional)</Label>
                  <Input id="photographer_note" placeholder="Tambahkan catatan jika diperlukan" value={photographerNote}
                    onChange={(e) => setPhotographerNote(e.target.value)} />
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-600">Catatan Penting</p>
                      <ul className="text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                        <li>Proses verifikasi 1-3 hari kerja</li>
                        <li>Pastikan data rekening benar</li>
                        <li>Transfer dilakukan setelah disetujui admin</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleDialogChange(false)} disabled={isWithdrawing}>Batal</Button>
                <Button onClick={handleWithdraw} disabled={isWithdrawing || !bankName.trim() || !bankAccount.trim() || !withdrawAmount || parseInt(withdrawAmount) < 100000}>
                  {isWithdrawing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</> : <><Send className="h-4 w-4 mr-2" />Ajukan Penarikan</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            [1,2,3,4].map(i => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-4 w-32" /></CardContent></Card>
            ))
          ) : (
            <>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
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
                    <div className="p-2 rounded-lg bg-sky-500/20">
                      <Banknote className="h-5 w-5 text-sky-600" />
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
                    <div className="p-2 rounded-lg bg-teal-500/20">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
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
                    <div className="p-2 rounded-lg bg-slate-500/20">
                      <Send className="h-5 w-5 text-slate-600" />
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
        {hasPendingWithdrawal && pendingWithdrawal > 0 && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Penarikan Menunggu</p>
                    <p className="text-sm text-muted-foreground">Penarikan sedang diproses oleh admin</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(pendingWithdrawal)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Penghasilan Terkini
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <History className="h-4 w-4" /> Riwayat Penarikan
            </TabsTrigger>
          </TabsList>

          {/* ── Earnings Tab ── */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  Penghasilan Terkini
                </CardTitle>
                <CardDescription>Klik transaksi untuk melihat detail</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : earnings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Belum ada penghasilan</p>
                    <p className="text-sm">Penghasilan dari penjualan foto akan muncul di sini</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {earnings.map((earning) => {
                      return (
                        <button
                          key={earning.id}
                          onClick={() => openDetail(earning)}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
                              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{earning.photo_filename}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {earning.event_name} · {earning.buyer_name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {format(new Date(earning.paid_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                              </p>
                            </div>
                          </div>

                          {/* Amount + chevron */}
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <div className="text-right">
                              <p className="text-sm font-bold text-emerald-600">
                                +{earning.photographer_share_formatted ?? formatCurrency(earning.photographer_share)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                dari {earning.amount_formatted ?? formatCurrency(earning.amount)}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Withdrawals Tab ── */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" /> Riwayat Penarikan
                </CardTitle>
                <CardDescription>Pantau permintaan penarikan Anda</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Send className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Belum ada penarikan</p>
                    <p className="text-sm">Riwayat penarikan akan muncul di sini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawals.map((wd) => (
                      <div key={wd.id} className="p-4 rounded-xl border border-border">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xl font-bold">{formatCurrency(wd.amount)}</p>
                            <p className="text-sm text-muted-foreground">{wd.bank_name} - {wd.bank_account}</p>
                            {wd.account_holder && (
                              <p className="text-xs text-muted-foreground">a.n. {wd.account_holder}</p>
                            )}
                          </div>
                          {getStatusBadge(wd.status)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Diajukan: {wd.requested_at ? format(new Date(wd.requested_at), 'dd MMM yyyy HH:mm', { locale: idLocale }) : '-'}
                          </span>
                          {wd.status === 'pending' && (
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"
                              onClick={() => handleCancelWithdraw(wd.id)}>
                              <Ban className="h-4 w-4 mr-1" /> Batalkan
                            </Button>
                          )}
                        </div>
                        {wd.photographer_note && (
                          <div className="mt-3 p-2 bg-sky-500/10 rounded text-sm">
                            <p className="font-medium">Catatan Anda:</p>
                            <p className="text-muted-foreground">{wd.photographer_note}</p>
                          </div>
                        )}
                        {wd.admin_note && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                            <p className="font-medium">Catatan Admin:</p>
                            <p className="text-muted-foreground">{wd.admin_note}</p>
                          </div>
                        )}
                        {wd.paid_at && (
                          <p className="mt-2 text-sm text-emerald-600">
                            <CheckCircle2 className="h-4 w-4 inline mr-1" />
                            Dibayar pada {format(new Date(wd.paid_at), 'dd MMM yyyy', { locale: idLocale })}
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

      {/* ── Earning Detail Modal ── */}
      <EarningDetailModal
        earning={detailEarning}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailEarning(null); }}
      />
    </div>
  );
};

export default PhotographerWalletPage;