import { useState, useRef } from 'react';
import { photographerEscrowService, PendingOrder } from '@/services/api/photographer.escrow.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface HiResUploadModalProps {
  open: boolean;
  onClose: () => void;
  order: PendingOrder;
  onSuccess: () => void;
}

const HiResUploadModal = ({ open, onClose, order, onSuccess }: HiResUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Tipe file tidak valid. Gunakan JPG, PNG, atau TIFF.');
      return;
    }
    
    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File terlalu besar. Maksimal 50MB.');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      const response = await photographerEscrowService.uploadHiResPhoto(
        order.transaction_id,
        file,
        notes
      );
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        toast.success(response.message || 'Unggah berhasil!');
        onSuccess();
      } else {
        toast.error(response.error || 'Unggah gagal');
      }
    } catch (error) {
      toast.error('Unggah gagal');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unggah Foto Resolusi Tinggi</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Unggah untuk "{order.photo.filename}"
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Requirements */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4 text-sm space-y-1">
              <p className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Persyaratan:
              </p>
              <ul className="text-muted-foreground list-disc list-inside">
                <li>Resolusi minimal: 2000x2000</li>
                <li>Format: JPG, PNG, TIFF</li>
                <li>Ukuran maksimal: 50MB</li>
                <li>Tanpa watermark</li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/tiff"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {preview ? (
              <div className="space-y-2">
                <img src={preview} alt="Pratinjau" className="max-h-40 mx-auto rounded" />
                <p className="text-sm font-medium">{file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Klik untuk memilih file</p>
              </div>
            )}
          </div>
          
          {/* Photographer Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan untuk pembeli..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-muted-foreground">
                Mengunggah... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Batal
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Mengunggah...' : 'Unggah'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HiResUploadModal;