import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { photographerService } from "@/services/api/photographer.service";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
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
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    setIsLoading(true);

    try {
      const response = await photographerService.createEvent({
        event_name: formData.event_name,
        event_type: formData.event_type || undefined,
        event_date: formData.event_date,
        location: formData.location || undefined,
        description: formData.description || undefined,
        is_public: formData.is_public,
        access_code: formData.access_code || undefined,
        watermark_enabled: formData.watermark_enabled,
        price_per_photo: formData.price_per_photo,
      });

      if (response.success && response.data) {
        toast({
          title: "Success!",
          description: "Event created successfully",
        });
        navigate(`/photographer/events/${response.data.event_id}`);
      } else {
        throw new Error(response.error || 'Failed to create event');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/photographer/events')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Create New Event
            </CardTitle>
            <CardDescription>
              Set up a new photography event
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Grand Ballroom, Jakarta"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
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
                    Set ke 0 untuk download gratis
                  </p>
                  
                  {/* Syarat & Ketentuan FOTOPOIN */}
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Syarat & Ketentuan FOTOPOIN:</strong><br />
                      Ketika foto ini diupload, foto tersebut juga akan terset harga menggunakan FOTOPOIN. 
                      Pemasukan anda akan muncul ketika minimal 5 foto terdownload, 
                      maka anda akan mendapat pendapatan dari FOTOPOIN.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/photographer/events')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Event'
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

export default CreateEvent;
