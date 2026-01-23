import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Camera, Scan, Image, Calendar, Wallet, CreditCard, 
  ArrowRight, ShoppingCart, Download, TrendingUp, Award, 
  Sparkles, Eye, Star, MapPin, Clock, ChevronRight, Grid3x3,
  Zap, Heart, Map as MapIcon
} from "lucide-react";
import { userService, UserPhoto } from "@/services/api/user.service";
import { paymentService, UserWallet } from "@/services/api/payment.service";
import { aiService } from "@/services/api/ai.service";
import HeaderDash from "@/components/layout/HeaderDash";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const UserDashboard = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [purchasedCount, setPurchasedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'recent' | 'events'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadPhotos(), loadWallet()]);
    setIsLoading(false);
  };

  const loadWallet = async () => {
    try {
      const response = await paymentService.getUserWallet();
      if (response.success && response.data) {
        setWallet(response.data.wallet);
        setPurchasedCount(response.data.purchased_photos_count || 0);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const loadPhotos = async () => {
    try {
      const response = await userService.getMyPhotos();
      if (response.success && response.data) {
        setPhotos(response.data);
      }
    } catch (err) {
      console.error('Error loading photos:', err);
      setPhotos([]);
    }
  };

  // Group photos by event with enhanced stats
  const eventStats = useMemo(() => {
    const events: Map<string, { 
      name: string; 
      photos: UserPhoto[];
      location: string;
      date: string;
      purchased: number;
      totalValue: number;
    }> = new Map();
    
    photos.forEach(photo => {
      const eventName = photo.event_name || 'Event Tidak Diketahui';
      const existing = events.get(eventName);
      
      if (existing) {
        existing.photos.push(photo);
        if (photo.is_purchased) existing.purchased += 1;
        existing.totalValue += photo.price_cash || 0;
      } else {
        events.set(eventName, {
          name: eventName,
          photos: [photo],
          location: photo.event_location || 'Lokasi Tidak Diketahui',
          date: photo.event_date || '',
          purchased: photo.is_purchased ? 1 : 0,
          totalValue: photo.price_cash || 0
        });
      }
    });
    
    return Array.from(events.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [photos]);

  // Get top 3 events
  const topEvents = useMemo(() => eventStats.slice(0, 3), [eventStats]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPhotos = photos.length;
    const purchased = photos.filter(p => p.is_purchased).length;
    const totalValue = photos.reduce((sum, p) => sum + (p.price_cash || 0), 0);
    const avgMatch = photos.length > 0 
      ? Math.round(photos.reduce((sum, p) => sum + (p.similarity || 0), 0) / photos.length * 100)
      : 0;
    
    return {
      totalPhotos,
      purchased,
      notPurchased: totalPhotos - purchased,
      totalValue,
      savedValue: purchased > 0 ? purchased * 30000 : 0,
      avgMatch,
      events: eventStats.length
    };
  }, [photos, eventStats]);

  // Get recent photos (last 8)
  const recentPhotos = useMemo(() => {
    return photos
      .sort((a, b) => new Date(b.event_date || 0).getTime() - new Date(a.event_date || 0).getTime())
      .slice(0, 8);
  }, [photos]);

  // Get favorite/most viewed photos (simulate based on similarity)
  const favoritePhotos = useMemo(() => {
    return [...photos]
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 6);
  }, [photos]);

  // Quick actions - UPDATED with FotoMap
  const quickActions = [
    {
      icon: Camera,
      label: "Hi Res Foto",
      description: "Unduh versi Hi-Res",
      href: "/user/Hires",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
    },
    {
      icon: MapIcon,
      label: "FotoMap",
      description: "Jelajahi event di peta",
      href: "/user/fotomap",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200"
    },
    {
      icon: Grid3x3,
      label: "Lihat Galeri",
      description: `${stats.totalPhotos} foto`,
      href: "/user/photos",
      color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
    },
    {
      icon: Wallet,
      label: "Dompet Saya",
      description: `${Number(wallet?.point_balance || 0).toLocaleString('id-ID')} FotoPoin`,
      href: "/user/wallet",
      color: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeaderDash />
      
      <main className="flex-1 py-8">
        <div className="container max-w-7xl">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                  Selamat Datang {user?.full_name || 'Pengguna'}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  {photos.length > 0 
                    ? `Anda memiliki ${stats.totalPhotos} foto dari ${stats.events} event`
                    : 'Mulai dengan pindai wajah untuk menemukan foto Anda'
                  }
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Star className="h-4 w-4" />
                  Beri Masukan
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            {stats.totalPhotos > 0 && (
              <Card className="border-2 border-blue-100 shadow-sm bg-gradient-to-r from-blue-50 to-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-gray-800">Progress Koleksi</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {stats.purchased}/{stats.totalPhotos} dibeli
                    </span>
                  </div>
                  <Progress value={(stats.purchased / stats.totalPhotos) * 100} className="h-2 bg-gray-200" />
                  <p className="text-xs text-gray-600 mt-2">
                    {stats.notPurchased > 0 && `${stats.notPurchased} foto menunggu untuk dibeli`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="mb-8">
              {/* FotoMap CTA - NEW SECTION */}
              <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-500 to-yellow-500 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <CardContent className="pt-8 pb-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <MapIcon className="h-10 w-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold mb-2">Jelajahi Event di Sekitar Anda</h2>
                      <p className="text-white/90">
                        Temukan event-event menarik di peta interaktif dan lihat foto-foto dari berbagai lokasi
                      </p>
                    </div>
                    <Link to="/user/fotomap">
                      <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                        <MapPin className="mr-2 h-5 w-5" />
                        Buka FotoMap
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
          </div>
        

          {/* Quick Actions - Now with FotoMap */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className={`border-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${action.color}`}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-1 text-gray-800">{action.label}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Main Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-2 border-gray-100 shadow-sm">
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-blue-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Image className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-3xl font-bold text-gray-800">{stats.totalPhotos}</p>
                        <p className="text-sm text-gray-600">Total Foto</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>{stats.avgMatch}% rata-rata kecocokan</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-yellow-100 shadow-sm hover:shadow-md transition-shadow bg-yellow-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-yellow-100">
                        <Calendar className="h-5 w-5 text-yellow-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-3xl font-bold text-gray-800">{stats.events}</p>
                        <p className="text-sm text-gray-600">Event</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {topEvents.length > 0 && `Terbaru: ${topEvents[0].name}`}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-blue-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Download className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-3xl font-bold text-gray-800">{stats.purchased}</p>
                        <p className="text-sm text-gray-600">Dibeli</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {stats.notPurchased} menunggu
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-green-600">
                          {Number(wallet?.point_balance || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm font-bold text-gray-600">FotoPoin</p>
                      </div>
                    </div>
                    <Link to="/user/topup">
                      <Button size="sm" variant="ghost" className="w-full text-xs gap-1 hover:bg-green-100 text-green-700">
                        <Zap className="h-3 w-3" />
                        Isi Ulang
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
            {[
              { id: 'overview', label: 'Ringkasan', icon: Sparkles },
              { id: 'recent', label: 'Foto Terbaru', icon: Clock },
              { id: 'events', label: 'Event', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              

              {/* Face Scan CTA */}
              <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-500 to-yellow-500 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardContent className="pt-8 pb-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Scan className="h-10 w-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold mb-2">Temukan Lebih Banyak Foto Anda</h2>
                      <p className="text-white/90">
                        Gunakan teknologi pengenalan wajah AI untuk menemukan semua foto Anda dari berbagai event
                      </p>
                    </div>
                    <Link to="/user/scan-face">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                        <Camera className="mr-2 h-5 w-5" />
                        Pindai Wajah
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Favorite/Best Match Photos */}
              {favoritePhotos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <h2 className="text-2xl font-semibold text-gray-800">Kecocokan Terbaik</h2>
                    </div>
                    <Link to="/user/photos">
                      <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:bg-blue-50">
                        Lihat Semua
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {favoritePhotos.map((photo) => (
                      <Link key={photo.photo_id} to="/user/photos">
                        <Card className="overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                          <div className="aspect-square bg-gray-100 relative">
                            <img
                              src={photo.preview_url || aiService.getPreviewUrl(photo.photo_id)}
                              alt={photo.filename}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {Math.round((photo.similarity || 0) * 100)}%
                            </div>
                            {photo.is_purchased && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                Dimiliki
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Foto Terbaru ({recentPhotos.length})</h2>
                {photos.length > 8 && (
                  <Link to="/user/photos">
                    <Button variant="outline" className="gap-1 border-blue-200 text-blue-600 hover:bg-blue-50">
                      Lihat Semua {stats.totalPhotos} Foto
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden border-2 border-gray-200">
                      <Skeleton className="aspect-square w-full" />
                    </Card>
                  ))}
                </div>
              ) : recentPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recentPhotos.map((photo) => (
                    <Link key={photo.photo_id} to="/user/photos">
                      <Card className="overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                        <div className="aspect-square bg-gray-100 relative">
                          <img
                            src={photo.preview_url || aiService.getPreviewUrl(photo.photo_id)}
                            alt={photo.filename}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {photo.is_purchased ? (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              Dimiliki
                            </div>
                          ) : (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Rp {(photo.price_cash || 30000).toLocaleString('id-ID')}
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
                            <p className="text-xs text-white font-semibold truncate">
                              {photo.event_name || 'Event Tidak Diketahui'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-white/80" />
                              <p className="text-xs text-white/80">
                                {photo.event_date 
                                  ? new Date(photo.event_date).toLocaleDateString('id-ID', { 
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'Tanggal tidak tersedia'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-gray-200 shadow-sm p-12 text-center bg-gray-50">
                  <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Belum Ada Foto</h3>
                  <p className="text-gray-600 mb-6">
                    Mulai dengan pindai wajah untuk menemukan foto Anda
                  </p>
                  <Link to="/user/scan-face">
                    <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Camera className="h-5 w-5" />
                      Pindai Wajah Sekarang
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Event Anda ({eventStats.length})</h2>
              </div>
              
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="border-2 border-gray-200 shadow-sm">
                      <CardContent className="pt-6">
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : eventStats.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eventStats.map((event, index) => (
                    <Link key={index} to="/user/photos">
                      <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-blue-100 to-yellow-100 relative overflow-hidden">
                          {event.photos[0] && (
                            <img
                              src={event.photos[0].preview_url || aiService.getPreviewUrl(event.photos[0].photo_id)}
                              alt={event.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-bold text-white text-lg truncate mb-1">
                              {event.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/90 text-xs">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="pt-4 bg-white">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">
                                {event.photos.length}
                              </p>
                              <p className="text-xs text-gray-600">Total Foto</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {event.purchased}
                              </p>
                              <p className="text-xs text-gray-600">Dibeli</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {event.date 
                                  ? new Date(event.date).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'Tanggal tidak tersedia'
                                }
                              </div>
                              <span className="text-blue-600 font-medium flex items-center gap-1">
                                Lihat Foto
                                <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-gray-200 shadow-sm p-12 text-center bg-gray-50">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Belum Ada Event</h3>
                  <p className="text-gray-600">
                    Event akan muncul setelah Anda menemukan foto
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;