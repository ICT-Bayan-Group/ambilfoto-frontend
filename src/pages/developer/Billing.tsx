/**
 * DeveloperBilling.tsx (UPDATED — billing_cycle display)
 *
 * Perubahan:
 *  - Tampilkan billing_cycle badge (Bulanan / Tahunan) di setiap invoice row
 *  - Tampilkan savings_amount jika yearly
 *  - Tampilkan price_per_month sebagai sub-info
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLayout } from "@/components/developer/DeveloperLayout";
import { developerService, Invoice } from "@/services/api/developer.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Loader2, Tag, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v);

const STATUS_COLORS: Record<string, string> = {
  paid:      "bg-secondary/10 text-secondary border-secondary/20",
  pending:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelled: "bg-muted text-muted-foreground",
  refunded:  "bg-blue-100 text-blue-700 border-blue-200",
};

const CYCLE_LABEL: Record<string, string> = {
  monthly: "Bulanan",
  yearly:  "Tahunan",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const DeveloperBilling = () => {
  const { id }  = useParams<{ id: string }>();
  const [invoices,    setInvoices]    = useState<Invoice[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [pdfLoading,  setPdfLoading]  = useState<string | null>(null);
  const { toast }                     = useToast();

  const loadInvoices = (p = 1) => {
    if (!id) return;
    setLoading(true);
    developerService
      .getInvoices(id, p)
      .then((res) => {
        if (res.success) {
          setInvoices(res.data.invoices);
          setTotalPages(res.data.pagination.pages);
          setPage(p);
        }
      })
      .catch(() => toast({ title: "Failed to load invoices", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadInvoices(); }, [id]);

  const handleDownloadPdf = async (inv: Invoice) => {
    if (!id || inv.status !== "paid") return;
    setPdfLoading(inv.id);
    await developerService.downloadReceiptPdf(
      id,
      inv.id,
      inv.invoice_number,
      undefined,
      (msg) => toast({ title: "Gagal mengunduh PDF", description: msg, variant: "destructive" })
    );
    setPdfLoading(null);
  };

  if (!id) return null;

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" /> Billing
            </h1>
            <p className="text-muted-foreground mt-1">Riwayat invoice dan pembayaran subscription.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => loadInvoices(page)} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Invoice list */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Belum ada invoice</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => {
                  const isYearly   = inv.billing_cycle === "yearly";
                  const hasSavings = isYearly && (inv.savings_amount ?? 0) > 0;

                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted/30 transition-smooth"
                    >
                      {/* Left: icon + info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{inv.invoice_number}</p>
                            {/* Billing cycle badge — NEW */}
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                              <RefreshCw className="w-2.5 h-2.5" />
                              {CYCLE_LABEL[inv.billing_cycle ?? 'monthly'] ?? 'Bulanan'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {inv.plan_name} · {format(parseISO(inv.created_at), "dd MMM yyyy")}
                          </p>
                          {/* Savings info — NEW */}
                          {hasSavings && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                              <Tag className="w-3 h-3" />
                              Hemat {formatRupiah(inv.savings_amount)}
                            </p>
                          )}
                          {/* Price per month — NEW (hanya untuk yearly agar jelas) */}
                          {isYearly && inv.price_per_month > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {formatRupiah(inv.price_per_month)} / bulan × 12
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: status + amount + download */}
                      <div className="flex items-center gap-4 shrink-0">
                        <Badge variant="outline" className={STATUS_COLORS[inv.status] ?? ""}>
                          {inv.status}
                        </Badge>

                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            {formatRupiah(inv.total_amount ?? inv.amount)}
                          </p>
                          {inv.paid_at && (
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(inv.paid_at), "dd MMM yyyy")}
                            </p>
                          )}
                        </div>

                        {/* Download PDF */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={
                            inv.status === "paid"
                              ? "Download Receipt PDF"
                              : "Receipt hanya tersedia untuk invoice yang sudah lunas"
                          }
                          disabled={inv.status !== "paid" || pdfLoading === inv.id}
                          onClick={() => handleDownloadPdf(inv)}
                        >
                          {pdfLoading === inv.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Download className="h-3.5 w-3.5" />
                          }
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline" size="sm"
                      disabled={page === 1}
                      onClick={() => loadInvoices(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground self-center">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline" size="sm"
                      disabled={page === totalPages}
                      onClick={() => loadInvoices(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperBilling;