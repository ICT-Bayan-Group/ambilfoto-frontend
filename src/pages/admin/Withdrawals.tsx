import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/layout/Header";
import { paymentService, WithdrawalRequest, WithdrawalSummary } from "@/services/api/payment.service";
import { 
  Send, 
  CheckCircle2, 
  Ban, 
  Clock, 
  Loader2, 
  FileCheck, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  User,
  Building2,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'mark_paid' | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [transferProof, setTransferProof] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Jangan kirim status filter jika "all" dipilih
      const params = statusFilter === 'all' 
        ? {} 
        : { status: statusFilter as any };
      
      const response = await paymentService.getAllWithdrawals(params);
      
      if (response.success) {
        setWithdrawals(response.data || []);
        
        // Pastikan summary ada dengan nilai default
        const defaultSummary: WithdrawalSummary = {
          total_requests: 0,
          pending_count: 0,
          pending_amount: 0,
          paid_count: 0,
          paid_amount: 0,
        };
        
        setSummary(response.summary || defaultSummary);
      } else {
        console.error('Error mengambil data withdrawal:', response.error);
        toast.error(response.error || 'Gagal memuat data penarikan');
        setWithdrawals([]);
        setSummary(null);
      }
    } catch (error: any) {
      console.error('Error API withdrawal:', error);
      toast.error(error.response?.data?.error || 'Gagal menghubungi server.');
      setWithdrawals([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: idLocale });
    } catch {
      return dateString;
    }
  };

  const handleProcess = async () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === 'reject' && !adminNote.trim()) {
      toast.error('Catatan admin wajib diisi untuk penolakan');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await paymentService.processWithdrawal(selectedRequest.id, {
        action: actionType,
        admin_note: adminNote.trim() || undefined,
        transfer_proof_url: transferProof.trim() || undefined
      });

      if (response.success) {
        const actionText = {
          approve: 'disetujui',
          reject: 'ditolak',
          mark_paid: 'ditandai sebagai sudah dibayar'
        };
        toast.success(`Penarikan berhasil ${actionText[actionType]}!`);
        closeDialog();
        fetchData();
      } else {
        toast.error(response.error || 'Gagal memproses penarikan');
      }
    } catch (error: any) {
      console.error('Error memproses withdrawal:', error);
      toast.error(error.response?.data?.error || 'Terjadi kesalahan saat memproses');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setActionType(null);
    setAdminNote("");
    setTransferProof("");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { className: "bg-green-500 hover:bg-green-600 text-white", label: "Sudah Dibayar" },
      approved: { className: "bg-blue-500 hover:bg-blue-600 text-white", label: "Disetujui" },
      pending: { className: "bg-yellow-500 hover:bg-yellow-600 text-white", label: "Menunggu" },
      rejected: { className: "bg-red-500 hover:bg-red-600 text-white", label: "Ditolak" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      className: "bg-gray-500 text-white",
      label: status
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'approved': return <FileCheck className="h-5 w-5 text-blue-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected': return <Ban className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Hitung summary dari data yang ada jika backend tidak mengirim
  const calculateLocalSummary = (): WithdrawalSummary => {
    if (!withdrawals || withdrawals.length === 0) {
      return {
        total_requests: 0,
        pending_count: 0,
        pending_amount: 0,
        paid_count: 0,
        paid_amount: 0,
      };
    }

    return withdrawals.reduce((acc, wd) => {
      acc.total_requests++;
      
      if (wd.status === 'pending') {
        acc.pending_count++;
        acc.pending_amount += Number(wd.amount) || 0;
      } else if (wd.status === 'paid') {
        acc.paid_count++;
        acc.paid_amount += Number(wd.amount) || 0;
      }
      
      return acc;
    }, {
      total_requests: 0,
      pending_count: 0,
      pending_amount: 0,
      paid_count: 0,
      paid_amount: 0,
    });
  };

  // Gunakan summary dari API atau hitung lokal
  const displaySummary = summary || calculateLocalSummary();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Send className="h-7 w-7 text-primary" />
            </div>
            Kelola Penarikan Dana
          </h1>
          <p className="text-muted-foreground">
            Proses permintaan penarikan dana dari fotografer
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Total Requests */}
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{displaySummary.total_requests}</p>
              <p className="text-sm text-muted-foreground">Total Permintaan</p>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mb-1">
                {displaySummary.pending_count}
              </p>
              <p className="text-sm text-muted-foreground mb-2">Menunggu Persetujuan</p>
              <p className="text-sm font-semibold text-yellow-600">
                {formatCurrency(displaySummary.pending_amount)}
              </p>
            </CardContent>
          </Card>

          {/* Paid */}
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">
                {displaySummary.paid_count}
              </p>
              <p className="text-sm text-muted-foreground mb-2">Sudah Dibayar</p>
              <p className="text-sm font-semibold text-green-600">
                {formatCurrency(displaySummary.paid_amount)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="paid">Sudah Dibayar</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Withdrawals List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Permintaan Penarikan</CardTitle>
            <CardDescription>
              {statusFilter === 'all' ? 'Semua permintaan' : `Status: ${statusFilter}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-16">
                <Send className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-muted-foreground">
                  Tidak ada permintaan penarikan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((wd) => (
                  <div 
                    key={wd.id} 
                    className="p-5 rounded-lg border hover:border-primary/50 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-5 w-5 text-primary" />
                          <p className="font-bold text-lg">
                            {wd.photographer_name || wd.business_name}
                          </p>
                          {getStatusIcon(wd.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{wd.photographer_email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(wd.requested_at || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary mb-2">
                          {formatCurrency(wd.amount)}
                        </p>
                        {getStatusBadge(wd.status)}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4" />
                        <p className="text-sm font-semibold">Rekening</p>
                      </div>
                      <p className="text-sm ml-6">
                        <span className="font-bold">{wd.bank_name}</span> - {wd.bank_account}
                      </p>
                      {wd.account_holder && (
                        <p className="text-xs text-muted-foreground ml-6">a/n {wd.account_holder}</p>
                      )}
                    </div>

                    {wd.photographer_note && (
                      <Alert className="mb-3 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                        <AlertDescription>
                          <p className="text-xs font-medium mb-1">Catatan Fotografer:</p>
                          <p className="text-sm">{wd.photographer_note}</p>
                        </AlertDescription>
                      </Alert>
                    )}

                    {wd.admin_note && (
                      <Alert className="mb-3 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                        <AlertDescription>
                          <p className="text-xs font-medium mb-1">Catatan Admin:</p>
                          <p className="text-sm">{wd.admin_note}</p>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 mt-4">
                      {wd.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedRequest(wd);
                              setActionType('approve');
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Setujui
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(wd);
                              setActionType('reject');
                            }}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                        </>
                      )}
                      {wd.status === 'approved' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setSelectedRequest(wd);
                            setActionType('mark_paid');
                          }}
                        >
                          <FileCheck className="h-4 w-4 mr-1" />
                          Tandai Sudah Dibayar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={!!actionType} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' && 'Setujui Permintaan'}
                {actionType === 'reject' && 'Tolak Permintaan'}
                {actionType === 'mark_paid' && 'Tandai Sudah Dibayar'}
              </DialogTitle>
              <DialogDescription>
                {formatCurrency(selectedRequest?.amount || 0)} untuk {selectedRequest?.photographer_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedRequest && (
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="font-semibold mb-2">Detail Rekening:</p>
                  <p>{selectedRequest.bank_name} - {selectedRequest.bank_account}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">
                  Catatan Admin {actionType === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  placeholder={actionType === 'reject' ? 'Alasan penolakan (wajib)' : 'Catatan (opsional)'}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              {actionType === 'mark_paid' && (
                <div>
                  <label className="text-sm font-medium">URL Bukti Transfer (Opsional)</label>
                  <Input
                    placeholder="https://..."
                    value={transferProof}
                    onChange={(e) => setTransferProof(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
                Batal
              </Button>
              <Button
                onClick={handleProcess}
                disabled={isProcessing || (actionType === 'reject' && !adminNote.trim())}
                className={
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminWithdrawals;