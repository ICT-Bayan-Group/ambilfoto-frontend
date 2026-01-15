import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, MapPin, Loader2, AlertCircle, Eye, Sparkles, ShoppingCart, Coins } from "lucide-react";
import { Photo } from "@/services/api/ai.service";
import { UserPhoto } from "@/services/api/user.service";
import { aiService } from "@/services/api/ai.service";

interface PhotoListItemProps {
  photo: Photo | UserPhoto;
  onDownload: (photoId: string) => void;
  onBuy?: (photoId: string) => void;
  isDownloading: boolean;
  onClick: () => void;
}

export const PhotoListItem = ({ photo, onDownload, onBuy, isDownloading, onClick }: PhotoListItemProps) => {
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
  
  const location = isUserPhoto(photo) 
    ? photo.event_location 
    : photo.metadata?.location;

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
    if (percentage >= 90) return "bg-green-500/10 text-green-500 border-green-500/30";
    if (percentage >= 70) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
    return "bg-orange-500/10 text-orange-500 border-orange-500/30";
  };

  return (
    <Card className="border-border/50 shadow-soft hover:shadow-strong transition-smooth rounded-xl overflow-hidden">
      <div className="p-4 flex items-center gap-4">
        <div 
          className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center shrink-0 relative overflow-hidden cursor-pointer group" 
          onClick={onClick}
        >
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0" />
          )}
          
          {imageError ? (
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          ) : (
            <>
              <img
                src={previewUrl}
                alt={photo.filename}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1.5 truncate text-base">
            {eventName}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {eventDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(eventDate).toLocaleDateString('id-ID')}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">{location}</span>
              </div>
            )}
            {matchScore > 0 && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${getMatchColor(matchScore)}`}>
                <Sparkles className="h-3 w-3" />
                <span>{matchScore}% Match</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 shrink-0 items-center">
          {/* Price/Status badge */}
          {cta === 'BUY' && (
            <Badge variant="secondary" className="gap-1 hidden sm:flex">
              <Coins className="h-3 w-3" />
              {priceDisplay || `${pricePoints} FOTOPOIN`}
            </Badge>
          )}
          {cta === 'FREE_DOWNLOAD' && (
            <Badge variant="outline" className="gap-1 hidden sm:flex text-green-600 border-green-500/30">
              GRATIS
            </Badge>
          )}
          {cta === 'DOWNLOAD' && isPurchased && (
            <Badge className="gap-1 hidden sm:flex bg-green-500/20 text-green-600 border-green-500/30">
              ✓ Dibeli
            </Badge>
          )}
          
          <Button 
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={onClick}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>
          
          {cta === 'BUY' ? (
            <Button 
              size="sm"
              className="rounded-lg bg-gradient-to-r from-primary to-primary/80"
              onClick={(e) => {
                e.stopPropagation();
                onBuy?.(photoId);
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-1.5 h-4 w-4" />
                  Beli
                </>
              )}
            </Button>
          ) : cta === 'FREE_DOWNLOAD' ? (
            <Button 
              size="sm"
              className="rounded-lg bg-green-600 hover:bg-green-500"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(photoId);
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ...
                </>
              ) : (
                <>
                  <Download className="mr-1.5 h-4 w-4" />
                  Free
                </>
              )}
            </Button>
          ) : (
            <Button 
              size="sm"
              className="rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(photoId);
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ...
                </>
              ) : (
                <>
                  <Download className="mr-1.5 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
