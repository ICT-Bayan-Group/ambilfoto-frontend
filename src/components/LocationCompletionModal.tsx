// frontend/src/components/photographer/LocationCompletionModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, X, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { photographerService, Province, City, LocationUpdateResponse } from '@/services/api/photographer.service';

interface LocationCompletionModalProps {
  open: boolean;
  onClose?: () => void;
  onComplete?: (locationData: LocationUpdateResponse) => void;
}

const LocationCompletionModal: React.FC<LocationCompletionModalProps> = ({ 
  open, 
  onClose, 
  onComplete 
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { toast } = useToast();

  // Monitor provinces state changes
  useEffect(() => {
    console.log('🔍 Provinces state updated:', {
      count: provinces.length,
      provinces: provinces.slice(0, 3) // Show first 3 for debugging
    });
  }, [provinces]);

  // Monitor cities state changes
  useEffect(() => {
    console.log('🔍 Cities state updated:', {
      count: cities.length,
      cities: cities.slice(0, 3)
    });
  }, [cities]);

  // Load provinces on mount
  useEffect(() => {
    if (open) {
      console.log('📂 Modal opened, loading provinces...');
      loadProvinces();
    }
  }, [open]);

  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      console.log('📍 Province selected:', selectedProvince);
      loadCities(selectedProvince);
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedProvince]);

  const loadProvinces = async (): Promise<void> => {
    setLoadingProvinces(true);
    setError('');
    
    try {
      console.log('🔄 Calling getProvinces API...');
      
      const response = await photographerService.getProvinces();
      
      console.log('📦 API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Provinces loaded successfully:', {
          count: response.data.length,
          firstProvince: response.data[0],
          allProvinces: response.data
        });
        
        setProvinces(response.data);
      } else {
        console.error('❌ API returned success=false or no data:', response);
        setError('Data provinsi tidak tersedia');
        toast({
          title: "Error",
          description: "Data provinsi tidak tersedia",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('❌ Load provinces error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError('Gagal memuat data provinsi');
      toast({
        title: "Error",
        description: "Gagal memuat data provinsi. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoadingProvinces(false);
      console.log('✋ Province loading completed');
    }
  };

  const loadCities = async (provinceId: string): Promise<void> => {
    setLoadingCities(true);
    setError('');
    setSelectedCity('');
    
    try {
      console.log('🔄 Calling getCities API for province:', provinceId);
      
      const response = await photographerService.getCities(provinceId);
      
      console.log('📦 Cities API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Cities loaded successfully:', {
          count: response.data.length,
          firstCity: response.data[0]
        });
        
        setCities(response.data);
      } else {
        console.error('❌ API returned success=false or no data');
        setError('Data kota/kabupaten tidak tersedia');
      }
    } catch (err: any) {
      console.error('❌ Load cities error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data
      });
      
      setError('Gagal memuat data kota/kabupaten');
      toast({
        title: "Error",
        description: "Gagal memuat data kota/kabupaten",
        variant: "destructive",
      });
    } finally {
      setLoadingCities(false);
      console.log('✋ Cities loading completed');
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedProvince || !selectedCity) {
      setError('Silakan pilih provinsi dan kota/kabupaten');
      toast({
        title: "Error",
        description: "Silakan pilih provinsi dan kota/kabupaten",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('💾 Saving location:', {
        province_id: selectedProvince,
        city_id: selectedCity
      });
      
      const response = await photographerService.updateLocation({
        province_id: selectedProvince,
        city_id: selectedCity
      });

      if (response.success && response.data) {
        console.log('✅ Location updated successfully:', response.data);
        
        toast({
          title: "Berhasil",
          description: "Lokasi berhasil disimpan",
        });
        
        if (onComplete) {
          onComplete(response.data);
        }
        
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.error || 'Failed to update location');
      }
    } catch (err: any) {
      console.error('❌ Update location error:', err);
      
      const errorMessage = err.response?.data?.error || err.message || 'Gagal menyimpan lokasi';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = (): void => {
    const confirmed = window.confirm(
      'Anda dapat melengkapi data lokasi nanti di halaman profil. Lanjutkan?'
    );
    
    if (confirmed && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={undefined}>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <DialogTitle>Lengkapi Lokasi Anda</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Lewati</span>
            </Button>
          </div>
          <DialogDescription>
            Agar fotografer lain dan klien dapat menemukan Anda dengan mudah, 
            silakan lengkapi informasi lokasi Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Data lokasi membantu meningkatkan visibilitas profil Anda dan 
              memudahkan klien menemukan fotografer terdekat.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Province Selector */}
          <div className="space-y-2">
            <Label htmlFor="province">Provinsi *</Label>
            <Select
              value={selectedProvince}
              onValueChange={(value) => {
                console.log('👆 Province selected:', value);
                setSelectedProvince(value);
              }}
              disabled={loadingProvinces || loading}
            >
              <SelectTrigger id="province">
                <SelectValue placeholder="Pilih Provinsi" />
              </SelectTrigger>
              <SelectContent>
                {loadingProvinces ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Memuat provinsi...
                    </span>
                  </div>
                ) : provinces.length === 0 ? (
                  <div className="flex items-center justify-center p-2">
                    <span className="text-sm text-muted-foreground">
                      Tidak ada data provinsi
                    </span>
                  </div>
                ) : (
                  provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* City Selector */}
          <div className="space-y-2">
            <Label htmlFor="city">Kota/Kabupaten *</Label>
            <Select
              value={selectedCity}
              onValueChange={(value) => {
                console.log('👆 City selected:', value);
                setSelectedCity(value);
              }}
              disabled={!selectedProvince || loadingCities || loading}
            >
              <SelectTrigger id="city">
                <SelectValue 
                  placeholder={
                    !selectedProvince 
                      ? "Pilih provinsi terlebih dahulu" 
                      : loadingCities
                      ? "Memuat kota..."
                      : "Pilih Kota/Kabupaten"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {loadingCities ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Memuat kota/kabupaten...
                    </span>
                  </div>
                ) : cities.length === 0 && selectedProvince ? (
                  <div className="flex items-center justify-center p-2">
                    <span className="text-sm text-muted-foreground">
                      Tidak ada data kota
                    </span>
                  </div>
                ) : (
                  cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={loading}
              className="flex-1"
            >
              Lewati
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedProvince || !selectedCity || loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Menyimpan...' : 'Simpan Lokasi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationCompletionModal;