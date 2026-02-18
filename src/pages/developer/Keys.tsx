import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLayout } from "@/components/developer/DeveloperLayout";
import { developerService, ApiKey } from "@/services/api/developer.service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Key, Copy, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";

const DeveloperKeys = () => {
  const { id } = useParams<{ id: string }>();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyData, setNewKeyData] = useState<{ raw_key: string; key_type: string } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const loadKeys = () => {
    if (!id) return;
    developerService.getKeys(id)
      .then((res) => { if (res.success) setKeys(res.data); })
      .catch(() => toast({ title: "Failed to load keys", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadKeys(); }, [id]);

  const handleRegenerate = async (keyType: "dev" | "prod") => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await developerService.regenerateKey(id, keyType);
      if (res.success) {
        setNewKeyData({ raw_key: res.data.raw_key, key_type: res.data.key_type });
        loadKeys();
        toast({ title: "Key regenerated", description: "Save your new key now!" });
      }
    } catch (err: any) {
      toast({ title: "Failed to regenerate", description: err.response?.data?.error, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!id || !revokeTarget) return;
    setActionLoading(true);
    try {
      await developerService.revokeKey(id, revokeTarget.id, revokeReason);
      setRevokeTarget(null);
      setRevokeReason("");
      loadKeys();
      toast({ title: "Key revoked" });
    } catch (err: any) {
      toast({ title: "Failed to revoke", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const copyKey = () => {
    if (newKeyData) {
      navigator.clipboard.writeText(newKeyData.raw_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-secondary/10 text-secondary border-secondary/20",
      expired: "bg-muted text-muted-foreground",
      revoked: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return map[status] || "";
  };

  if (!id) return null;

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" /> API Keys
          </h1>
          <p className="text-muted-foreground mt-1">Manage your development and production API keys.</p>
        </div>

        {/* Info banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-primary">Security Notice</p>
            <p className="text-muted-foreground mt-0.5">
              API keys are shown only once upon generation. Store them securely — they cannot be retrieved again. Revoke compromised keys immediately.
            </p>
          </div>
        </div>

        {/* Keys */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(["dev", "prod"] as const).map((type) => {
              const key = keys.find((k) => k.key_type === type);
              return (
                <Card key={type} className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${key?.status === "active" ? "bg-secondary" : "bg-muted-foreground"}`} />
                        {type === "dev" ? "Development" : "Production"} Key
                      </CardTitle>
                      {key && (
                        <Badge variant="outline" className={statusBadge(key.status)}>
                          {key.status}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {type === "dev" ? "Use for testing. Not for production traffic." : "Use in live environment only."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {key ? (
                      <>
                        <div className="rounded-lg bg-muted/50 px-4 py-3">
                          <p className="font-mono text-sm">{key.key_prefix}••••••••••••••••••••</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {format(parseISO(key.expires_at), "dd MMM yyyy")}
                          </div>
                          <div>{key.request_count.toLocaleString()} requests</div>
                          {key.last_used_at && (
                            <div className="col-span-2">
                              Last used: {format(parseISO(key.last_used_at), "dd MMM yyyy HH:mm")}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5"
                            onClick={() => handleRegenerate(type)}
                            disabled={actionLoading}
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                          </Button>
                          {key.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive hover:text-destructive"
                              onClick={() => setRevokeTarget(key)}
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Revoke
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground space-y-3">
                        <p>No {type} key generated yet.</p>
                        <Button size="sm" onClick={() => handleRegenerate(type)} disabled={actionLoading}>
                          <Key className="h-3.5 w-3.5 mr-1.5" /> Generate Key
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* New key modal */}
        <Dialog open={!!newKeyData} onOpenChange={() => setNewKeyData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-secondary">
                <CheckCircle2 className="h-5 w-5" /> New Key Generated
              </DialogTitle>
              <DialogDescription>
                This is the only time your full API key will be shown. Copy and store it securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Your {newKeyData?.key_type} API Key</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={newKeyData?.raw_key || ""}
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyKey}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                ⚠️ Save this key now. It will not be shown again.
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={() => setNewKeyData(null)}>
                I've saved my key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke confirm */}
        <AlertDialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The key will stop working immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <Label>Reason (optional)</Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Key might be compromised"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevoke}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={actionLoading}
              >
                Revoke Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperKeys;
