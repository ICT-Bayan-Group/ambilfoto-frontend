import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, MapPin, Loader2, AlertCircle, Eye, Sparkles } from "lucide-react";
import { Photo } from "@/services/api/ai.service";
import { aiService } from "@/services/api/ai.service";

interface PhotoListItemProps {
  photo: Photo;
  onDownload: (photoId: string) => void;
  isDownloading: boolean;
  onClick: () => void;
}

export const PhotoListItem = ({ photo, onDownload, isDownloading, onClick }: PhotoListItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getMatchPercentage = (distance?: number) => {
    if (!distance) return 0;
    return Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
  };

  const matchScore = getMatchPercentage(photo.distance);
  const previewUrl = aiService.getPreviewUrl(photo.photo_id);

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
            {photo.metadata?.event_name || 'Unknown Event'}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {photo.metadata?.date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(photo.metadata.date).toLocaleDateString('id-ID')}</span>
              </div>
            )}
            {photo.metadata?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">{photo.metadata.location}</span>
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
