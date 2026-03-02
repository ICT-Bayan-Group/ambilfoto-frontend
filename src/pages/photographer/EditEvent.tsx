import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { photographerService, Event } from "@/services/api/photographer.service";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Loader2, MapPin, Locate, Save, AlertCircle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const EditEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  
  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "",
    event_date: "",
    location: "",
    description: "",
    is_public: true,
    access_code: "",
    watermark_enabled: true,
    price_per_photo: 0,
    is_collaborative: false,                   // 🆕
    max_collaborators: null as number | null,  // 🆕
    status: "active" as "active" | "completed" | "archived",
    event_latitude: null as number | null,
    event_longitude: null as number | null,
  });

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      const response = await photographerService.getEventDetails(eventId!);
      
      if (response.success && response.data) {
        const eventData = response.data.event;
        setEvent(eventData);
        
        // Populate form with existing data
        setFormData({
          event_name: eventData.event_name || "",
          event_type: eventData.event_type || "",
          event_date: eventData.event_date ? eventData.event_date.split('T')[0] : "",
          location: eventData.location || "",
          description: eventData.description || "",
          is_public: eventData.is_public,
          access_code: eventData.access_code || "",
          watermark_enabled: eventData.watermark_enabled,
          price_per_photo: eventData.price_per_photo || 0,
          status: eventData.status,
          event_latitude: (eventData as any).event_latitude || null,
          event_longitude: (eventData as any).event_longitude || null,
           is_collaborative: (eventData as any).is_collaborative || false,          // 🆕
          max_collaborators: (eventData as any).max_collaborators || null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
      navigate('/photographer/events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation tidak didukung di browser ini",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleChange('event_latitude', latitude);
        handleChange('event_longitude', longitude);
        
        toast({
          title: "Lokasi Terdeteksi!",
          description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Error",
          description: "Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.",
          variant: "destructive",
        });
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleRemoveLocation = () => {
    handleChange('event_latitude', null);
    handleChange('event_longitude', null);
    toast({
      title: "GPS Location Removed",
      description: "Event location has been removed from map",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.event_name || !formData.event_date) {
      toast({
        title: "Error",
        description: "Event name and date are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const updateData: any = {
        event_name: formData.event_name,
        event_type: formData.event_type || undefined,
        event_date: formData.event_date,
        location: formData.location || undefined,
        description: formData.description || undefined,
        is_public: formData.is_public,
        access_code: formData.access_code || undefined,
        watermark_enabled: formData.watermark_enabled,
        price_per_photo: formData.price_per_photo,
        status: formData.status,
        event_latitude: formData.event_latitude,
        event_longitude: formData.event_longitude,
        is_collaborative: formData.is_collaborative,            // 🆕
        max_collaborators: formData.max_collaborators || null,  // 🆕
      };

      const response = await photographerService.updateEvent(eventId!, updateData);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Event updated successfully",
        });
        navigate(`/photographer/events/${eventId}`);
      } else {
        throw new Error(response.error || 'Failed to update event');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-10 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
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
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/photographer/events/${eventId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Edit Event
            </CardTitle>
            <CardDescription>
              Update event details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event_name">Event Name *</Label>
                  <Input
                    id="event_name"
                    placeholder="e.g., Wedding of John & Jane"
                    value={formData.event_name}
                    onChange={(e) => handleChange('event_name', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Mengubah nama akan mengubah URL publik event
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select
                      value={formData.event_type}
                      onValueChange={(value) => handleChange('event_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_date">Event Date *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => handleChange('event_date', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Event Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Status event (Active: sedang berlangsung, Completed: selesai, Archived: diarsipkan)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location Name</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Grand Ballroom, Jakarta"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>

                {/* GPS Coordinates Section */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Event GPS Location
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set koordinat untuk menampilkan lokasi event di FotoMap
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {formData.event_latitude && formData.event_longitude && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveLocation}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Remove Location
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                      >
                        {isLocating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Locate className="h-4 w-4 mr-2" />
                        )}
                        {isLocating ? 'Detecting...' : 'Use Current Location'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="event_latitude" className="text-xs">Latitude</Label>
                      <Input
                        id="event_latitude"
                        type="number"
                        step="0.000001"
                        placeholder="-6.200000"
                        value={formData.event_latitude || ''}
                        onChange={(e) => handleChange('event_latitude', parseFloat(e.target.value) || null)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="event_longitude" className="text-xs">Longitude</Label>
                      <Input
                        id="event_longitude"
                        type="number"
                        step="0.000001"
                        placeholder="106.816666"
                        value={formData.event_longitude || ''}
                        onChange={(e) => handleChange('event_longitude', parseFloat(e.target.value) || null)}
                      />
                    </div>
                  </div>

                  {formData.event_latitude && formData.event_longitude ? (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <MapPin className="h-3 w-3" />
                      <span>
                        Event location will appear on FotoMap: {Number(formData.event_latitude).toFixed(6)}, {Number(formData.event_longitude).toFixed(6)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span>No GPS location set - event won't appear on FotoMap</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the event..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Event Kolaboratif
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Izinkan fotografer lain bergabung dan upload foto ke event ini
                  </p>
                </div>
                <Switch
                  checked={formData.is_collaborative}
                  onCheckedChange={(checked) => {
                    handleChange('is_collaborative', checked);
                    if (!checked) handleChange('max_collaborators', null);
                  }}
                />
              </div>

              {formData.is_collaborative && (
                <div className="space-y-1 pt-2 border-t">
                  <Label htmlFor="max_collaborators" className="text-sm">
                    Maks. Kolaborator (opsional)
                  </Label>
                  <Input
                    id="max_collaborators"
                    type="number"
                    min={1}
                    max={50}
                    placeholder="Kosongkan = tidak terbatas"
                    value={formData.max_collaborators || ''}
                    onChange={(e) =>
                      handleChange('max_collaborators', parseInt(e.target.value) || null)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Berapa maksimal fotografer yang bisa bergabung ke event ini
                  </p>
                </div>
              )}
            </div>

              {/* Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Event Settings</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_public">Public Event</Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone can search and find photos from this event
                    </p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => handleChange('is_public', checked)}
                  />
                </div>

                {!formData.is_public && (
                  <div className="space-y-2">
                    <Label htmlFor="access_code">Access Code</Label>
                    <Input
                      id="access_code"
                      placeholder="Enter access code for private event"
                      value={formData.access_code}
                      onChange={(e) => handleChange('access_code', e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="watermark_enabled">Enable Watermark</Label>
                    <p className="text-sm text-muted-foreground">
                      Add watermark to preview photos
                    </p>
                  </div>
                  <Switch
                    id="watermark_enabled"
                    checked={formData.watermark_enabled}
                    onCheckedChange={(checked) => handleChange('watermark_enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_photo">Harga per Foto (Rp)</Label>
                  <Input
                    id="price_per_photo"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0 untuk gratis"
                    value={formData.price_per_photo}
                    onChange={(e) => handleChange('price_per_photo', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Harga default untuk foto-foto di event ini. Set ke 0 untuk download gratis.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/photographer/events/${eventId}`)}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default EditEvent;