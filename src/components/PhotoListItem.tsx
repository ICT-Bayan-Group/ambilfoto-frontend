import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, MapPin, Loader2, AlertCircle, Eye, Sparkles } from "lucide-react";
import { Photo } from "@/services/api/ai.service";
import { aiService } from "@/services/api/ai.service";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PhotoListItemProps {
  photo: Photo;
  onDownload: (photoId: string) => void;
  isDownloading: boolean;
  onClick: () => void;
}

export const PhotoListItem = ({ photo, onDownload, isDownloading, onClick }: PhotoListItemProps) => {
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
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return format(date, "d MMM yyyy", { locale: id });
    } catch (error) {
      console.error('Date format error:', error);
      return null;
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
    if (percentage >= 90) return "bg-green-500/10 text-green-500 border-green-500/30";
    if (percentage >= 70) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
    return "bg-orange-500/10 text-orange-500 border-orange-500/30";
  };

  return (
    <Card className="border-border/50 shadow-soft hover:shadow-strong transition-smooth rounded-xl overflow-hidden">
      <div className="p-4 flex items-center gap-4">
        {/* Thumbnail */}
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
                onError={() => {
                  console.error('Image load error for photo:', photo.photo_id);
                  setImageError(true);
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1.5 truncate text-base">
            {eventName}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {/* ✅ FIXED: Tanggal - Always show */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate || 'No date'}</span>
            </div>
            
            {/* Location - Only if exists */}
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">{location}</span>
              </div>
            )}
            
            {/* Match score - Only if exists */}
            {matchScore > 0 && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${getMatchColor(matchScore)}`}>
                <Sparkles className="h-3 w-3" />
                <span>{matchScore}% Match</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 shrink-0">
          <Button 
            size="sm" 
            variant="outline"
            className="h-9 rounded-lg font-medium"
            onClick={onClick}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>
          <Button 
            size="sm"
            className="h-9 rounded-lg font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(photo.photo_id);
            }}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};