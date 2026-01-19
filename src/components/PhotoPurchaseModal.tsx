import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Coins, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/api/user.service";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

interface PhotoPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: {
    id: string;
    filename: string;
    event_name: string;
    price_cash: number;
    price_points: number;
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

  const canPayWithPoints = userPointBalance >= photo.price_points;

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      
      const response = await userService.purchasePhoto(photo.id, paymentMethod);
      
      if (response.success && response.data) {
        if (paymentMethod === "points") {
          // FOTOPOIN payment - instant success
          toast.success("Foto berhasil dibeli dengan FOTOPOIN!");
          onPurchaseSuccess(response.data.download_url);
          onClose();
        } else {
          // Cash payment - TUTUP MODAL DULU sebelum buka Snap
          if (response.data.token && isSnapLoaded) {
            try {
              // PENTING: Tutup modal sebelum membuka Snap
              onClose();
              
              // Tunggu sebentar agar animasi close modal selesai
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Baru buka Midtrans Snap
              await pay(response.data.token, {
                onSuccess: (result) => {
                  toast.success('Pembayaran berhasil!');
                  navigate(`/payment/success?order_id=${result.order_id}&transaction_id=${response.data?.transaction_id}`);
                },
                onPending: (result) => {
                  toast.info('Menunggu pembayaran...');
                  navigate(`/payment/pending?order_id=${result.order_id}`);
                },
                onError: (result) => {
                  toast.error('Pembayaran gagal');
                  navigate(`/payment/failed?order_id=${result.order_id}&status_message=${result.status_message}`);
                },
                onClose: () => {
                  // User menutup Snap tanpa menyelesaikan pembayaran
                  toast.info('Pembayaran dibatalkan');
                  setIsProcessing(false);
                  // Modal sudah tertutup, tidak perlu buka lagi
                }
              });
            } catch (snapError) {
              console.error("Snap error:", snapError);
              if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
              } else {
                toast.error('Gagal membuka payment gateway');
                setIsProcessing(false);
              }
            }
          } else if (response.data.payment_url) {
            onClose();
            window.location.href = response.data.payment_url;
          } else {
            toast.error('Payment URL tidak tersedia');
            setIsProcessing(false);
          }
        }
      } else {
        const errorMessage = response.error || "Gagal memproses pembelian";
        const details = response.details ? ` (${JSON.stringify(response.details)})` : '';
        toast.error(errorMessage + details);
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Gagal memproses pembelian";
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Beli Foto
          </DialogTitle>
          <DialogDescription>
            Pilih metode pembayaran yang kamu inginkan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="font-medium text-sm truncate">{photo.filename}</p>
            <p className="text-xs text-muted-foreground">{photo.event_name}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                Rp {photo.price_cash.toLocaleString('id-ID')}
              </Badge>
              <span className="text-xs text-muted-foreground">atau</span>
              <Badge variant="outline" className="gap-1">
                <Coins className="h-3 w-3" />
                {photo.price_points} FOTOPOIN
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
            <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
              paymentMethod === 'cash' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}>
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Bayar Cash</p>
                      <p className="text-xs text-muted-foreground">Via Midtrans (Bank, E-Wallet, QRIS)</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">
                    Rp {photo.price_cash.toLocaleString('id-ID')}
                  </span>
                </div>
              </Label>
            </div>

            {/* Points Payment */}
            <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
              !canPayWithPoints 
                ? "border-border/50 opacity-60" 
                : paymentMethod === 'points'
                  ? 'border-yellow-500 bg-yellow-500/5'
                  : "border-border hover:border-yellow-500/50"
            }`}>
              <RadioGroupItem value="points" id="points" disabled={!canPayWithPoints} />
              <Label htmlFor="points" className={`flex-1 ${canPayWithPoints ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Coins className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">Bayar FOTOPOIN</p>
                      <p className="text-xs text-muted-foreground">
                        Saldo anda: <span className="font-semibold">{userPointBalance.toLocaleString('id-ID')}</span> FOTOPOIN
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold flex items-center gap-1 text-yellow-600">
                    <Coins className="h-4 w-4" />
                    {photo.price_points}
                  </span>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Insufficient Points Warning */}
          {!canPayWithPoints && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Saldo FOTOPOIN Tidak Cukup</p>
                <p className="text-xs text-muted-foreground">
                  Anda membutuhkan {photo.price_points} FOTOPOIN tetapi hanya memiliki {userPointBalance.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}

          {/* Selected method summary */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {paymentMethod === 'cash' 
                ? `Anda akan membayar Rp ${photo.price_cash.toLocaleString('id-ID')} via Midtrans`
                : `Anda akan menggunakan ${photo.price_points} FOTOPOIN`
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={isProcessing || (paymentMethod === "points" && !canPayWithPoints)}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Konfirmasi Beli
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};