import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLayout } from "@/components/developer/DeveloperLayout";
import { developerService, Invoice } from "@/services/api/developer.service";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, RefreshCw, Download } from "lucide-react";
import { format, parseISO } from "date-fns";

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const statusColors: Record<string, string> = {
  paid: "bg-secondary/10 text-secondary border-secondary/20",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-blue-100 text-blue-700 border-blue-200",
};

const DeveloperBilling = () => {
  const { id } = useParams<{ id: string }>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [renewLoading, setRenewLoading] = useState(false);
  const { pay, isLoaded } = useMidtransSnap();
  const { toast } = useToast();

const loadInvoices = (p = 1) => {
  if (!id) return;
  setLoading(true);
  developerService.getInvoices(id, p)
    .then((res) => {
      if (res.success) {
        setInvoices(res.data.invoices);
        // Handle both `pages` and `total_pages` from API
        setTotalPages(res.data.pagination.pages ?? (res.data.pagination as any).total_pages ?? 1);
        setPage(p);
      }
    })
    .catch(() => toast({ title: "Failed to load invoices", variant: "destructive" }))
    .finally(() => setLoading(false));
};

  useEffect(() => { loadInvoices(); }, [id]);

  if (!id) return null;

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" /> Billing
            </h1>
            <p className="text-muted-foreground mt-1">View and manage your subscription invoices.</p>
          </div>
        </div>

        {/* Invoice list */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No invoices yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-muted/30 transition-smooth"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.plan_name} · {format(parseISO(inv.created_at), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={statusColors[inv.status] || ""}>
                        {inv.status}
                      </Badge>
                      <p className="font-semibold text-sm">{formatRupiah(inv.amount)}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Download">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

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
