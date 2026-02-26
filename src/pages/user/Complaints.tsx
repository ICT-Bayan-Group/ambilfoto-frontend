import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, MessageCircle, Clock, CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import { chatService, ComplaintTicket } from "@/services/api/chat.service";
import { paymentService, PurchasedPhoto } from "@/services/api/payment.service";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Open:      { icon: <Clock className="h-3 w-3" />,        variant: "default" },
  Reviewing: { icon: <AlertTriangle className="h-3 w-3" />, variant: "secondary" },
  Resolved:  { icon: <CheckCircle2 className="h-3 w-3" />, variant: "outline" },
  Rejected:  { icon: <XCircle className="h-3 w-3" />,      variant: "destructive" },
};

const UserComplaints = () => {
  const [tickets, setTickets] = useState<ComplaintTicket[]>([]);
  const [purchasedPhotos, setPurchasedPhotos] = useState<PurchasedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    order_id: "",
    subject: "",
    description: "",
    category: "general",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { loadComplaints(); }, []);

  // Load purchased photos saat dialog dibuka
  useEffect(() => {
    if (dialogOpen && purchasedPhotos.length === 0) {
      loadPurchasedPhotos();
    }
  }, [dialogOpen]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const result = await chatService.getMyComplaints();
      setTickets(result.tickets);
    } catch {
      toast({ title: "Error", description: "Failed to load complaints", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchasedPhotos = async () => {
    try {
      setIsLoadingOrders(true);
      const result = await paymentService.getPurchasedPhotos({ limit: 100 });
      setPurchasedPhotos(result.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load your orders", variant: "destructive" });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const selectedPhoto = purchasedPhotos.find(p => p.transaction_id === form.order_id);

  const handleCreateComplaint = async () => {
    if (!form.order_id || !form.description) {
      toast({ title: "Error", description: "Please select an order and describe your issue", variant: "destructive" });
      return;
    }
    try {
      setIsCreating(true);
      const result = await chatService.createComplaint({
        order_id: form.order_id,
        subject: form.subject,
        description: form.description,
        category: form.category,
      });
      toast({ title: "Complaint submitted", description: `Ticket ${result.ticket_code} created` });
      setDialogOpen(false);
      setForm({ order_id: "", subject: "", description: "", category: "general" });
      navigate(`/user/chat/${result.chat_id}`);
    } catch (error: any) {
      const msg = error.response?.data?.error || "Failed to submit complaint";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Complaints</h1>
            <p className="text-muted-foreground text-sm">Track your complaint tickets</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />New Complaint</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit a Complaint</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">

                {/* Dropdown pilih order */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Select Order *</label>
                  {isLoadingOrders ? (
                    <div className="h-10 bg-muted animate-pulse rounded-md" />
                  ) : purchasedPhotos.length === 0 ? (
                    <div className="text-sm text-muted-foreground border rounded-md p-3 text-center">
                      No paid orders found
                    </div>
                  ) : (
                    <Select
                      value={form.order_id}
                      onValueChange={(v) => setForm(f => ({ ...f, order_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a photo order..." />
                      </SelectTrigger>
                      <SelectContent>
                        {purchasedPhotos.map((photo) => (
                          <SelectItem key={photo.transaction_id} value={photo.transaction_id}>
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[280px]">
                                {photo.filename} — {photo.event_name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Preview order yang dipilih */}
                  {selectedPhoto && (
                    <div className="mt-2 p-2.5 bg-muted rounded-md text-xs text-muted-foreground space-y-0.5">
                      <p><span className="font-medium text-foreground">Foto:</span> {selectedPhoto.filename}</p>
                      <p><span className="font-medium text-foreground">Event:</span> {selectedPhoto.event_name}</p>
                      <p><span className="font-medium text-foreground">Fotografer:</span> {selectedPhoto.photographer_name}</p>
                      <p><span className="font-medium text-foreground">Dibeli:</span> {new Date(selectedPhoto.purchased_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Subject</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Brief subject of your complaint"
                    value={form.subject}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description *</label>
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="photo_quality">Photo Quality</SelectItem>
                      <SelectItem value="payment">Payment Issue</SelectItem>
                      <SelectItem value="copyright">Copyright Dispute</SelectItem>
                      <SelectItem value="refund">Refund Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateComplaint}
                  disabled={isCreating || !form.order_id || !form.description}
                  className="w-full"
                >
                  {isCreating ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : tickets.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No complaints</h3>
              <p className="text-sm text-muted-foreground">You haven't submitted any complaints yet</p>
            </CardContent></Card>
          ) : (
            tickets.map((ticket) => {
              const sc = statusConfig[ticket.status] || statusConfig.Open;
              return (
                <Card
                  key={ticket.id}
                  className="border-border/50 hover:border-primary/30 cursor-pointer transition-all"
                  onClick={() => navigate(`/user/chat/${ticket.chat_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">{ticket.ticket_code}</span>
                          <Badge variant={sc.variant} className="text-xs gap-1">{sc.icon}{ticket.status}</Badge>
                        </div>
                        <h3 className="font-semibold">{ticket.subject || 'Complaint'}</h3>
                      </div>
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{ticket.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{ticket.event_name || ticket.category}</span>
                      <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                    </div>
                    {ticket.resolution_note && (
                      <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                        <span className="font-medium">Resolution: </span>{ticket.resolution_note}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserComplaints;