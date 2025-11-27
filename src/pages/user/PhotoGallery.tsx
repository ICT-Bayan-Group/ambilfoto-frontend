import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, Search, Filter, Grid3x3, List, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService, Photo } from "@/services/api/ai.service";
import { PhotoCard } from "@/components/PhotoCard";
import { PhotoListItem } from "@/components/PhotoListItem";
import { PhotoDetailModal } from "@/components/PhotoDetailModal";
import HeaderDash from "@/components/layout/HeaderDash";

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = () => {
    try {
      setIsLoading(true);
      const storedPhotos = localStorage.getItem('matched_photos');
      
      if (storedPhotos) {
        const parsedPhotos = JSON.parse(storedPhotos);
        setPhotos(parsedPhotos);
        setError("");
      } else {
        setPhotos([]);
        setError("No photos found. Try scanning your face first.");
      }
    } catch (err) {
      console.error('Error loading photos:', err);
      setError("Failed to load photos");
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique events from photos
  const events = useMemo(() => {
    const uniqueEvents = new Set<string>();
    photos.forEach(photo => {
      if (photo.metadata?.event_name) {
        uniqueEvents.add(photo.metadata.event_name);
      }
    });
    
    return [
      { value: 'all', label: 'All Events' },
      ...Array.from(uniqueEvents).map(event => ({
        value: event.toLowerCase().replace(/\s+/g, '-'),
        label: event
      }))
    ];
  }, [photos]);

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    // Filter by event
    if (selectedEvent !== 'all') {
      result = result.filter(photo => 
        photo.metadata?.event_name?.toLowerCase().replace(/\s+/g, '-') === selectedEvent
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(photo => 
        photo.metadata?.event_name?.toLowerCase().includes(query) ||
        photo.metadata?.location?.toLowerCase().includes(query) ||
        photo.filename?.toLowerCase().includes(query)
      );
    }

    // Sort photos
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => 
          new Date(b.metadata?.date || 0).getTime() - new Date(a.metadata?.date || 0).getTime()
        );
        break;
      case 'oldest':
        result.sort((a, b) => 
          new Date(a.metadata?.date || 0).getTime() - new Date(b.metadata?.date || 0).getTime()
        );
        break;
      case 'match':
        result.sort((a, b) => 
          (a.distance || 999) - (b.distance || 999)
        );
        break;
      case 'event':
        result.sort((a, b) => 
          (a.metadata?.event_name || '').localeCompare(b.metadata?.event_name || '')
        );
        break;
    }

    return result;
  }, [photos, selectedEvent, searchQuery, sortBy]);

  const handleDownloadPhoto = async (photoId: string) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(photoId));
      
      const downloadUrl = aiService.getDownloadUrl(photoId);
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Download started",
        description: "Your photo is being downloaded from Dropbox",
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Failed to download photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }
  };

  const handleDownloadAll = () => {
    toast({
      title: "Preparing download",
      description: `Downloading ${filteredPhotos.length} photos...`,
    });
    
    // Download each photo sequentially
    filteredPhotos.forEach((photo, index) => {
      setTimeout(() => {
        const downloadUrl = aiService.getDownloadUrl(photo.photo_id);
        window.open(downloadUrl, '_blank');
      }, index * 500); // Stagger downloads by 500ms
    });
  };

  const getMatchPercentage = (distance?: number) => {
    if (!distance) return 0;
    // Convert distance to percentage (lower distance = higher match)
    // Assuming distance ranges from 0 to 1
    return Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const handleNext = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.photo_id === selectedPhoto.photo_id);
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.photo_id === selectedPhoto.photo_id);
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
    }
  };

  const selectedPhotoIndex = selectedPhoto 
    ? filteredPhotos.findIndex(p => p.photo_id === selectedPhoto.photo_id)
    : -1;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <HeaderDash />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-12 w-full mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty state
  if (!isLoading && photos.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
       <HeaderDash />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl">
            <Link 
              to="/user/dashboard" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <Card className="border-border/50 shadow-soft">
              <div className="p-12 text-center">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Photos Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error || "We couldn't find any photos matching your face. Try scanning your face to discover your photos."}
                </p>
                <Button onClick={() => navigate('/user/scan-face')}>
                  <Camera className="mr-2 h-4 w-4" />
                  Scan Your Face
                </Button>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderDash />
      
      <main className="flex-1 py-8">
        <div className="container max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <Link 
              to="/user/dashboard" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-smooth"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Your Photos ({filteredPhotos.length})</h1>
                <p className="text-muted-foreground">
                  {filteredPhotos.length === photos.length 
                    ? "All photos found from face recognition"
                    : `Showing ${filteredPhotos.length} of ${photos.length} photos`
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link to="/user/scan-face">
                  <Button variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Scan Again
                  </Button>
                </Link>
                {filteredPhotos.length > 0 && (
                  <Button onClick={handleDownloadAll}>
                    <Download className="mr-2 h-4 w-4" />
                    Download All ({filteredPhotos.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filters & Controls */}
          <Card className="mb-6 border-border/50 shadow-soft">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by event, date, or location..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Event Filter */}
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="match">Best Match</SelectItem>
                    <SelectItem value="event">By Event</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* View Mode Toggle */}
                <div className="flex gap-1 border border-border rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Photo Grid/List */}
          {filteredPhotos.length === 0 ? (
            <Card className="border-border/50 shadow-soft p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos match your filters</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedEvent('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.photo_id}
                  photo={photo}
                  onDownload={handleDownloadPhoto}
                  isDownloading={downloadingIds.has(photo.photo_id)}
                  onClick={() => handlePhotoClick(photo)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPhotos.map((photo) => (
                <PhotoListItem
                  key={photo.photo_id}
                  photo={photo}
                  onDownload={handleDownloadPhoto}
                  isDownloading={downloadingIds.has(photo.photo_id)}
                  onClick={() => handlePhotoClick(photo)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        photo={selectedPhoto}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onDownload={handleDownloadPhoto}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isDownloading={selectedPhoto ? downloadingIds.has(selectedPhoto.photo_id) : false}
        hasNext={selectedPhotoIndex < filteredPhotos.length - 1}
        hasPrevious={selectedPhotoIndex > 0}
      />
    </div>
  );
};

export default PhotoGallery;
