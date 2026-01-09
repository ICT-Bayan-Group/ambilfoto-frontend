import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X, ChevronLeft, ChevronRight, Calendar, MapPin, Camera, Sparkles, Eye, Lock, ShoppingCart, Coins, CreditCard } from "lucide-react";
import { Photo } from "@/services/api/ai.service";
import { UserPhoto } from "@/services/api/user.service";
import { aiService } from "@/services/api/ai.service";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface PhotoDetailModalProps {
  photo: Photo | UserPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (photoId: string) => void;
  onBuy?: (photoId: string) => void;
  onView: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isDownloading: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const PhotoDetailModal = ({
  photo,
  isOpen,
  onClose,
  onDownload,
  onBuy,
  onView,
  onNext,
  onPrevious,
  isDownloading,
  hasNext = false,
  hasPrevious = false,
}: PhotoDetailModalProps) => {
  if (!photo) return null;

  const isUserPhoto = (p: Photo | UserPhoto): p is UserPhoto => {
    return 'event_photo_id' in p;
  };

  const getMatchPercentage = () => {
    if (isUserPhoto(photo)) {
      return Math.round(photo.similarity * 100);
    }
    if (!photo.distance) return 0;
    return Math.max(0, Math.min(100, Math.round((1 - photo.distance) * 100)));
  };

  const matchPercentage = getMatchPercentage();
  
  const previewUrl = isUserPhoto(photo) 
    ? photo.preview_url 
    : aiService.getPreviewUrl(photo.photo_id);
  
  const photoId = isUserPhoto(photo) ? photo.event_photo_id : photo.photo_id;
  
  const eventName = isUserPhoto(photo) 
    ? photo.event_name 
    : photo.metadata?.event_name || 'Untitled Photo';
  
  const eventDate = isUserPhoto(photo) 
    ? photo.event_date 
    : photo.metadata?.date;
  
  const location = isUserPhoto(photo) 
    ? photo.event_location 
    : photo.metadata?.location;
  
  const photographer = isUserPhoto(photo) 
    ? photo.photographer_name 
    : photo.metadata?.photographer;

  const isPurchased = isUserPhoto(photo) ? photo.is_purchased : true;
  const purchasePrice = isUserPhoto(photo) ? photo.purchase_price : 0;

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (percentage >= 70) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50 overflow-hidden rounded-2xl">
        {/* Header with gradient */}
        <div className="relative">
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Image Preview */}
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            <img
              src={previewUrl}
              alt={photo.filename}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Navigation Arrows */}
            {hasPrevious && onPrevious && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious();
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            
            {hasNext && onNext && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {/* Match Badge - Floating */}
            <div className="absolute top-3 left-3">
              <Badge 
                variant="outline" 
                className={`${getMatchColor(matchPercentage)} border backdrop-blur-sm px-3 py-1.5 text-sm font-semibold`}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {matchPercentage}% Match
              </Badge>
            </div>

            {/* Event name overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-bold text-xl drop-shadow-lg">
                {eventName}
              </h3>
              {location && (
                <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            {eventDate && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="text-sm font-medium">
                    {format(new Date(eventDate), "d MMM yyyy", { locale: idLocale })}
                  </p>
                </div>
              </div>
            )}

            {photographer && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fotografer</p>
                  <p className="text-sm font-medium truncate">
                    {photographer}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Match Stats */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Tingkat Kecocokan</span>
              <span className="text-2xl font-bold text-primary">{matchPercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
          </div>

          {/* Filename */}
          <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg font-mono truncate">
            📁 {photo.filename}
          </div>

          {/* Price Info for unpurchased photos */}
          {!isPurchased && purchasePrice && purchasePrice > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Harga Foto</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    Rp {purchasePrice.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    atau {Math.ceil(purchasePrice / 5000)} Points
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={onView}
              className="flex-1 h-12 rounded-xl font-semibold"
            >
              <Eye className="mr-2 h-4 w-4" />
              Lihat Fullscreen
            </Button>
            {!isPurchased && purchasePrice && purchasePrice > 0 ? (
              <Button 
                onClick={() => onBuy?.(photoId)}
                disabled={isDownloading}
                className="flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isDownloading ? (
                  "Processing..."
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Beli Sekarang
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => onDownload(photoId)}
                disabled={isDownloading}
                className="flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isDownloading ? (
                  "Downloading..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download HD
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
