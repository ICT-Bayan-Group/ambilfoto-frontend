import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, Loader2, AlertCircle, Eye, Sparkles } from "lucide-react";
import { Photo } from "@/services/api/ai.service";
import { aiService } from "@/services/api/ai.service";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PhotoCardProps {
  photo: Photo;
  onDownload: (photoId: string) => void;
  isDownloading: boolean;
  onClick: () => void;
}

export const PhotoCard = ({ photo, onDownload, isDownloading, onClick }: PhotoCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ✅ Helper functions untuk extract metadata
  const getEventDate = () => {
    // Cek berbagai kemungkinan field name
    return photo.metadata?.event_date || 
           photo.metadata?.date || 
           null;
  };

  const getEventName = () => {
    return photo.metadata?.event_name || 
  
           'Unknown Event';
  };

  const getLocation = () => {
    return photo.metadata?.location || 
        
           null;
  };

  // ✅ Format date dengan error handling
  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, "d MMM yyyy", { locale: id });
    } catch (error) {
      console.error('Date format error:', error);
      return 'Invalid date';
    }
  };

  const getMatchPercentage = (distance?: number) => {
    if (!distance) return 0;
    return Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
  };

  const matchScore = getMatchPercentage(photo.distance);
  const previewUrl = aiService.getPreviewUrl(photo.photo_id);
  const eventDate = getEventDate();
  const formattedDate = formatEventDate(eventDate);
  const eventName = getEventName();
  const location = getLocation();

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500 text-white";
    if (percentage >= 70) return "bg-yellow-500 text-white";
    return "bg-orange-500 text-white";
  };

  const getMatchBadgeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500/90 backdrop-blur-sm";
    if (percentage >= 70) return "bg-yellow-500/90 backdrop-blur-sm";
    return "bg-orange-500/90 backdrop-blur-sm";
  };

  return (
    <Card className="overflow-hidden border-border/50 shadow-soft hover:shadow-strong transition-smooth group rounded-xl">
      {/* Image Container */}
      <div className="aspect-square bg-muted relative cursor-pointer" onClick={onClick}>
        {!imageLoaded && !imageError && (
          <Skeleton className="absolute inset-0" />
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <AlertCircle className="h-12 w-12" />
          </div>
        ) : (
          <>
            <img
              src={previewUrl}
              alt={photo.filename}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Image load error for photo:', photo.photo_id);
                setImageError(true);
              }}
            />

            {/* Match score badge - Top Right */}
            {matchScore > 0 && (
              <div className={`absolute top-2 right-2 ${getMatchBadgeColor(matchScore)} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                <Sparkles className="h-3 w-3" />
                {matchScore}%
              </div>
            )}
            
            {/* Hover overlay with view icon */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-100 scale-90">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <Eye className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
            
            {/* Info overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {/* Event Name */}
              <p className="text-white text-sm font-semibold mb-1.5 line-clamp-1">
                {eventName}
              </p>
              
              {/* ✅ FIXED: Tanggal dengan format yang benar */}
              <div className="flex items-center gap-2 text-xs text-white/90">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
              
              {/* Location - Optional */}
              {location && (
                <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="p-3 flex gap-2 bg-card">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-9 text-xs font-medium rounded-lg hover:bg-secondary/50"
          onClick={onClick}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
        <Button 
          size="sm" 
          className="flex-1 h-9 text-xs font-medium rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(photo.photo_id);
          }}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ...
            </>
          ) : (
            <>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};