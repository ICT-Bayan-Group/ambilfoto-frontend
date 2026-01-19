import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, Loader2, AlertCircle, Eye, Lock, ShoppingCart, Coins } from "lucide-react";
import { Photo } from "@/services/api/ai.service";
import { UserPhoto } from "@/services/api/user.service";
import { aiService } from "@/services/api/ai.service";

interface PhotoCardProps {
  photo: Photo | UserPhoto;
  onDownload: (photoId: string) => void;
  onBuy?: (photoId: string) => void;
  isDownloading: boolean;
  onClick: () => void;
}

export const PhotoCard = ({ photo, onDownload, onBuy, isDownloading, onClick }: PhotoCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const matchScore = getMatchPercentage();
  
  const previewUrl = isUserPhoto(photo) 
    ? photo.preview_url 
    : aiService.getPreviewUrl(photo.photo_id);
  
  const photoId = isUserPhoto(photo) ? photo.event_photo_id : photo.photo_id;
  
  const eventName = isUserPhoto(photo) 
    ? photo.event_name 
    : photo.metadata?.event_name || 'Unknown Event';
  
  const eventDate = isUserPhoto(photo) 
    ? photo.event_date 
    : photo.metadata?.date;

  // Get purchase and pricing info using CTA logic from backend
  const isPurchased = isUserPhoto(photo) ? photo.is_purchased : true;
  const isForSale = isUserPhoto(photo) ? (photo.is_for_sale !== false) : false;
  const priceCash = isUserPhoto(photo) ? (photo.price_cash || photo.price || photo.purchase_price || 0) : 0;
  const pricePoints = isUserPhoto(photo) ? (photo.price_points || photo.price_in_points || 0) : 0;
  
  // Get CTA from backend or calculate it
  const cta = isUserPhoto(photo) 
    ? (photo.cta || (isPurchased ? 'DOWNLOAD' : (isForSale && priceCash > 0 ? 'BUY' : 'FREE_DOWNLOAD')))
    : 'DOWNLOAD';
  
  const priceDisplay = isUserPhoto(photo) ? photo.price_display : '';

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500 text-white";
    if (percentage >= 70) return "bg-yellow-500 text-white";
    return "bg-orange-500 text-white";
  };

  return (
    <Card className="overflow-hidden border-border/50 shadow-soft hover:shadow-strong transition-smooth group rounded-xl">
      <div className="aspect-square bg-muted relative cursor-pointer" onClick={onClick}>
        {!imageLoaded && !imageError && (
          <Skeleton className="absolute inset-0" />
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <AlertCircle className="h-12 w-12" />
          </div>
        ) : (
          <img
            src={previewUrl}
            alt={photo.filename}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Match score badge */}
        {matchScore > 0 && (
          <div className={`absolute top-2 right-2 ${getMatchColor(matchScore)} text-xs font-bold px-2.5 py-1 rounded-full shadow-lg`}>
            {matchScore}%
          </div>
        )}
        
        {/* Hover overlay with view icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-sm font-semibold mb-1 line-clamp-1">
            {eventName}
          </p>
          <div className="flex items-center gap-2 text-xs text-white/80">
            <Calendar className="h-3 w-3" />
            <span>{eventDate ? new Date(eventDate).toLocaleDateString('id-ID') : 'No date'}</span>
          </div>
        </div>
      </div>
      
      {/* Price badge for unpurchased photos */}
      {cta === 'BUY' && (priceCash > 0 || pricePoints > 0) && (
        <div className="px-3 pt-2 bg-card">
          <Badge variant="secondary" className="w-full justify-center gap-1.5 py-1.5">
            <Coins className="h-3.5 w-3.5" />
            {priceDisplay || `${pricePoints} FOTOPOIN`}
          </Badge>
        </div>
      )}

      {/* Free badge */}
      {cta === 'FREE_DOWNLOAD' && (
        <div className="px-3 pt-2 bg-card">
          <Badge variant="outline" className="w-full justify-center gap-1.5 py-1.5 text-green-600 border-green-500/30">
            GRATIS
          </Badge>
        </div>
      )}

      {/* Purchased badge */}
      {cta === 'DOWNLOAD' && isPurchased && (
        <div className="px-3 pt-2 bg-card">
          <Badge className="w-full justify-center gap-1.5 py-1.5 bg-green-500/20 text-green-600 border-green-500/30">
            ✓ Sudah Dibeli
          </Badge>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-3 flex gap-2 bg-card">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-9 text-xs font-medium rounded-lg"
          onClick={onClick}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
        {cta === 'BUY' ? (
          <Button 
            size="sm" 
            className="flex-1 h-9 text-xs font-medium rounded-lg bg-gradient-to-r from-primary to-primary/80"
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.(photoId);
            }}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isDownloading ? "..." : "Beli"}
          </Button>
        ) : cta === 'FREE_DOWNLOAD' ? (
          <Button 
            size="sm" 
            className="flex-1 h-9 text-xs font-medium rounded-lg bg-green-600 hover:bg-green-500"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(photoId);
            }}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isDownloading ? "..." : "Free"}
          </Button>
        ) : (
          <Button 
            size="sm" 
            className="flex-1 h-9 text-xs font-medium rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(photoId);
            }}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isDownloading ? "..." : "Download"}
          </Button>
        )}
      </div>
    </Card>
  );
};
