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
import { userService, UserPhoto } from "@/services/api/user.service";
import { paymentService } from "@/services/api/payment.service";
import { PhotoCard } from "@/components/PhotoCard";
import { PhotoListItem } from "@/components/PhotoListItem";
import { PhotoDetailModal } from "@/components/PhotoDetailModal";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { PhotoPurchaseModal } from "@/components/PhotoPurchaseModal";
import { toast as sonnerToast } from "sonner";

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [photoToPurchase, setPhotoToPurchase] = useState<UserPhoto | null>(null);
  const [userPointBalance, setUserPointBalance] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPhotos();
    loadUserBalance();
  }, []);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      
      // Ambil dari API - /user/my-photos
      const response = await userService.getMyPhotos();
      
      if (response.success && response.data) {
        setPhotos(response.data);
        setError("");
      } else {
        setPhotos([]);
        setError("Foto tidak ditemukan. Coba pindai wajah Anda terlebih dahulu.");
      }
    } catch (err) {
      console.error('Error loading photos:', err);
      setError("Gagal memuat foto");
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      // Gunakan endpoint balance yang baru
      const response = await userService.getBalance();
      if (response.success && response.data) {
        setUserPointBalance(response.data.balance);
      }
    } catch (err) {
      console.error('Error loading balance:', err);
      // Fallback ke endpoint wallet
      try {
        const walletRes = await paymentService.getUserWallet();
        if (walletRes.success && walletRes.data) {
          setUserPointBalance(walletRes.data.wallet.point_balance);
        }
      } catch (walletErr) {
        console.error('Error loading wallet:', walletErr);
      }
    }
  };

  // Ekstrak event unik dari foto
  const events = useMemo(() => {
    const uniqueEvents = new Set<string>();
    photos.forEach(photo => {
      if (photo.event_name) {
        uniqueEvents.add(photo.event_name);
      }
    });
    
    return [
      { value: 'all', label: 'Semua Acara' },
      ...Array.from(uniqueEvents).map(event => ({
        value: event.toLowerCase().replace(/\s+/g, '-'),
        label: event
      }))
    ];
  }, [photos]);

  // Filter dan urutkan foto
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    // Filter berdasarkan acara
    if (selectedEvent !== 'all') {
      result = result.filter(photo => 
        photo.event_name?.toLowerCase().replace(/\s+/g, '-') === selectedEvent
      );
    }

    // Filter berdasarkan pencarian
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(photo => 
        photo.event_name?.toLowerCase().includes(query) ||
        photo.event_location?.toLowerCase().includes(query) ||
        photo.filename?.toLowerCase().includes(query) ||
        photo.photographer_name?.toLowerCase().includes(query)
      );
    }

    // Urutkan foto
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => 
          new Date(b.event_date || 0).getTime() - new Date(a.event_date || 0).getTime()
        );
        break;
      case 'oldest':
        result.sort((a, b) => 
          new Date(a.event_date || 0).getTime() - new Date(b.event_date || 0).getTime()
        );
        break;
      case 'match':
        result.sort((a, b) => 
          (b.similarity || 0) - (a.similarity || 0)
        );
        break;
      case 'event':
        result.sort((a, b) => 
          (a.event_name || '').localeCompare(b.event_name || '')
        );
        break;
    }

    return result;
  }, [photos, selectedEvent, searchQuery, sortBy]);

  // Download foto - menggunakan logika CTA dari backend
  const handleDownloadPhoto = async (photoId: string) => {
    try {
      const photo = photos.find(p => p.event_photo_id === photoId || p.photo_id === photoId);
      
      if (!photo) {
        toast({
          title: "Error",
          description: "Foto tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      // Cek status CTA
      const cta = photo.cta || (photo.is_purchased ? 'DOWNLOAD' : (photo.is_for_sale === false ? 'FREE_DOWNLOAD' : 'BUY'));
      
      if (cta === 'BUY') {
        // Foto perlu dibeli terlebih dahulu
        toast({
          title: "Foto belum dibeli",
          description: "Silakan beli foto terlebih dahulu untuk mengunduh.",
          variant: "destructive",
        });
        handleBuyPhoto(photo);
        return;
      }

      setDownloadingIds(prev => new Set(prev).add(photoId));
      
      // Gunakan download_url dari API jika tersedia, jika tidak konstruksi sendiri
      const filename = photo.filename || `foto-${photoId}.jpg`;
      
      try {
        // Coba gunakan endpoint download API
        const blob = await userService.downloadPhotoBlob(photo.event_photo_id);
        
        // Buat link download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download berhasil! 🎉",
          description: `${filename} telah diunduh`,
        });
      } catch (downloadErr: any) {
        // Cek jika error 403 (belum dibeli)
        if (downloadErr.response?.status === 403) {
          toast({
            title: "Foto belum dibeli",
            description: downloadErr.response?.data?.error || "Silakan beli foto terlebih dahulu.",
            variant: "destructive",
          });
          handleBuyPhoto(photo);
          return;
        }
        
        // Fallback ke download URL preview
        const downloadUrl = photo.download_url || photo.preview_url || aiService.getDownloadUrl(photo.photo_id);
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error('Download gagal');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download berhasil! 🎉",
          description: `${filename} telah diunduh`,
        });
      }
    } catch (err) {
      console.error('Download error:', err);
      toast({
        title: "Download gagal",
        description: "Gagal mengunduh foto. Silakan coba lagi.",
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

  const handleDownloadAll = async () => {
    toast({
      title: "Mempersiapkan unduhan",
      description: `Mengunduh ${filteredPhotos.length} foto...`,
    });
    
    // Download setiap foto secara berurutan
    for (const photo of filteredPhotos) {
      await handleDownloadPhoto(photo.photo_id);
      // Jeda kecil antar unduhan
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const handlePhotoClick = (photo: UserPhoto) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const handleViewFullscreen = () => {
    setIsModalOpen(false);
    setIsLightboxOpen(true);
  };

  const handleLightboxClose = () => {
    setIsLightboxOpen(false);
  };

  const handleBuyPhoto = (photo: UserPhoto) => {
    setPhotoToPurchase(photo);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = (downloadUrl?: string) => {
    // Tandai foto sebagai dibeli secara lokal dan perbarui CTA
    if (photoToPurchase) {
      setPhotos(prev => prev.map(p => 
        p.event_photo_id === photoToPurchase.event_photo_id 
          ? { ...p, is_purchased: true, cta: 'DOWNLOAD' as const, download_url: downloadUrl }
          : p
      ));
    }
    setIsPurchaseModalOpen(false);
    setPhotoToPurchase(null);
    
    // Perbarui saldo pengguna
    loadUserBalance();
    
    sonnerToast.success("Foto berhasil dibeli! Anda sekarang bisa mengunduh foto ini.");
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
    ? filteredPhotos.findIndex(p => p.event_photo_id === selectedPhoto.event_photo_id)
    : -1;

  // Status loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
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

  // Status kosong
  if (!isLoading && photos.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl">
            <Link 
              to="/user/dashboard" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
            
            <Card className="border-border/50 shadow-soft">
              <div className="p-12 text-center">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Foto Tidak Ditemukan</h2>
                <p className="text-muted-foreground mb-6">
                  {error || "Kami tidak menemukan foto yang cocok dengan wajah Anda. Coba pindai wajah Anda untuk menemukan foto Anda."}
                </p>
                <Button onClick={() => navigate('/user/scan-face')}>
                  <Camera className="mr-2 h-4 w-4" />
                  Pindai Wajah Anda
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
              Kembali ke Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Foto Anda ({filteredPhotos.length})</h1>
                <p className="text-muted-foreground">
                  {filteredPhotos.length === photos.length 
                    ? "Semua foto ditemukan dari pengenalan wajah"
                    : `Menampilkan ${filteredPhotos.length} dari ${photos.length} foto`
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link to="/user/scan-face">
                  <Button variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Pindai Lagi
                  </Button>
                </Link>
                {filteredPhotos.length > 0 && (
                  <Button onClick={handleDownloadAll}>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Semua ({filteredPhotos.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filter & Kontrol */}
          <Card className="mb-6 border-border/50 shadow-soft">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Pencarian */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cari berdasarkan acara, tanggal, atau lokasi..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Filter Acara */}
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter berdasarkan acara" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Urutkan */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Urutkan berdasarkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="match">Kecocokan Terbaik</SelectItem>
                    <SelectItem value="event">Berdasarkan Acara</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Toggle Mode Tampilan */}
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

          {/* Grid/List Foto */}
          {filteredPhotos.length === 0 ? (
            <Card className="border-border/50 shadow-soft p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada foto yang cocok dengan filter Anda</h3>
              <p className="text-muted-foreground mb-4">
                Coba sesuaikan pencarian atau kriteria filter Anda
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedEvent('all');
                  setSearchQuery('');
                }}
              >
                Hapus Filter
              </Button>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.photo_id}
                  photo={photo}
                  onDownload={handleDownloadPhoto}
                  onBuy={() => handleBuyPhoto(photo)}
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
                  onBuy={() => handleBuyPhoto(photo)}
                  isDownloading={downloadingIds.has(photo.photo_id)}
                  onClick={() => handlePhotoClick(photo)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Modal Detail Foto */}
      <PhotoDetailModal
        photo={selectedPhoto as any}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onDownload={() => selectedPhoto && handleDownloadPhoto(selectedPhoto.event_photo_id)}
        onBuy={() => selectedPhoto && handleBuyPhoto(selectedPhoto)}
        onView={handleViewFullscreen}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isDownloading={selectedPhoto ? downloadingIds.has(selectedPhoto.event_photo_id) : false}
        hasNext={selectedPhotoIndex < filteredPhotos.length - 1}
        hasPrevious={selectedPhotoIndex > 0}
      />

      {/* Lightbox Fullscreen */}
      <PhotoLightbox
        photo={selectedPhoto as any}
        isOpen={isLightboxOpen}
        onClose={handleLightboxClose}
        onDownload={() => selectedPhoto && handleDownloadPhoto(selectedPhoto.event_photo_id)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isDownloading={selectedPhoto ? downloadingIds.has(selectedPhoto.event_photo_id) : false}
        hasNext={selectedPhotoIndex < filteredPhotos.length - 1}
        hasPrevious={selectedPhotoIndex > 0}
      />

      {/* Modal Pembelian */}
      {photoToPurchase && (
        <PhotoPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setPhotoToPurchase(null);
          }}
          photo={{
            id: photoToPurchase.event_photo_id,
            filename: photoToPurchase.filename || 'Foto',
            event_name: photoToPurchase.event_name || 'Acara',
            price_cash: photoToPurchase.price_cash || photoToPurchase.price || 30000,
            price_points: photoToPurchase.price_points || photoToPurchase.price_in_points || 6,
          }}
          userPointBalance={userPointBalance}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default PhotoGallery;