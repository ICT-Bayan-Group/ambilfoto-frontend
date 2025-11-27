import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, MapPin, Loader2, AlertCircle } from "lucide-react";
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

  return (
    <Card className="border-border/50 shadow-soft hover:shadow-strong transition-smooth">
      <div className="p-4 flex items-center gap-4">
        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0 relative overflow-hidden cursor-pointer" onClick={onClick}>
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0" />
          )}
          
          {imageError ? (
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          ) : (
            <img
              src={previewUrl}
              alt={photo.filename}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1 truncate">
            {photo.metadata?.event_name || 'Unknown Event'}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {photo.metadata?.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(photo.metadata.date).toLocaleDateString()}</span>
              </div>
            )}
            {photo.metadata?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{photo.metadata.location}</span>
              </div>
            )}
            {matchScore > 0 && (
              <div className="bg-secondary/10 text-secondary text-xs font-medium px-2 py-1 rounded">
                Match: {matchScore}%
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            View
          </Button>
          <Button 
            size="sm"
            onClick={() => onDownload(photo.photo_id)}
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
