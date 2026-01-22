import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  MapPin, 
  Save, 
  Upload,
  ChevronLeft,
  Image as ImageIcon,
  MapPinOff,
  Check,
  X,
  Layers,
  BarChart3,
  Edit2,
  RefreshCw
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  geoPhotoService, 
  GeoPhoto, 
  LocationStats
} from '@/services/api/geophoto.service';
import { photographerService } from '@/services/api/photographer.service';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const geoEnabledIcon = L.divIcon({
  className: 'geo-enabled-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: hsl(142, 76%, 36%);
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const selectedIcon = L.divIcon({
  className: 'selected-marker',
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: hsl(var(--primary));
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 1.5s infinite;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="12" r="4"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Map click handler
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function PhotoLocations() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [photos, setPhotos] = useState<GeoPhoto[]>([]);
  const [stats, setStats] = useState<LocationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState('');
  
  // Selection states
  const [selectedPhoto, setSelectedPhoto] = useState<GeoPhoto | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newLocation, setNewLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [editReason, setEditReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Bulk edit
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkPhotos, setBulkPhotos] = useState<string[]>([]);
  const [bulkLocation, setBulkLocation] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });
  const [bulkReason, setBulkReason] = useState('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  
  const mapRef = useRef<L.Map | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    if (!eventId) return;
    
    try {
      setIsLoading(true);
      
      const [mapData, statsData, eventResponse] = await Promise.all([
        geoPhotoService.getEventPhotosMap(eventId, { cluster: false }),
        geoPhotoService.getLocationStats(eventId),
        photographerService.getEventDetails(eventId),
      ]);
      
      setPhotos(mapData.photos);
      setStats(statsData);
      if (eventResponse.data?.event) {
        setEventName(eventResponse.data.event.event_name);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Gagal memuat data lokasi');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePhotoSelect = (photo: GeoPhoto) => {
    setSelectedPhoto(photo);
    setNewLocation({ lat: photo.latitude, lng: photo.longitude });
    setEditMode(false);
    
    if (mapRef.current) {
      mapRef.current.setView([photo.latitude, photo.longitude], 16);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (editMode && selectedPhoto) {
      setNewLocation({ lat, lng });
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedPhoto || !newLocation) return;
    
    try {
      setIsSaving(true);
      
      await geoPhotoService.updatePhotoLocation(selectedPhoto.id, {
        latitude: newLocation.lat,
        longitude: newLocation.lng,
        reason: editReason || 'Manual location update',
      });
      
      toast.success('Lokasi foto berhasil diperbarui');
      setEditMode(false);
      setEditReason('');
      loadData();
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error('Gagal memperbarui lokasi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkSave = async () => {
    if (bulkPhotos.length === 0 || !bulkLocation.lat || !bulkLocation.lng) {
      toast.error('Pilih foto dan masukkan koordinat');
      return;
    }
    
    try {
      setIsBulkSaving(true);
      
      const updates = bulkPhotos.map(photoId => ({
        photo_id: photoId,
        latitude: parseFloat(bulkLocation.lat),
        longitude: parseFloat(bulkLocation.lng),
      }));
      
      const result = await geoPhotoService.bulkUpdateLocations(
        eventId!,
        updates,
        bulkReason || 'Bulk location update'
      );
      
      toast.success(`Berhasil update ${result.updated} dari ${result.total} foto`);
      setShowBulkDialog(false);
      setBulkPhotos([]);
      setBulkLocation({ lat: '', lng: '' });
      setBulkReason('');
      loadData();
    } catch (error) {
      console.error('Failed to bulk update:', error);
      toast.error('Gagal melakukan bulk update');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const photosWithGPS = photos.filter(p => p.latitude && p.longitude);
  const photosWithoutGPS = photos.filter(p => !p.latitude || !p.longitude);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[500px] lg:col-span-2" />
            <Skeleton className="h-[500px]" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const defaultCenter: [number, number] = stats?.bounds?.center
    ? [stats.bounds.center.latitude, stats.bounds.center.longitude]
    : [-6.2, 106.816];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Kelola Lokasi Foto
              </h1>
              <p className="text-muted-foreground">{eventName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowBulkDialog(true)}
              disabled={photosWithoutGPS.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Update ({photosWithoutGPS.length})
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total_photos}</p>
                    <p className="text-xs text-muted-foreground">Total Foto</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.geo_enabled_photos}</p>
                    <p className="text-xs text-muted-foreground">Dengan GPS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPinOff className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.sources.none}</p>
                    <p className="text-xs text-muted-foreground">Tanpa GPS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.geo_percentage}%</p>
                    <p className="text-xs text-muted-foreground">Coverage</p>
                  </div>
                </div>
                <Progress value={stats.geo_percentage} className="mt-2 h-1" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Peta Lokasi
                </span>
                {editMode && (
                  <Badge variant="destructive">Mode Edit - Klik peta untuk set lokasi</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] rounded-b-lg overflow-hidden">
                <MapContainer
                  center={defaultCenter}
                  zoom={14}
                  className="h-full w-full"
                  ref={mapRef}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapClickHandler onMapClick={handleMapClick} />

                  {/* Photo markers */}
                  {photosWithGPS.map((photo) => (
                    <Marker
                      key={photo.id}
                      position={[photo.latitude, photo.longitude]}
                      icon={selectedPhoto?.id === photo.id ? selectedIcon : geoEnabledIcon}
                      eventHandlers={{
                        click: () => handlePhotoSelect(photo),
                      }}
                    >
                      <Popup>
                        <div className="w-40">
                          <img
                            src={photo.preview_url}
                            alt={photo.filename}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                          <p className="text-sm font-medium truncate">{photo.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            Sumber: {photo.location_source}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* New location marker (edit mode) */}
                  {editMode && newLocation && (
                    <Marker
                      position={[newLocation.lat, newLocation.lng]}
                      icon={L.divIcon({
                        className: 'new-location-marker',
                        html: `
                          <div style="
                            width: 40px;
                            height: 40px;
                            background: hsl(25, 95%, 53%);
                            border: 3px solid white;
                            border-radius: 50%;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          ">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            </svg>
                          </div>
                        `,
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                      })}
                    />
                  )}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Photo Details */}
            {selectedPhoto ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Detail Foto
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedPhoto(null);
                        setEditMode(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img
                    src={selectedPhoto.preview_url}
                    alt={selectedPhoto.filename}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  
                  <div>
                    <p className="font-medium truncate">{selectedPhoto.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      Sumber: {selectedPhoto.location_source}
                    </p>
                  </div>

                  {editMode ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Latitude</Label>
                          <Input
                            value={newLocation?.lat.toFixed(6) || ''}
                            onChange={(e) => setNewLocation(prev => 
                              prev ? { ...prev, lat: parseFloat(e.target.value) || 0 } : null
                            )}
                            placeholder="-6.200000"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Longitude</Label>
                          <Input
                            value={newLocation?.lng.toFixed(6) || ''}
                            onChange={(e) => setNewLocation(prev => 
                              prev ? { ...prev, lng: parseFloat(e.target.value) || 0 } : null
                            )}
                            placeholder="106.816666"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Alasan Perubahan</Label>
                        <Textarea
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          placeholder="Koreksi lokasi..."
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleSaveLocation}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Simpan
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditMode(false);
                            setNewLocation({ 
                              lat: selectedPhoto.latitude, 
                              lng: selectedPhoto.longitude 
                            });
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Koordinat</p>
                        <p className="font-mono text-sm">
                          {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                        </p>
                      </div>
                      
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Lokasi
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Klik marker di peta untuk melihat detail</p>
                </CardContent>
              </Card>
            )}

            {/* Photos without GPS */}
            {photosWithoutGPS.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPinOff className="h-5 w-5 text-orange-500" />
                    Tanpa Lokasi ({photosWithoutGPS.length})
                  </CardTitle>
                  <CardDescription>
                    Foto-foto ini belum memiliki data GPS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {photosWithoutGPS.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative rounded overflow-hidden cursor-pointer border-2 transition-colors ${
                          bulkPhotos.includes(photo.id) 
                            ? 'border-primary' 
                            : 'border-transparent hover:border-muted-foreground'
                        }`}
                        onClick={() => {
                          setBulkPhotos(prev => 
                            prev.includes(photo.id)
                              ? prev.filter(id => id !== photo.id)
                              : [...prev, photo.id]
                          );
                        }}
                      >
                        <img
                          src={photo.preview_url}
                          alt={photo.filename}
                          className="w-full h-16 object-cover"
                        />
                        {bulkPhotos.includes(photo.id) && (
                          <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {bulkPhotos.length > 0 && (
                    <Button
                      className="w-full mt-3"
                      onClick={() => setShowBulkDialog(true)}
                    >
                      Set Lokasi untuk {bulkPhotos.length} Foto
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Lokasi</DialogTitle>
            <DialogDescription>
              Set lokasi untuk {bulkPhotos.length} foto yang dipilih
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  value={bulkLocation.lat}
                  onChange={(e) => setBulkLocation(prev => ({ ...prev, lat: e.target.value }))}
                  placeholder="-6.200000"
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  value={bulkLocation.lng}
                  onChange={(e) => setBulkLocation(prev => ({ ...prev, lng: e.target.value }))}
                  placeholder="106.816666"
                />
              </div>
            </div>
            
            <div>
              <Label>Alasan (opsional)</Label>
              <Textarea
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Semua foto diambil di lokasi yang sama..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleBulkSave} disabled={isBulkSaving}>
              {isBulkSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update {bulkPhotos.length} Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
