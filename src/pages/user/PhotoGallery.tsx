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
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  Camera, 
  Eye, 
  Heart, 
  ShoppingBag,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/api/ai.service";
import { userService, UserPhoto } from "@/services/api/user.service";
import { paymentService } from "@/services/api/payment.service";
import { PhotoCard } from "@/components/PhotoCard";
import { PhotoListItem } from "@/components/PhotoListItem";
import { PhotoDetailModal } from "@/components/PhotoDetailModal";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { PhotoPurchaseModal } from "@/components/PhotoPurchaseModal";
import { toast as sonnerToast } from "sonner";

type TabType = 'temuan' | 'favorite' | 'koleksi';

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [favoritePhotos, setFavoritePhotos] = useState<UserPhoto[]>([]);
  const [purchasedPhotos, setPurchasedPhotos] = useState<UserPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [isLoadingPurchased, setIsLoadingPurchased] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>('temuan');
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
    loadData();
  }, []);

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'favorite' && favoritePhotos.length === 0) {
      loadFavoritePhotos();
    } else if (activeTab === 'koleksi' && purchasedPhotos.length === 0) {
      loadPurchasedPhotos();
    }
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    await loadPhotos();
    setIsLoading(false);
  };

  const loadPhotos = async () => {
    try {
      const response = await userService.getMyPhotos();
      
      if (response.success && response.data) {
        console.log('✅ Loaded photos:', response.data.length, 'photos');
        console.log('Sample photo:', response.data[0]); // Debug first photo
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
    }
  };

  const loadFavoritePhotos = async () => {
    try {
      setIsLoadingFavorites(true);
      const response = await userService.getFavoritePhotos();
      
      if (response.success && response.data) {
        console.log('❤️ Loaded favorite photos:', response.data.length, 'photos');
        console.log('Sample favorite:', response.data[0]); // Debug first photo
        setFavoritePhotos(response.data);
      } else {
        setFavoritePhotos([]);
      }
    } catch (err) {
      console.error('Error loading favorite photos:', err);
      setFavoritePhotos([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const loadPurchasedPhotos = async () => {
    try {
      setIsLoadingPurchased(true);
      const response = await userService.getPurchasedPhotos();
      
      if (response.success && response.data) {
        console.log('🛍️ Loaded purchased photos:', response.data.length, 'photos');
        console.log('Sample purchased:', response.data[0]); // Debug first photo
        setPurchasedPhotos(response.data);
      } else {
        setPurchasedPhotos([]);
      }
    } catch (err) {
      console.error('Error loading purchased photos:', err);
      setPurchasedPhotos([]);
    } finally {
      setIsLoadingPurchased(false);
    }
  };

  // ❌ COMMENTED OUT: loadUserBalance is not needed anymore (no FOTOPOIN feature)
  // const loadUserBalance = async () => {
  //   try {
  //     const response = await userService.getBalance();
  //     if (response.success && response.data) {
  //       setUserPointBalance(response.data.balance);
  //     }
  //   } catch (err) {
  //     console.error('Error loading balance:', err);
  //     try {
  //       const walletRes = await paymentService.getUserWallet();
  //       if (walletRes.success && walletRes.data) {
  //         setUserPointBalance(walletRes.data.wallet.point_balance);
  //       }
  //     } catch (walletErr) {
  //       console.error('Error loading wallet:', walletErr);
  //     }
  //   }
  // };

  // Get current photos based on active tab
  const currentPhotos = useMemo(() => {
    switch (activeTab) {
      case 'temuan':
        // Filter out purchased photos from temuan
        return photos.filter(p => !p.is_purchased);
      case 'favorite':
        return favoritePhotos;
      case 'koleksi':
        return purchasedPhotos;
      default:
        return photos;
    }
  }, [activeTab, photos, favoritePhotos, purchasedPhotos]);

  // Extract unique events from current photos
  const events = useMemo(() => {
    const uniqueEvents = new Set<string>();
    currentPhotos.forEach(photo => {
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
  }, [currentPhotos]);

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    let result = [...currentPhotos];

    // Filter by event
    if (selectedEvent !== 'all') {
      result = result.filter(photo => 
        photo.event_name?.toLowerCase().replace(/\s+/g, '-') === selectedEvent
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(photo => 
        photo.event_name?.toLowerCase().includes(query) ||
        photo.event_location?.toLowerCase().includes(query) ||
        photo.filename?.toLowerCase().includes(query) ||
        photo.photographer_name?.toLowerCase().includes(query)
      );
    }

    // Sort photos
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
  }, [currentPhotos, selectedEvent, searchQuery, sortBy]);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedEvent('all');
    setSearchQuery('');
  };

  // Toggle favorite
  const handleToggleFavorite = async (photo: UserPhoto) => {
    try {
      // Get the correct photo ID - prioritize event_photo_id, fallback to photo_id
      const photoId = photo.event_photo_id || photo.photo_id;
      
      if (!photoId) {
        console.error('No valid photo ID found:', photo);
        sonnerToast.error("ID foto tidak valid");
        return;
      }

      console.log('Toggle favorite for photo:', photoId, photo);
      
      if (photo.is_favorited) {
        // Remove from favorites
        await userService.removeFromFavorites(photoId);
        
        // Update local state
        setPhotos(prev => prev.map(p => 
          (p.event_photo_id === photoId || p.photo_id === photoId)
            ? { ...p, is_favorited: false }
            : p
        ));
        setFavoritePhotos(prev => prev.filter(p => 
          p.event_photo_id !== photoId && p.photo_id !== photoId
        ));
        
        sonnerToast.success("Foto dihapus dari favorit");
      } else {
        // Add to favorites
        await userService.addToFavorites(photoId);
        
        // Update local state
        setPhotos(prev => prev.map(p => 
          (p.event_photo_id === photoId || p.photo_id === photoId)
            ? { ...p, is_favorited: true }
            : p
        ));
        
        sonnerToast.success("Foto ditambahkan ke favorit");
        
        // Reload favorites if on favorite tab
        if (activeTab === 'favorite') {
          loadFavoritePhotos();
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      sonnerToast.error("Gagal mengubah status favorit");
    }
  };

  // Download photo
  const handleDownloadPhoto = async (photoId: string) => {
    try {
      const photo = [...photos, ...favoritePhotos, ...purchasedPhotos].find(
        p => p.event_photo_id === photoId || p.photo_id === photoId
      );
      
      if (!photo) {
        toast({
          title: "Error",
          description: "Foto tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      const cta = photo.cta || (photo.is_purchased ? 'DOWNLOAD' : (photo.is_for_sale === false ? 'FREE_DOWNLOAD' : 'BUY'));
      
      if (cta === 'BUY') {
        toast({
          title: "Foto belum dibeli",
          description: "Silakan beli foto terlebih dahulu untuk mengunduh.",
          variant: "destructive",
        });
        handleBuyPhoto(photo);
        return;
      }

      setDownloadingIds(prev => new Set(prev).add(photoId));
      
      const filename = photo.filename || `foto-${photoId}.jpg`;
      
      try {
        const blob = await userService.downloadPhotoBlob(photo.event_photo_id);
        
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
        if (downloadErr.response?.status === 403) {
          toast({
            title: "Foto belum dibeli",
            description: downloadErr.response?.data?.error || "Silakan beli foto terlebih dahulu.",
            variant: "destructive",
          });
          handleBuyPhoto(photo);
          return;
        }
        
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
    
    for (const photo of filteredPhotos) {
      await handleDownloadPhoto(photo.photo_id);
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
    if (photoToPurchase) {
      // Update photos
      setPhotos(prev => prev.map(p => 
        p.event_photo_id === photoToPurchase.event_photo_id 
          ? { ...p, is_purchased: true, cta: 'DOWNLOAD' as const, download_url: downloadUrl }
          : p
      ));
      
      // Update favorites if favorited
      setFavoritePhotos(prev => prev.map(p => 
        p.event_photo_id === photoToPurchase.event_photo_id 
          ? { ...p, is_purchased: true, cta: 'DOWNLOAD' as const, download_url: downloadUrl }
          : p
      ));
      
      // Reload purchased photos
      loadPurchasedPhotos();
    }
    setIsPurchaseModalOpen(false);
    setPhotoToPurchase(null);
    
    // ❌ NO LONGER NEEDED: loadUserBalance() removed
    
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

  // Tab configuration
  const tabs = [
    {
      id: 'temuan' as TabType,
      label: 'Temuan',
      icon: Eye,
      count: photos.filter(p => !p.is_purchased).length,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500',
      description: 'Foto yang cocok dengan wajah Anda'
    },
    {
      id: 'favorite' as TabType,
      label: 'Favorit',
      icon: Heart,
      count: favoritePhotos.length,
      color: 'from-pink-500 to-red-500',
      bgColor: 'bg-pink-500',
      description: 'Foto yang Anda sukai'
    },
    {
      id: 'koleksi' as TabType,
      label: 'Koleksi',
      icon: ShoppingBag,
      count: purchasedPhotos.length,
      color: 'from-lime-400 to-green-500',
      bgColor: 'bg-lime-400',
      description: 'Foto yang sudah Anda beli'
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
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

  // Empty state for no photos at all
  if (!isLoading && photos.length === 0 && favoritePhotos.length === 0 && purchasedPhotos.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl">
            <Link 
              to="/user/dashboard" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
            
            <Card className="border-2 border-blue-200 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
                  Mulai Petualangan Foto Anda
                </h2>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                  {error || "Temukan foto-foto Anda dengan teknologi pengenalan wajah AI. Pindai wajah Anda untuk memulai!"}
                </p>
                <Button 
                  onClick={() => navigate('/user/scan-face')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 hover:from-blue-700 hover:to-yellow-700 shadow-lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Pindai Wajah Sekarang
                </Button>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentTabLoading = 
    (activeTab === 'favorite' && isLoadingFavorites) ||
    (activeTab === 'koleksi' && isLoadingPurchased);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="container max-w-7xl">
          {/* Header - More Compact & Modern */}
          <div className="mb-6">
            <Link 
              to="/user/dashboard" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 transition-all group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-1 bg-blue-900 bg-clip-text text-transparent">
                  Ambil Foto {activeTab === 'temuan' ? 'Temuan' : activeTab === 'favorite' ? 'Favorit' : 'Koleksi'}
                </h1>
                <p className="text-muted-foreground">
                  {filteredPhotos.length === 0
                    ? "Tidak ada foto di tab ini"
                    : `${filteredPhotos.length} foto ditemukan`
                  }
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Link to="/user/scan-face">
                  <Button variant="outline" size="sm" className="border-2 hover:border-blue-400 hover:bg-blue-50 rounded-xl">
                    <Camera className="mr-2 h-4 w-4" />
                    Pindai Lagi
                  </Button>
                </Link>
                {filteredPhotos.length > 0 && activeTab === 'koleksi' && (
                  <Button 
                    onClick={handleDownloadAll}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 rounded-xl shadow-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Semua ({filteredPhotos.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs - Compact Pill Style */}
          <div className="mb-5">
            <div className="inline-flex gap-1.5 p-1.5 bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative group transition-all duration-200 ${
                      isActive ? '' : 'hover:scale-[1.02]'
                    }`}
                  >
                    <div className={`relative px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-br ${tab.color} shadow-md` 
                        : 'bg-transparent hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg ${
                          isActive 
                            ? 'bg-white/20' 
                            : 'bg-gray-100'
                        } transition-all`}>
                          <Icon className={`h-3.5 w-3.5 ${
                            isActive ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <span className={`text-sm font-bold whitespace-nowrap ${
                          isActive ? 'text-white' : 'text-gray-700'
                        }`}>
                          {tab.label}
                        </span>
                        
                        <div className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center ${
                          isActive 
                            ? 'bg-white/30 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {tab.count}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter & Controls - More Modern */}
          {filteredPhotos.length > 0 && (
            <Card className="mb-5 border-2 border-gray-100 shadow-md bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="p-3">
                <div className="flex flex-col md:flex-row gap-2">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari foto..." 
                      className="pl-9 border-2 focus:border-blue-400 rounded-xl bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Event Filter */}
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-full md:w-[180px] border-2 rounded-xl bg-white">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Acara" />
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
                    <SelectTrigger className="w-full md:w-[160px] border-2 rounded-xl bg-white">
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="oldest">Terlama</SelectItem>
                      {activeTab === 'temuan' && <SelectItem value="match">Terbaik</SelectItem>}
                      <SelectItem value="event">Acara</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* View Mode Toggle */}
                  <div className="flex gap-1 border-2 border-gray-200 rounded-xl p-1 bg-white">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Photo Grid/List */}
          {currentTabLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-2 rounded-2xl">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPhotos.length === 0 ? (
            <Card className="border-2 border-gray-200 shadow-xl p-12 text-center bg-white/80 backdrop-blur-sm rounded-2xl">
              {activeTab === 'temuan' && (
                <>
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-yellow-400 rounded-full animate-pulse" />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
                    Semua Foto Sudah Dibeli!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Luar biasa! Coba pindai wajah lagi untuk menemukan foto baru.
                  </p>
                </>
              )}
              {activeTab === 'favorite' && (
                <>
                  <Heart className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-black mb-2">Belum Ada Foto Favorit</h3>
                  <p className="text-muted-foreground mb-6">
                    Tandai foto favorit dengan tekan tombol hati ❤️
                  </p>
                </>
              )}
              {activeTab === 'koleksi' && (
                <>
                  <ShoppingBag className="h-16 w-16 text-lime-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-black mb-2">Koleksi Masih Kosong</h3>
                  <p className="text-muted-foreground mb-6">
                    Mulai beli foto favorit untuk membangun koleksi! 🛍️
                  </p>
                </>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedEvent('all');
                  setSearchQuery('');
                  if (activeTab !== 'temuan') {
                    handleTabChange('temuan');
                  }
                }}
                className="border-2 rounded-xl"
              >
                {activeTab === 'temuan' ? 'Hapus Filter' : 'Lihat Temuan'}
              </Button>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.photo_id}
                  photo={photo}
                  onDownload={handleDownloadPhoto}
                  onBuy={() => handleBuyPhoto(photo)}
                  onToggleFavorite={() => handleToggleFavorite(photo)}
                  isDownloading={downloadingIds.has(photo.photo_id)}
                  onClick={() => handlePhotoClick(photo)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPhotos.map((photo) => (
                <PhotoListItem
                  key={photo.photo_id}
                  photo={photo}
                  onDownload={handleDownloadPhoto}
                  onBuy={() => handleBuyPhoto(photo)}
                  onToggleFavorite={() => handleToggleFavorite(photo)}
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
        photo={selectedPhoto as any}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onDownload={() => selectedPhoto && handleDownloadPhoto(selectedPhoto.event_photo_id)}
        onBuy={() => selectedPhoto && handleBuyPhoto(selectedPhoto)}
        onToggleFavorite={() => selectedPhoto && handleToggleFavorite(selectedPhoto)}
        onView={handleViewFullscreen}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isDownloading={selectedPhoto ? downloadingIds.has(selectedPhoto.event_photo_id) : false}
        hasNext={selectedPhotoIndex < filteredPhotos.length - 1}
        hasPrevious={selectedPhotoIndex > 0}
      />

      {/* Photo Lightbox */}
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

      {/* Purchase Modal */}
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