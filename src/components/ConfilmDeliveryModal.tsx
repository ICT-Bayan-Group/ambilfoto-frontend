// src/components/ConfirmDeliveryModal.tsx

import { useState } from 'react';
import { buyerEscrowService, BuyerPurchase } from '@/services/api/buyer.escrow.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ConfirmDeliveryModalProps {
  open: boolean;
  onClose: () => void;
  purchase: BuyerPurchase;
  onSuccess: () => void;
}

const ConfirmDeliveryModal = ({ open, onClose, purchase, onSuccess }: ConfirmDeliveryModalProps) => {
  const [decision, setDecision] = useState<'YES' | 'NO' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRequestRevision = purchase.escrow.revision_count < purchase.escrow.max_revisions;

  const handleSubmit = async () => {
    if (!decision) {
      toast.error('Silakan pilih salah satu opsi');
      return;
    }

    if (decision === 'NO' && !rejectionReason.trim()) {
      toast.error('Silakan berikan alasan penolakan');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await buyerEscrowService.confirmDelivery(
        purchase.transaction_id,
        decision,
        decision === 'NO' ? rejectionReason : undefined
      );

      if (response.success) {
        if (decision === 'YES') {
          toast.success('✅ Foto dikonfirmasi! Pembayaran telah dikirim ke fotografer.');
        } else {
          toast.success('🔄 Revisi diminta. Fotografer akan mengunggah ulang.');
        }
        onSuccess();
      } else {
        if (response.error_code === 'MAX_REVISIONS_EXCEEDED') {
          toast.error('Batas revisi tercapai. Foto disetujui otomatis.');
          onSuccess();
        } else {
          toast.error(response.error || 'Gagal memproses konfirmasi');
        }
      }
    } catch (error) {
      toast.error('Gagal memproses konfirmasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDecision(null);
      setRejectionReason('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Kualitas Pengiriman</DialogTitle>
          <DialogDescription>
            Periksa foto resolusi tinggi dan konfirmasi apakah sesuai harapan Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Photo Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{purchase.photo.filename}</p>
            <p className="text-sm text-muted-foreground">{purchase.photo.event_name}</p>
            {purchase.delivery && (
              <p className="text-xs text-muted-foreground mt-1">
                Versi {purchase.delivery.version} • {purchase.delivery.resolution}
              </p>
            )}
          </div>

          {/* Decision Radio */}
          <RadioGroup value={decision || ''} onValueChange={(v) => setDecision(v as 'YES' | 'NO')}>
            <div className="space-y-3">
              {/* YES Option */}
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                <RadioGroupItem value="YES" id="yes" />
                <Label htmlFor="yes" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700">Terima Foto</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kualitas foto sudah baik. Kirim pembayaran ke fotografer.
                  </p>
                </Label>
              </div>

              {/* NO Option */}
              <div className={`
                flex items-start space-x-3 p-3 border rounded-lg transition-colors cursor-pointer
                ${canRequestRevision ? 'hover:bg-orange-50' : 'opacity-50 cursor-not-allowed'}
              `}>
                <RadioGroupItem value="NO" id="no" disabled={!canRequestRevision} />
                <Label htmlFor="no" className={`flex-1 ${canRequestRevision ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-700">Minta Revisi</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Foto perlu perbaikan. Minta fotografer untuk mengunggah ulang.
                  </p>
                  {!canRequestRevision && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Batas revisi maksimal ({purchase.escrow.max_revisions}) telah tercapai
                    </p>
                  )}
                  {canRequestRevision && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Revisi: {purchase.escrow.revision_count}/{purchase.escrow.max_revisions}
                    </p>
                  )}
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Rejection Reason */}
          {decision === 'NO' && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Alasan Revisi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Jelaskan apa yang perlu diperbaiki (contoh: kecerahan terlalu rendah, orientasi salah, terpotong tidak tepat, dll.)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Berikan penjelasan spesifik agar fotografer dapat memberikan kualitas yang lebih baik
              </p>
            </div>
          )}

          {/* Warning Alert */}
          {decision === 'YES' && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Konfirmasi bersifat final.</strong> Pembayaran akan langsung dikirim ke fotografer.
              </AlertDescription>
            </Alert>
          )}

          {decision === 'NO' && canRequestRevision && (
            <Alert className="border-orange-500 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Fotografer memiliki waktu 48 jam untuk mengunggah ulang versi yang lebih baik.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!decision || isSubmitting || (decision === 'NO' && !rejectionReason.trim())}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : decision === 'YES' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Konfirmasi & Kirim Pembayaran
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Minta Revisi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeliveryModal;