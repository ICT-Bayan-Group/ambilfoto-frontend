import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/layout/Header";
import { paymentService, WithdrawalRequest, WithdrawalSummary } from "@/services/api/payment.service";
import { Send, CheckCircle2, Ban, Clock, DollarSign, Loader2, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'mark_paid' | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [transferProof, setTransferProof] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { fetchData(); }, [statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.getAllWithdrawals({ status: statusFilter as any });
      if (response.success) {
        setWithdrawals(response.data || []);
        setSummary(response.summary || null);
      }
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleProcess = async () => {
    if (!selectedRequest || !actionType) return;
    try {
      setIsProcessing(true);
      const response = await paymentService.processWithdrawal(selectedRequest.id, {
        action: actionType,
        admin_note: adminNote,
        transfer_proof_url: transferProof || undefined
      });
      if (response.success) {
        toast.success(`Withdrawal ${actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'marked as paid'}!`);
        setSelectedRequest(null);
        setActionType(null);
        setAdminNote("");
        setTransferProof("");
        fetchData();
      } else {
        toast.error(response.error || 'Gagal memproses');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500">Paid</Badge>;
      case 'approved': return <Badge className="bg-blue-500">Approved</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Send className="h-8 w-8" />Withdrawal Management</h1>
        <p className="text-muted-foreground mb-8">Process photographer withdrawal requests</p>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{summary.total_requests}</p><p className="text-sm text-muted-foreground">Total Requests</p></CardContent></Card>
            <Card className="border-yellow-500/30"><CardContent className="pt-6"><p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.pending_amount)}</p><p className="text-sm text-muted-foreground">{summary.pending_count} Pending</p></CardContent></Card>
            <Card className="border-green-500/30"><CardContent className="pt-6"><p className="text-2xl font-bold text-green-600">{formatCurrency(summary.paid_amount)}</p><p className="text-sm text-muted-foreground">{summary.paid_count} Paid</p></CardContent></Card>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader><CardTitle>Withdrawal Requests</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Send className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No {statusFilter} withdrawals</p></div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((wd) => (
                  <div key={wd.id} className="p-4 rounded-lg border">
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="font-bold">{wd.photographer_name || wd.business_name}</p>
                        <p className="text-sm text-muted-foreground">{wd.photographer_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(wd.amount)}</p>
                        {getStatusBadge(wd.status)}
                      </div>
                    </div>
                    <p className="text-sm mb-3">{wd.bank_name} - {wd.bank_account}</p>
                    <div className="flex gap-2">
                      {wd.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => { setSelectedRequest(wd); setActionType('approve'); }}><CheckCircle2 className="h-4 w-4 mr-1" />Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedRequest(wd); setActionType('reject'); }}><Ban className="h-4 w-4 mr-1" />Reject</Button>
                        </>
                      )}
                      {wd.status === 'approved' && (
                        <Button size="sm" className="bg-green-600" onClick={() => { setSelectedRequest(wd); setActionType('mark_paid'); }}><FileCheck className="h-4 w-4 mr-1" />Mark Paid</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setSelectedRequest(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Mark as Paid'} Withdrawal</DialogTitle>
              <DialogDescription>{formatCurrency(selectedRequest?.amount || 0)} untuk {selectedRequest?.photographer_name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea placeholder="Admin note (optional)" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
              {actionType === 'mark_paid' && (
                <Input placeholder="Transfer proof URL (optional)" value={transferProof} onChange={(e) => setTransferProof(e.target.value)} />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
              <Button onClick={handleProcess} disabled={isProcessing}>{isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminWithdrawals;
