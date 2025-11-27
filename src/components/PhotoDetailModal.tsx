import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X, ChevronLeft, ChevronRight, Calendar, MapPin, Camera, Star } from "lucide-react";
import { Photo } from "@/services/api/ai.service";
import { aiService } from "@/services/api/ai.service";
import { format } from "date-fns";

interface PhotoDetailModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (photoId: string) => void;
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
  onNext,
  onPrevious,
  isDownloading,
  hasNext = false,
  hasPrevious = false,
}: PhotoDetailModalProps) => {
  if (!photo) return null;

  const getMatchPercentage = (distance?: number) => {
    if (!distance) return 0;
    return Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
  };

  const matchPercentage = getMatchPercentage(photo.distance);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Photo Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={aiService.getPreviewUrl(photo.photo_id)}
              alt={photo.filename}
              className="w-full h-full object-contain"
            />
            
            {/* Navigation Arrows */}
            {hasPrevious && onPrevious && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            
            {hasNext && onNext && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={onNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {/* Match Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                {matchPercentage}% Match
              </Badge>
            </div>
          </div>

          {/* Photo Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Photo Information</h3>
              <div className="grid gap-3">
                {/* Event Name */}
                {photo.metadata?.event_name && (
                  <div className="flex items-start gap-3">
                    <Camera className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Event</p>
                      <p className="font-medium">{photo.metadata.event_name}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {photo.metadata?.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{photo.metadata.location}</p>
                    </div>
                  </div>
                )}

                {/* Date */}
                {photo.metadata?.date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {format(new Date(photo.metadata.date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Photographer */}
                {photo.metadata?.photographer && (
                  <div className="flex items-start gap-3">
                    <Camera className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Photographer</p>
                      <p className="font-medium">{photo.metadata.photographer}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Match Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Match Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                  <p className="text-2xl font-bold text-primary">{matchPercentage}%</p>
                </div>
                {photo.cosine_similarity && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm text-muted-foreground mb-1">Similarity</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(photo.cosine_similarity * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Filename */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Filename</p>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded">
                {photo.filename}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={() => onDownload(photo.photo_id)}
              disabled={isDownloading}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Original"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
