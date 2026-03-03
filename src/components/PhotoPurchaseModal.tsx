import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
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
    // 🆕 Tambahan: bedakan standalone vs event photo
    // Dikirim dari PhotoGallery saat handleBuyPhoto dipanggil
    type?: 'event' | 'standalone';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const { pay, isLoaded: isSnapLoaded } = useMidtransSnap();

  const isStandalone = photo.type === 'standalone';

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);

      // ─── Pilih endpoint berdasarkan tipe foto ───────────────────────
      // Standalone : POST /api/user/standalone-photos/:id/purchase
      //              → UserController.purchaseStandalonePhoto
      // Event photo : POST /api/user/photos/:id/purchase
      //              → UserController.initiatePhotoPurchase
      // ────────────────────────────────────────────────────────────────
      const response = isStandalone
        ? await userService.purchaseStandalonePhoto(photo.id, "cash")
        : await userService.purchasePhoto(photo.id, "cash");

      if (response.success && response.data) {
        if (response.data.token && isSnapLoaded) {
          try {
            // Tutup modal sebelum buka Snap agar tidak overlap
            onClose();
            await new Promise(resolve => setTimeout(resolve, 300));

            await pay(response.data.token, {
              onSuccess: (result) => {
                toast.success('Pembayaran berhasil!');
                navigate(
                  `/payment/success?order_id=${result.order_id}&transaction_id=${response.data?.transaction_id}`
                );
              },
              onPending: (result) => {
                toast.info('Menunggu pembayaran...');
                navigate(`/payment/pending?order_id=${result.order_id}`);
              },
              onError: (result) => {
                toast.error('Pembayaran gagal');
                navigate(
                  `/payment/failed?order_id=${result.order_id}&status_message=${result.status_message}`
                );
              },
              onClose: () => {
                toast.info('Pembayaran dibatalkan');
                setIsProcessing(false);
              },
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
      } else {
        const errorMessage = response.error || "Gagal memproses pembelian";
        const details = response.details ? ` (${JSON.stringify(response.details)})` : '';
        toast.error(errorMessage + details);
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Gagal memproses pembelian";
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
            Lanjutkan pembayaran melalui payment gateway
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="font-medium text-sm truncate">{photo.filename}</p>
            <p className="text-xs text-muted-foreground">{photo.event_name}</p>
            {isStandalone && (
              <p className="text-xs text-blue-600 font-medium">📍 Foto Standalone</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-base px-3 py-1">
                Rp {photo.price_cash.toLocaleString('id-ID')}
              </Badge>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary bg-primary/5">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Bayar Cash</p>
              <p className="text-xs text-muted-foreground">Via Midtrans (Bank, E-Wallet, QRIS)</p>
            </div>
            <span className="font-semibold text-primary">
              Rp {photo.price_cash.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Summary */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Anda akan membayar Rp {photo.price_cash.toLocaleString('id-ID')} via Midtrans
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
              disabled={isProcessing}
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