import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Camera, 
  Image as ImageIcon,
  Download,
  Eye,
  Settings,
  Share2,
  Globe,
  Lock,
  Edit2,
  Map as MapIconLucide
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { photographerService } from '@/services/api/photographer.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// ✅ Use the correct types from service
import type { EventDetail, PublicEventPhoto } from '@/services/api/photographer.service';

export default function PhotographerEventPublicView() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [photos, setPhotos] = useState<PublicEventPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PublicEventPhoto | null>(null);

  useEffect(() => {
    if (eventSlug) {
      loadEventData();
    }
  }, [eventSlug]);

  const loadEventData = async () => {
    if (!eventSlug) return;
    
    try {
      setIsLoading(true);
      
      // ✅ Load event by slug (public endpoint)
      console.log('🔍 Loading event by slug:', eventSlug);
      const eventResponse = await photographerService.getEventBySlug(eventSlug);
      const eventData = eventResponse.data.event;
      setEvent(eventData);
      
      console.log('✅ Event loaded:', {
        id: eventData.id,
        name: eventData.event_name,
        slug: eventData.event_slug,
        total_photos: eventData.total_photos
      });
      
      // ✅ Load photos using public endpoint with eventId
      console.log('📸 Loading photos for event:', eventData.id);
      const photosResponse = await photographerService.getEventPhotos(eventData.id);
      setPhotos(photosResponse.data.photos);
      
      console.log('✅ Photos loaded:', photosResponse.data.photos.length);
      
    } catch (error: any) {
      console.error('❌ Failed to load event:', error);
      
      // ✅ Better error handling
      if (error.response?.status === 404) {
        toast.error('Event tidak ditemukan');
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke event ini');
      } else {
        toast.error('Gagal memuat data event');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = (photo: PublicEventPhoto) => {
    setSelectedPhoto(photo);
  };

  // ✅ FIXED: Share dengan slug URL
  const handleShare = async () => {
    // Gunakan slug untuk public URL yang lebih cantik
    const shareUrl = event?.event_slug 
      ? `${window.location.origin}/event/${event.event_slug}`
      : window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.event_name,
          text: event?.description || 'Lihat foto-foto dari event ini',
          url: shareUrl,
        });
        toast.success('Berhasil share event!');
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link berhasil disalin!');
      } catch (error) {
        toast.error('Gagal menyalin link');
      }
    }
  };

  // ✅ Helper function to format date
  const formatEventDate = (dateString: string) => {
    try {
      if (dateString.includes('|')) {
        return dateString;
      }
      return format(new Date(dateString), 'EEEE | dd MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  // ✅ Check if user is photographer
  const isPhotographer = () => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return false;
    
    try {
      const user = JSON.parse(userData);
      return user.role === 'photographer';
    } catch {
      return false;
    }
  };

  // ✅ NEW: Navigate to photographer management with slug redirect
  const navigateToPhotographerManagement = (path: string) => {
    if (!event) return;
    
    // Store the slug in state untuk redirect kembali
    navigate(path, {
      state: {
        fromSlug: event.event_slug,
        returnUrl: `/event/${event.event_slug}`
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-6 bg-white/10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Event Tidak Ditemukan</h1>
          <p className="text-white/70 mb-6">Event yang Anda cari tidak tersedia</p>
          <Button onClick={() => navigate('/')} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          >
            <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-400 opacity-20 rounded-full blur-sm" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full"
              title="Share Event"
            >
              <Share2 className="h-5 w-5" />
            </Button>

            {/* ✅ Photographer Management Buttons */}
            {isPhotographer() && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateToPhotographerManagement(`/photographer/events/${event.id}`)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                  title="Kelola Event"
                >
                  <Settings className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateToPhotographerManagement(`/photographer/fotomap/${event.id}`)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                  title="Lihat Peta"
                >
                  <MapIconLucide className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Event Info Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 text-white mb-8">
          <div className="flex items-start gap-4 mb-6">
            {/* Event Logo/Icon */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Camera className="h-8 w-8 md:h-10 md:h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{event.event_name}</h1>
              
              {/* ✅ ADDED: Display public URL */}
              {event.event_slug && (
                <div className="mb-3 text-sm text-white/60">
                  <code className="bg-white/10 px-2 py-1 rounded">
                    fotopoin.com/event/{event.event_slug}
                  </code>
                </div>
              )}
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <ImageIcon className="h-4 w-4" />
                  <span className="font-semibold">{event.total_photos} Foto</span>
                </div>
                
                {/* ✅ Show geo percentage */}
                {event.geo_enabled_photos > 0 && (
                  <>
                    <div className="w-px h-4 bg-white/30" />
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <MapPin className="h-4 w-4" />
                      <span>{event.geo_enabled_photos} GPS ({event.geo_percentage || 0}%)</span>
                    </div>
                  </>
                )}
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">{event.location}</span>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm md:text-base">
                  {formatEventDate(event.event_date)}
                </span>
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-white/10 rounded-2xl p-4 mb-4">
                  <p className="text-sm md:text-base leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge 
                  variant={event.is_public ? "default" : "secondary"}
                  className="bg-white/20 text-white border-white/30"
                >
                  {event.is_public ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
                
                {event.event_latitude && event.event_longitude && (
                  <Badge className="bg-green-500/20 text-white border-green-300/30">
                    <MapPin className="h-3 w-3 mr-1" />
                    Lokasi GPS Tersedia
                  </Badge>
                )}
              </div>

              {/* ✅ Photographer Info */}
              {event.photographer && (
                <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                    {event.photographer.photo ? (
                      <img 
                        src={event.photographer.photo} 
                        alt={event.photographer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Fotografer</p>
                    <p className="text-sm font-semibold">{event.photographer.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            Galeri Foto
          </h2>
          
          {/* ✅ Map button for photographer with GPS photos */}
          {event.geo_enabled_photos > 0 && isPhotographer() && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateToPhotographerManagement(`/photographer/fotomap/${event.id}`)}
              className="gap-2"
            >
              <MapIconLucide className="h-4 w-4" />
              Lihat di Peta
            </Button>
          )}
        </div>

        {/* Photo Gallery Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-8">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-white/10 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl"
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={photo.preview_url}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {photo.is_for_sale ? (
                          photo.price_points > 0 ? `${photo.price_points} Poin` : 'Gratis'
                        ) : 'Tidak Dijual'}
                      </Badge>
                      
                      {photo.has_location && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          GPS
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {photo.matched_users}
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {photo.faces_count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {photo.has_location && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum Ada Foto</h3>
            <p className="text-white/70 mb-4">
              Event ini belum memiliki foto yang tersedia
            </p>
            
            {/* ✅ Upload button for photographer */}
            {isPhotographer() && (
              <Button
                onClick={() => navigateToPhotographerManagement(`/photographer/events/${event.id}`)}
                variant="secondary"
              >
                <Camera className="h-4 w-4 mr-2" />
                Upload Foto
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-3xl">×</span>
            </button>
            
            {/* Photo Image */}
            <img
              src={selectedPhoto.preview_url}
              alt={selectedPhoto.filename}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            
            {/* Photo Info */}
            <div className="mt-4 bg-white rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold mb-2">{selectedPhoto.filename}</h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {selectedPhoto.matched_users} matches
                </span>
                <span className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  {selectedPhoto.faces_count} faces
                </span>
                {selectedPhoto.has_location && (
                  <Badge className="bg-green-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    GPS
                  </Badge>
                )}
              </div>

              {/* ✅ Price info */}
              {selectedPhoto.is_for_sale && (
                <div className="mb-3 p-2 bg-purple-50 rounded">
                  <p className="text-sm font-medium text-purple-900">
                    Harga: {selectedPhoto.price_points > 0 ? `${selectedPhoto.price_points} Poin` : 'Gratis'}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                {/* ✅ Edit button for photographer */}
                {isPhotographer() && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedPhoto(null);
                      navigateToPhotographerManagement(`/photographer/events/${event.id}?photoId=${selectedPhoto.id}`);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Detail
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedPhoto.download_url, '_blank')}
                  className={isPhotographer() ? "flex-1" : "w-full"}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}