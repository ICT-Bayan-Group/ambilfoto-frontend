import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Search,
  Camera,
  MapPin,
  Crosshair,
  Calendar,
  User,
  ArrowRight,
  Filter,
  X,
  ArrowLeft
} from 'lucide-react';
import { geoPhotoService, GlobalEvent } from '@/services/api/geophoto.service';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Event marker with gradient and animation
const createEventMarker = (isSelected: boolean = false) => {
  return L.divIcon({
    className: 'custom-event-marker',
    html: `
      <div style="
        width: ${isSelected ? '48px' : '40px'};
        height: ${isSelected ? '48px' : '40px'};
        background: linear-gradient(135deg, #5c73f6, #0933c9);
        border: ${isSelected ? '4px' : '3px'} solid white;
        border-radius: 50%;
        box-shadow: 0 ${isSelected ? '6px 20px' : '4px 16px'} rgba(16, 58, 249, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        ${isSelected ? 'animation: selectedPulse 1.5s infinite;' : 'animation: eventPulse 2s infinite;'}
      ">
        <svg width="${isSelected ? '22' : '18'}" height="${isSelected ? '22' : '18'}" viewBox="0 0 24 24" fill="white">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <style>
        @keyframes eventPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes selectedPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 6px 20px rgba(16, 58, 249, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 8px 24px rgba(16, 58, 249, 0.6); }
        }
      </style>
    `,
    iconSize: [isSelected ? 48 : 40, isSelected ? 48 : 40],
    iconAnchor: [isSelected ? 24 : 20, isSelected ? 48 : 40],
    popupAnchor: [0, isSelected ? -48 : -40]
  });
};

// Cluster marker
const createClusterMarker = (count: number) => {
  return L.divIcon({
    className: 'custom-cluster-marker',
    html: `
      <div style="
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #f97316, #ea580c);
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <div style="text-align: center;">
          <div style="color: white; font-size: 18px; font-weight: bold; line-height: 1;">${count}</div>
          <div style="color: rgba(255,255,255,0.9); font-size: 10px; line-height: 1;">events</div>
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -60]
  });
};

// User location marker
const userLocationMarker = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2), 0 2px 8px rgba(0,0,0,0.2);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Map Events Handler
function MapEvents({ onBoundsChange, onZoomChange }: { 
  onBoundsChange: (bounds: string) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const boundsStr = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
      onBoundsChange(boundsStr);
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });
  return null;
}

// Locate Button
function LocateButton({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 12 });
    
    map.on('locationfound', (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
      toast.success('Lokasi ditemukan!');
    });
    
    map.on('locationerror', () => {
      toast.error('Tidak dapat menemukan lokasi');
    });
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-6 right-6 z-[1000] bg-white hover:bg-gray-50 rounded-full p-3.5 shadow-xl border border-gray-200 transition-all hover:scale-105"
      title="Temukan Lokasi Saya"
    >
      <Crosshair className="h-5 w-5 text-gray-700" />
    </button>
  );
}

export default function GlobalEventsMap() {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<GlobalEvent[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bounds, setBounds] = useState<string>('');
  const [zoom, setZoom] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<GlobalEvent | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.2687, 116.8312]); // Balikpapan default

  // Load global events map
  const loadEventsMap = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🌍 Loading global events map...', { bounds, zoom });
      
      const data = await geoPhotoService.getGlobalEventsMap({
        bounds: bounds || undefined,
        zoom,
        cluster: zoom < 12
      });
      
      setEvents(data.events);
      setClusters(data.clusters || []);
      
      // Set initial center if available
      if (data.bounds?.center && !bounds) {
        setMapCenter([data.bounds.center.latitude, data.bounds.center.longitude]);
      }
      
      console.log('✅ Events loaded:', data.events.length, 'events,', data.clusters?.length || 0, 'clusters');
    } catch (error: any) {
      console.error('❌ Map load error:', error);
      toast.error(error.response?.data?.error || 'Gagal memuat peta events');
    } finally {
      setIsLoading(false);
    }
  }, [bounds, zoom]);

  useEffect(() => {
    loadEventsMap();
  }, [loadEventsMap]);

  // Filter events by search query
  const filteredEvents = events.filter(e => 
    searchQuery === '' || 
    e.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEventClick = (event: GlobalEvent) => {
    setSelectedEvent(event);
    setMapCenter([event.latitude, event.longitude]);
  };

  const handleViewEventPhotos = (eventId: string) => {
    navigate(`/user/fotomap/${eventId}`);
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Memuat peta events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-[1001] flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border border-gray-200 transition-all hover:scale-105"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        
        {/* Logo / Title */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-5 py-3 flex items-center gap-3">
            <img 
            src="https://res.cloudinary.com/dwyi4d3rq/image/upload/v1765171746/ambilfoto-logo_hvn8s2.png" 
            alt="Logo AmbilFoto.id" 
            className="h-10 w-auto"
          />
          <div>
            <h1 className="font-bold text-sm">FotoMap AmbilFoto</h1>
            <p className="text-xs text-gray-500">Temukan event di sekitar Anda</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari event atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white shadow-lg border-gray-200 rounded-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Badge */}
        <div className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-2">
          <Camera className="h-4 w-4 text-gray-600" />
          <span className="font-semibold text-sm">{filteredEvents.length}</span>
          <span className="text-xs text-gray-500">events</span>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border border-gray-200 transition-all hover:scale-105"
        >
          <Filter className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapEvents 
            onBoundsChange={setBounds} 
            onZoomChange={setZoom}
          />
          <LocateButton onLocationFound={(lat, lng) => setUserLocation({ lat, lng })} />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationMarker}>
              <Popup className="custom-popup" maxWidth={240}>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Crosshair className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="font-bold text-sm">Lokasi Anda</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <code className="text-xs font-mono text-gray-800">
                      📍 {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                    </code>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Event Clusters (zoom < 12) */}
          {zoom < 12 && clusters.map((cluster, idx) => (
            <Marker
              key={`cluster-${idx}`}
              position={[cluster.center.lat, cluster.center.lng]}
              icon={createClusterMarker(cluster.count)}
              eventHandlers={{
                click: () => {
                  setMapCenter([cluster.center.lat, cluster.center.lng]);
                  setZoom(Math.min(zoom + 3, 18));
                }
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{cluster.count} Events</p>
                      <p className="text-xs text-gray-500">Klik untuk zoom in</p>
                    </div>
                  </div>
                  
                  {/* Preview Photos */}
                  {cluster.preview_photos && cluster.preview_photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {cluster.preview_photos.slice(0, 3).map((url: string, i: number) => (
                        <img 
                          key={i}
                          src={url} 
                          alt={`Preview ${i + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    📸 {cluster.total_photos} total foto
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Individual Event Markers (zoom >= 12) */}
          {zoom >= 12 && filteredEvents.map((event) => (
            <Marker
              key={event.event_id}
              position={[event.latitude, event.longitude]}
              icon={createEventMarker(selectedEvent?.event_id === event.event_id)}
              eventHandlers={{
                click: () => handleEventClick(event)
              }}
            >
              <Popup className="custom-popup" maxWidth={320}>
                <div className="w-full">
                  {/* Preview Photos */}
                  {event.preview_photos && event.preview_photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-1 mb-3 -mx-1 -mt-1">
                      {event.preview_photos.map((url, i) => (
                        <img 
                          key={i}
                          src={url} 
                          alt={`Preview ${i + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-base mb-1">{event.event_name}</h3>
                      {event.location && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.event_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>

                    <div className="grid  gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 text-center mb-1">Total Foto</p>
                        <p className="font-bold text-center text-lg">{event.total_photos}</p>
                      </div>
                      {/* GPS Percentage
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-gray-500 mb-1">GPS Enabled</p>
                        <p className="font-bold text-lg text-blue-600">
                          {event.geo_percentage}%
                        </p>
                      </div> */}
                    </div>

                    {/* Photographer */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {event.photographer.photo ? (
                          <img 
                            src={event.photographer.photo} 
                            alt={event.photographer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{event.photographer.name}</p>
                        <p className="text-xs text-gray-500">Photographer</p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleViewEventPhotos(event.event_id)}
                      className="w-full gap-2 h-9"
                    >
                      Lihat Foto
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 z-[1000]">
          <Card className="bg-white shadow-xl p-4 border border-gray-200">
            <p className="font-semibold text-xs text-gray-500 mb-3 uppercase tracking-wide">Legenda</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex-shrink-0"></div>
                <span className="text-xs font-medium">Event</span>
              </div>
              {zoom < 12 && clusters.length > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex-shrink-0"></div>
                  <span className="text-xs font-medium">Cluster Events</span>
                </div>
              )}
              {userLocation && (
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <span className="text-xs font-medium">Lokasi Anda</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Zoom Info */}
        <div className="absolute top-24 right-6 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2 border border-gray-200">
          <p className="text-xs text-gray-500">
            Zoom: <span className="font-bold text-gray-800">{zoom}</span>
            {zoom < 12 && <span className="text-orange-600 ml-2">(Clustered)</span>}
          </p>
        </div>
      </div>

      {/* Events Sidebar */}
      {showSidebar && (
        <div className="absolute right-4 top-24 bottom-4 w-80 z-[1000] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg">Event Disekitarmu</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {filteredEvents.length} events ditemukan
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Tidak ada event ditemukan</p>
                <p className="text-xs mt-1">Coba zoom out atau geser peta</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <Card
                  key={event.event_id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedEvent?.event_id === event.event_id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex gap-3">
                    {/* Preview Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {event.preview_photos && event.preview_photos[0] ? (
                        <img 
                          src={event.preview_photos[0]} 
                          alt={event.event_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate mb-1">
                        {event.event_name}
                      </h3>
                      {event.location && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {event.location}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {event.total_photos} foto
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-2 gap-1 h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEventPhotos(event.event_id);
                    }}
                  >
                    Lihat Foto
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}