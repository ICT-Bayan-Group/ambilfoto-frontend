import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import PhotographerHeader from "@/components/layout/HeaderPhoto";
import { Footer } from "@/components/layout/Footer";
import { photographerService, Event, EventPhoto } from "@/services/api/photographer.service";
import { aiService } from "@/services/api/ai.service";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Upload,
  Image,
  Users,
  Calendar,
  MapPin,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadingPhoto {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  facesDetected?: number;
  error?: string;
}

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletePhotoDialog, setDeletePhotoDialog] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<EventPhoto | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await photographerService.getEventDetails(eventId!);
      if (response.success && response.data) {
        setEvent(response.data.event);
        setPhotos(response.data.photos);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: UploadingPhoto[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0,
    }));

    setUploadingPhotos((prev) => [...prev, ...newPhotos]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeUploadingPhoto = (id: string) => {
    setUploadingPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const uploadPhotos = async () => {
    if (uploadingPhotos.length === 0 || !eventId) return;

    setIsUploading(true);

    for (let i = 0; i < uploadingPhotos.length; i++) {
      const photo = uploadingPhotos[i];
      if (photo.status !== 'pending') continue;

      // Update status to uploading
      setUploadingPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, status: 'uploading' as const, progress: 10 } : p
        )
      );

      try {
        // Convert file to base64
        const base64 = await fileToBase64(photo.file);
        
        // Update progress
        setUploadingPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id ? { ...p, progress: 50 } : p
          )
        );

        // Upload to API
        const response = await photographerService.uploadPhoto(eventId, {
          face_image: base64,
          filename: photo.file.name,
          upload_order: i + 1,
        });

        if (response.success && response.data) {
          setUploadingPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id
                ? {
                    ...p,
                    status: 'success' as const,
                    progress: 100,
                    facesDetected: response.data!.faces_detected,
                  }
                : p
            )
          );
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      } catch (error: any) {
        setUploadingPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, status: 'error' as const, error: error.message }
              : p
          )
        );
      }
    }

    setIsUploading(false);
    fetchEventDetails(); // Refresh photos list

    // Show summary toast
    const successful = uploadingPhotos.filter((p) => p.status === 'success').length;
    const failed = uploadingPhotos.filter((p) => p.status === 'error').length;

    if (successful > 0) {
      toast({
        title: "Upload Complete",
        description: `${successful} photo(s) uploaded successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete || !eventId) return;

    try {
      const response = await photographerService.deletePhoto(eventId, photoToDelete.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Photo deleted successfully",
        });
        fetchEventDetails();
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete photo",
        variant: "destructive",
      });
    } finally {
      setDeletePhotoDialog(false);
      setPhotoToDelete(null);
    }
  };

  const clearCompletedUploads = () => {
    setUploadingPhotos((prev) => {
      prev.forEach((p) => {
        if (p.status === 'success' || p.status === 'error') {
          URL.revokeObjectURL(p.preview);
        }
      });
      return prev.filter((p) => p.status === 'pending' || p.status === 'uploading');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
           <PhotographerHeader />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <PhotographerHeader />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button onClick={() => navigate('/photographer/events')}>
            Back to Events
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        <PhotographerHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button & Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/photographer/events')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{event.event_name}</h1>
                <Badge className={
                  event.status === 'active' 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-muted text-muted-foreground'
                }>
                  {event.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(event.event_date), 'MMMM dd, yyyy')}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
            <Link to={`/photographer/events/${eventId}/edit`}>
              <Button variant="outline">Edit Event</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{photos.length}</p>
                  <p className="text-xs text-muted-foreground">Photos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {photos.reduce((sum, p) => sum + (p.faces_count || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Faces Detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Photos
            </CardTitle>
            <CardDescription>
              Upload photos to this event. AI will automatically detect faces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Click to upload photos</p>
              <p className="text-sm text-muted-foreground mt-1">
                Support: JPG, PNG, WEBP
              </p>
            </div>

            {/* Upload Queue */}
            {uploadingPhotos.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Upload Queue ({uploadingPhotos.length})</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCompletedUploads}
                      disabled={isUploading}
                    >
                      Clear Completed
                    </Button>
                    <Button
                      size="sm"
                      onClick={uploadPhotos}
                      disabled={isUploading || uploadingPhotos.every((p) => p.status !== 'pending')}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload All
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {uploadingPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={photo.preview}
                          alt={photo.file.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Status Overlay */}
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          {photo.status === 'pending' && (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                          {photo.status === 'uploading' && (
                            <div className="text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                              <span className="text-xs">{photo.progress}%</span>
                            </div>
                          )}
                          {photo.status === 'success' && (
                            <div className="text-center text-green-600">
                              <CheckCircle className="h-6 w-6 mx-auto mb-1" />
                              <span className="text-xs">{photo.facesDetected} faces</span>
                            </div>
                          )}
                          {photo.status === 'error' && (
                            <div className="text-center text-destructive">
                              <AlertCircle className="h-6 w-6 mx-auto mb-1" />
                              <span className="text-xs">Failed</span>
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        {photo.status === 'pending' && (
                          <button
                            onClick={() => removeUploadingPhoto(photo.id)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photos Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Event Photos ({photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <Image className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No photos uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={aiService.getPreviewUrl(photo.ai_photo_id)}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
                      <p className="text-xs truncate">{photo.filename}</p>
                      <p className="text-xs text-muted-foreground">{photo.faces_count} faces</p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setPhotoToDelete(photo);
                        setDeletePhotoDialog(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Delete Photo Dialog */}
      <AlertDialog open={deletePhotoDialog} onOpenChange={setDeletePhotoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{photoToDelete?.filename}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDetail;
