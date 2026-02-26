import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle, AlertTriangle, Users, BarChart3, Lock, Search,
  Eye, Shield, CheckCircle2, XCircle, Clock, ArrowLeft, RefreshCw
} from "lucide-react";
import { adminChatService, Chat, ComplaintTicket, ChatStats } from "@/services/api/chat.service";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const AdminChatManagement = () => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ✅ FIX: gunakan "all" sebagai nilai default, bukan string kosong ""
  const [chatFilter, setChatFilter] = useState<string>("all");
  const [complaintFilter, setComplaintFilter] = useState<string>("all");
  const [complaintSearch, setComplaintSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [resolveDialog, setResolveDialog] = useState(false);
  const [resolveForm, setResolveForm] = useState({ resolution: "", refund_amount: 0, refund_method: "points" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [statsData, chatsData, complaintsData] = await Promise.all([
        adminChatService.getChatStats(),
        adminChatService.getAllChats({ limit: 50 }),
        adminChatService.getAllComplaints({ limit: 50 }),
      ]);
      setStats(statsData);
      setChats(chatsData.chats);
      setComplaints(complaintsData.tickets);
    } catch {
      toast({ title: "Error", description: "Failed to load chat data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChat = async (chatId: string) => {
    try {
      await adminChatService.joinChat(chatId);
      toast({ title: "Joined", description: "You have joined the chat as mediator" });
      navigate(`/admin/chat/${chatId}`);
    } catch {
      toast({ title: "Error", description: "Failed to join chat", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      setIsSubmitting(true);
      await adminChatService.updateComplaintStatus(ticketId, status);
      toast({ title: "Updated", description: `Status changed to ${status}` });
      loadAll();
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket || !resolveForm.resolution) return;
    try {
      setIsSubmitting(true);
      await adminChatService.resolveComplaint(selectedTicket.id, resolveForm);
      toast({ title: "Resolved", description: "Complaint has been resolved" });
      setResolveDialog(false);
      setSelectedTicket(null);
      loadAll();
    } catch {
      toast({ title: "Error", description: "Failed to resolve complaint", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ FIX: filter pakai "all" bukan ""
  const filteredChats = chatFilter === "all"
    ? chats
    : chats.filter(c => c.type === chatFilter);

  const filteredComplaints = complaints.filter(t => {
    if (complaintFilter !== "all" && t.status !== complaintFilter) return false;
    if (complaintSearch) {
      const q = complaintSearch.toLowerCase();
      return (
        t.ticket_code?.toLowerCase().includes(q) ||
        t.complainant_name?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      Open:      { variant: "default",     icon: <Clock className="h-3 w-3" /> },
      Reviewing: { variant: "secondary",   icon: <Eye className="h-3 w-3" /> },
      Resolved:  { variant: "outline",     icon: <CheckCircle2 className="h-3 w-3" /> },
      Rejected:  { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
    };
    const m = map[status] || map.Open;
    return <Badge variant={m.variant} className="gap-1 text-xs">{m.icon}{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Chat & Complaint Center</h1>
              <p className="text-muted-foreground text-sm">Monitor chats and manage complaints</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="p-4 text-center"><MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold">{stats.chats.total_chats}</p><p className="text-xs text-muted-foreground">Total Chats</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 mx-auto mb-2 text-destructive" /><p className="text-2xl font-bold">{stats.complaints.open + stats.complaints.reviewing}</p><p className="text-xs text-muted-foreground">Active Complaints</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><BarChart3 className="h-6 w-6 mx-auto mb-2 text-chart-1" /><p className="text-2xl font-bold">{stats.messages.today_messages}</p><p className="text-xs text-muted-foreground">Messages Today</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Clock className="h-6 w-6 mx-auto mb-2 text-chart-2" /><p className="text-2xl font-bold">{stats.complaints.avg_resolution_hours ? `${Math.round(stats.complaints.avg_resolution_hours)}h` : '-'}</p><p className="text-xs text-muted-foreground">Avg Resolution</p></CardContent></Card>
          </div>
        )}

        <Tabs defaultValue="complaints">
          <TabsList className="mb-6">
            <TabsTrigger value="complaints">Complaints ({complaints.length})</TabsTrigger>
            <TabsTrigger value="chats">All Chats ({chats.length})</TabsTrigger>
          </TabsList>

          {/* ── Complaints Tab ── */}
          <TabsContent value="complaints">
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* ✅ FIX: value="all" bukan value="" */}
              <Select value={complaintFilter} onValueChange={setComplaintFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Reviewing">Reviewing</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
              ) : filteredComplaints.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No complaints found</CardContent></Card>
              ) : (
                filteredComplaints.map((ticket) => (
                  <Card key={ticket.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">{ticket.ticket_code}</span>
                            {statusBadge(ticket.status)}
                            <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{ticket.subject || 'Complaint'}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{ticket.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>By: {ticket.complainant_name}</span>
                            {ticket.event_name && <span>Event: {ticket.event_name}</span>}
                            <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => handleJoinChat(ticket.chat_id)}>
                            <Eye className="h-3 w-3 mr-1" />View Chat
                          </Button>
                          {ticket.status === 'Open' && (
                            <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(ticket.id, 'Reviewing')} disabled={isSubmitting}>
                              <Shield className="h-3 w-3 mr-1" />Review
                            </Button>
                          )}
                          {(ticket.status === 'Open' || ticket.status === 'Reviewing') && (
                            <Button size="sm" onClick={() => { setSelectedTicket(ticket); setResolveDialog(true); }}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* ── Chats Tab ── */}
          <TabsContent value="chats">
            <div className="flex gap-3 mb-4">
              {/* ✅ FIX: value="all" bukan value="" */}
              <Select value={chatFilter} onValueChange={setChatFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)
              ) : filteredChats.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No chats found</CardContent></Card>
              ) : (
                filteredChats.map((chat) => (
                  <Card key={chat.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={chat.type === 'complaint' ? 'destructive' : 'secondary'} className="text-xs">
                              {chat.type}
                            </Badge>
                            {chat.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                            {chat.event_name && <span className="text-xs text-muted-foreground">{chat.event_name}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-sm mb-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {chat.participants.map(p => p.full_name).join(', ')}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{chat.last_message || 'No messages'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {chat.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })}
                            </span>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleJoinChat(chat.id)}>
                            <Eye className="h-3 w-3 mr-1" />View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Resolve Dialog ── */}
        <Dialog open={resolveDialog} onOpenChange={setResolveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Complaint: {selectedTicket?.ticket_code}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea
                placeholder="Resolution note *"
                value={resolveForm.resolution}
                onChange={(e) => setResolveForm(f => ({ ...f, resolution: e.target.value }))}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Refund Amount</label>
                  <Input
                    type="number"
                    value={resolveForm.refund_amount}
                    onChange={(e) => setResolveForm(f => ({ ...f, refund_amount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Refund Method</label>
                  {/* ✅ value tidak kosong — "points" dan "wallet" sudah benar */}
                  <Select
                    value={resolveForm.refund_method}
                    onValueChange={(v) => setResolveForm(f => ({ ...f, refund_method: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleResolve}
                  disabled={isSubmitting || !resolveForm.resolution}
                  className="flex-1"
                >
                  {isSubmitting ? "Resolving..." : "Resolve & Close"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedTicket) handleUpdateStatus(selectedTicket.id, 'Rejected');
                    setResolveDialog(false);
                  }}
                  disabled={isSubmitting}
                >
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminChatManagement;