// src/pages/admin/AdminChatRoom.tsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import {
  ArrowLeft, Send, MoreVertical, Lock, ShieldAlert, Shield,
  Users, RefreshCw
} from "lucide-react";
import {
  adminChatService,
  chatService,
  ChatMessage,
  Chat,
} from "@/services/api/chat.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminChatRoom = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (chatId) {
      loadMessages();
      // Poll setiap 5 detik
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    if (!chatId) return;
    try {
      // Admin pakai adminChatService untuk lihat pesan
      const [msgResult, chatsData] = await Promise.all([
        adminChatService.viewChatMessages(chatId),
        adminChatService.getAllChats({ limit: 100 }),
      ]);
      setMessages(msgResult.messages);
      const current = chatsData.chats.find((c) => c.id === chatId);
      if (current) setChatInfo(current);
    } catch (error) {
      console.error("Error loading messages:", error);
      if (isLoading) {
        toast({
          title: "Error",
          description: "Gagal memuat pesan",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMessages();
    setIsRefreshing(false);
  };

  // Admin kirim pesan via adminChatService
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || isSending) return;
    try {
      setIsSending(true);
      const message = await adminChatService.sendAdminMessage(chatId, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleJoinAsMediator = async () => {
    if (!chatId) return;
    try {
      await adminChatService.joinChat(chatId);
      toast({ title: "Berhasil", description: "Anda bergabung sebagai mediator" });
      loadMessages();
    } catch {
      toast({ title: "Error", description: "Gagal bergabung", variant: "destructive" });
    }
  };

  // Participants selain admin sendiri
  const participants = chatInfo?.participants.filter((p) => p.user_id !== user?.id) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* ✅ Back ke admin chat management, bukan /user/chat */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/chat-management")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {isLoading ? (
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Avatar grup participants */}
                <div className="relative flex-shrink-0">
                  {participants.length > 1 ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participants[0]?.profile_photo} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {participants[0]?.full_name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold truncate text-sm">
                      {participants.map((p) => p.full_name).join(" & ") || "Chat"}
                    </h2>
                    {/* Badge tipe chat */}
                    {chatInfo?.type === "complaint" && (
                      <Badge
                        variant="outline"
                        className="text-xs text-destructive border-destructive/30 flex-shrink-0"
                      >
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Complaint
                      </Badge>
                    )}
                    {chatInfo?.is_locked && (
                      <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {chatInfo?.event_name
                      ? `Event: ${chatInfo.event_name}`
                      : `${participants.length} peserta • Admin view`}
                  </p>
                </div>
              </div>
            )}

            {/* Admin badge + menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs gap-1 hidden sm:flex">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="text-muted-foreground"
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleJoinAsMediator}>
                    <Shield className="h-4 w-4 mr-2" />
                    Bergabung sebagai Mediator
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/admin/chat-management")}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Chat Management
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* ── Participants info bar ── */}
      {!isLoading && chatInfo && (
        <div className="bg-muted/30 border-b border-border px-4 py-2">
          <div className="container max-w-3xl mx-auto">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Users className="h-3 w-3" />
              Peserta:{" "}
              {chatInfo.participants.map((p) => (
                <span
                  key={p.user_id}
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium",
                    p.role === "admin"
                      ? "bg-destructive/10 text-destructive"
                      : p.role === "photographer"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {p.full_name}
                  {p.role === "admin" && " (Admin)"}
                  {p.role === "photographer" && " (Fotografer)"}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}
                >
                  <Skeleton
                    className={cn(
                      "h-12 rounded-2xl",
                      i % 2 === 0 ? "w-48" : "w-32"
                    )}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Belum ada pesan</h3>
              <p className="text-sm text-muted-foreground">
                Chat ini masih kosong
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                // System message
                if (msg.is_system || msg.type === "system") {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full max-w-[80%] text-center">
                        {msg.message}
                      </p>
                    </div>
                  );
                }

                const isOwn = msg.sender_id === user?.id;
                const isAdmin = msg.sender_role === "admin";
                const showAvatar =
                  !isOwn &&
                  (index === 0 ||
                    messages[index - 1].sender_id !== msg.sender_id);

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    {/* Avatar for others */}
                    {!isOwn && (
                      <div className="w-8 flex-shrink-0">
                        {showAvatar && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.sender_photo} />
                            <AvatarFallback
                              className={cn(
                                "text-xs",
                                isAdmin
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {msg.sender_name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}

                    <div className="max-w-[75%]">
                      {/* Sender label */}
                      {showAvatar && !isOwn && (
                        <p
                          className={cn(
                            "text-[10px] font-medium mb-0.5 ml-1",
                            isAdmin ? "text-destructive" : "text-muted-foreground"
                          )}
                        >
                          {msg.sender_name}
                          {isAdmin && " (Admin)"}
                          {msg.sender_role === "photographer" && " (Fotografer)"}
                        </p>
                      )}

                      {/* Bubble */}
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl",
                          isOwn
                            ? "bg-destructive text-destructive-foreground rounded-br-md"
                            : isAdmin
                            ? "bg-destructive/10 border border-destructive/20 rounded-bl-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isOwn
                              ? "text-destructive-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatDistanceToNow(new Date(msg.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* ── Input ── */}
      <footer className="sticky bottom-0 bg-background border-t border-border">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          {chatInfo?.is_locked ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
              <Lock className="h-4 w-4" />
              <span>Percakapan ini dikunci</span>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Admin label */}
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Mengirim sebagai Admin
              </p>
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan sebagai admin..."
                  className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0 bg-destructive hover:bg-destructive/90"
                  disabled={!newMessage.trim() || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default AdminChatRoom;