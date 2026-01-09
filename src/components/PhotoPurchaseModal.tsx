import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Coins, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/services/api/payment.service";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

interface PhotoPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: {
    id: string;
    filename: string;
    event_name: string;
    price: number;
    price_in_points: number;
  };
  userPointBalance: number;
  onPurchaseSuccess: (downloadUrl?: string) => void;
}

export const PhotoPurchaseModal = ({
  isOpen,
  onClose,
  photo,
  userPointBalance,
  onPurchaseSuccess,
}: PhotoPurchaseModalProps) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "points">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const { pay, isLoaded: isSnapLoaded } = useMidtransSnap();

  const canPayWithPoints = userPointBalance >= photo.price_in_points;

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      
      const response = await paymentService.purchasePhoto(photo.id, paymentMethod);
      
      if (response.success && response.data) {
        if (paymentMethod === "points") {
          toast.success("Photo purchased successfully!");
          onPurchaseSuccess(response.data.download_url);
          onClose();
        } else {
          // Use Midtrans Snap if token available, otherwise redirect
          if (response.data.token && isSnapLoaded) {
            try {
              await pay(response.data.token, {
                onSuccess: (result) => {
                  toast.success("Pembayaran berhasil!");
                  navigate(`/payment/success?order_id=${result.order_id}&transaction_id=${response.data?.transaction_id}`);
                },
                onPending: (result) => {
                  toast.info("Menunggu pembayaran...");
                  navigate(`/payment/pending?order_id=${result.order_id}`);
                },
                onError: (result) => {
                  toast.error("Pembayaran gagal");
                  navigate(`/payment/failed?order_id=${result.order_id}&status_message=${result.status_message}`);
                },
                onClose: () => {
                  toast.info("Pembayaran dibatalkan");
                  setIsProcessing(false);
                }
              });
            } catch (snapError) {
              console.error("Snap error:", snapError);
              // Fallback to redirect
              if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
              }
            }
          } else if (response.data.payment_url) {
            // Redirect to Midtrans payment page
            window.location.href = response.data.payment_url;
          }
          onClose();
        }
      } else {
        toast.error(response.error || "Failed to process purchase");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.response?.data?.error || "Failed to process purchase");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Purchase Photo
          </DialogTitle>
          <DialogDescription>
            Choose your preferred payment method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="font-medium text-sm truncate">{photo.filename}</p>
            <p className="text-xs text-muted-foreground">{photo.event_name}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                Rp {photo.price.toLocaleString('id-ID')}
              </Badge>
              <span className="text-xs text-muted-foreground">or</span>
              <Badge variant="outline" className="gap-1">
                <Coins className="h-3 w-3" />
                {photo.price_in_points} Points
              </Badge>
            </div>
          </div>

          {/* Payment Method Selection */}
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as "cash" | "points")}
            className="space-y-3"
          >
            {/* Cash Payment */}
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Pay with Cash</p>
                      <p className="text-xs text-muted-foreground">Via Midtrans (Bank, E-Wallet, etc)</p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    Rp {photo.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </Label>
            </div>

            {/* Points Payment */}
            <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
              canPayWithPoints 
                ? "border-border hover:border-primary/50" 
                : "border-border/50 opacity-60"
            }`}>
              <RadioGroupItem value="points" id="points" disabled={!canPayWithPoints} />
              <Label htmlFor="points" className={`flex-1 ${canPayWithPoints ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Coins className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">Pay with Points</p>
                      <p className="text-xs text-muted-foreground">
                        Your balance: {userPointBalance.toFixed(2)} Points
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    {photo.price_in_points}
                  </span>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Insufficient Points Warning */}
          {!canPayWithPoints && paymentMethod === "points" && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Insufficient Points</p>
                <p className="text-xs text-muted-foreground">
                  You need {photo.price_in_points} points but only have {userPointBalance.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={isProcessing || (paymentMethod === "points" && !canPayWithPoints)}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
