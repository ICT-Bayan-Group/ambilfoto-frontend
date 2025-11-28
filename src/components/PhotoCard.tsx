import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, Loader2, AlertCircle, Eye } from "lucide-react";
import { Photo } from "@/services/api/ai.service";
import { aiService } from "@/services/api/ai.service";

interface PhotoCardProps {
  photo: Photo;
  onDownload: (photoId: string) => void;
  isDownloading: boolean;
  onClick: () => void;
}

export const PhotoCard = ({ photo, onDownload, isDownloading, onClick }: PhotoCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getMatchPercentage = (distance?: number) => {
    if (!distance) return 0;
    return Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
  };

  const matchScore = getMatchPercentage(photo.distance);
  const previewUrl = aiService.getPreviewUrl(photo.photo_id);

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
            {photo.metadata?.event_name || 'Unknown Event'}
          </p>
          <div className="flex items-center gap-2 text-xs text-white/80">
            <Calendar className="h-3 w-3" />
            <span>{photo.metadata?.date ? new Date(photo.metadata.date).toLocaleDateString('id-ID') : 'No date'}</span>
          </div>
        </div>
      </div>
      
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
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-3.5 w-3.5" />
          )}
          {isDownloading ? "..." : "Download"}
        </Button>
      </div>
    </Card>
  );
};
