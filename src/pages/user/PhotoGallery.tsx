import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ArrowLeft, Download, Search, Filter, Grid3x3, List, Image as ImageIcon, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PhotoGallery = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const { toast } = useToast();

  // Mock data
  const photos = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    event: i < 8 ? 'Soccer Clinic 2025' : i < 16 ? 'Company Gathering' : 'Birthday Party',
    date: `Nov ${25 - Math.floor(i / 3)}`,
    location: i < 8 ? 'Balikpapan' : i < 16 ? 'Jakarta' : 'Surabaya',
    matchScore: 90 + Math.floor(Math.random() * 10),
  }));

  const events = [
    { value: 'all', label: 'All Events' },
    { value: 'soccer', label: 'Soccer Clinic 2025' },
    { value: 'gathering', label: 'Company Gathering' },
    { value: 'birthday', label: 'Birthday Party' },
  ];

  const handleDownloadAll = () => {
    toast({
      title: "Preparing download",
      description: "Creating ZIP file with all photos...",
    });
  };

  const handlePhotoClick = (id: number) => {
    // Navigate to photo detail or open modal
    console.log('View photo:', id);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
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
                <h1 className="text-3xl font-bold mb-2">Your Photos ({photos.length})</h1>
                <p className="text-muted-foreground">All photos found from face recognition</p>
              </div>
              
              <div className="flex gap-2">
                <Link to="/user/scan-face">
                  <Button variant="outline">
                    Scan Again
                  </Button>
                </Link>
                <Button onClick={handleDownloadAll}>
                  <Download className="mr-2 h-4 w-4" />
                  Download All (ZIP)
                </Button>
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

          {/* Photo Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <Card 
                  key={photo.id}
                  className="overflow-hidden border-border/50 shadow-soft hover:shadow-strong transition-smooth group cursor-pointer"
                  onClick={() => handlePhotoClick(photo.id)}
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground/50 group-hover:scale-110 transition-smooth" />
                    </div>
                    
                    {/* Match score badge */}
                    <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
                      {photo.matchScore}%
                    </div>
                    
                    {/* Info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-smooth">
                      <p className="text-white text-sm font-medium mb-1 line-clamp-1">{photo.event}</p>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Calendar className="h-3 w-3" />
                        <span>{photo.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="p-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                      View
                    </Button>
                    <Button size="sm" className="flex-1 h-8 text-xs">
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {photos.map((photo) => (
                <Card 
                  key={photo.id}
                  className="border-border/50 shadow-soft hover:shadow-strong transition-smooth cursor-pointer"
                  onClick={() => handlePhotoClick(photo.id)}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center shrink-0">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{photo.event}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{photo.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{photo.location}</span>
                        </div>
                        <div className="bg-secondary/10 text-secondary text-xs font-medium px-2 py-1 rounded">
                          Match: {photo.matchScore}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PhotoGallery;
