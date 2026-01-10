import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Scan, Image as ImageIcon, Calendar, Wallet, CreditCard, ArrowRight, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Photo, aiService } from "@/services/api/ai.service";
import { paymentService, UserWallet } from "@/services/api/payment.service";
import HeaderDash from "@/components/layout/HeaderDash";

const UserDashboard = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [purchasedCount, setPurchasedCount] = useState(0);

  useEffect(() => {
    loadPhotos();
    loadWallet();
  }, []);

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

  const loadPhotos = () => {
    try {
      setIsLoading(true);
      const storedPhotos = localStorage.getItem('matched_photos');
      
      if (storedPhotos) {
        const parsedPhotos = JSON.parse(storedPhotos);
        setPhotos(parsedPhotos);
      } else {
        setPhotos([]);
      }
    } catch (err) {
      console.error('Error loading photos:', err);
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group photos by event
  const eventStats = useMemo(() => {
    const events = new Map<string, { name: string; photos: number; date: string }>();
    
    photos.forEach(photo => {
      const eventName = photo.metadata?.event_name || 'Unknown Event';
      const existing = events.get(eventName);
      
      if (existing) {
        existing.photos += 1;
      } else {
        events.set(eventName, {
          name: eventName,
          photos: 1,
          date: photo.metadata?.date 
            ? new Date(photo.metadata.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'No date'
        });
      }
    });
    
    return Array.from(events.values())
      .sort((a, b) => b.photos - a.photos)
      .slice(0, 3);
  }, [photos]);

  // Calculate average match rate
  const averageMatchRate = useMemo(() => {
    if (photos.length === 0) return 0;
    const totalMatch = photos.reduce((sum, photo) => {
      const matchPercentage = photo.distance 
        ? Math.max(0, Math.min(100, Math.round((1 - photo.distance) * 100)))
        : 0;
      return sum + matchPercentage;
    }, 0);
    return Math.round(totalMatch / photos.length);
  }, [photos]);

  // Get recent photos (last 4)
  const recentPhotos = useMemo(() => {
    return photos
      .sort((a, b) => new Date(b.metadata?.date || 0).getTime() - new Date(a.metadata?.date || 0).getTime())
      .slice(0, 4);
  }, [photos]);

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderDash />
      
      <main className="flex-1 py-8">
        <div className="container max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              {photos.length > 0 
                ? `You have ${photos.length} photos in your collection`
                : 'Start by scanning your face to find your photos'
              }
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-border/50 shadow-soft">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-8 w-16 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card className="border-border/50 shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{photos.length}</p>
                        <p className="text-sm text-muted-foreground">Your Photos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50 shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                        <Calendar className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{eventStats.length}</p>
                        <p className="text-sm text-muted-foreground">Events</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50 shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                        <Scan className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{averageMatchRate}%</p>
                        <p className="text-sm text-muted-foreground">Match Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Wallet Section */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                    <Wallet className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Point Balance</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Number(wallet?.point_balance || 0).toLocaleString('id-ID')} Points
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {purchasedCount} foto dibeli
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to="/user/wallet">
                    <Button variant="outline" className="gap-2">
                      <Wallet className="h-4 w-4" />
                      My Wallet
                    </Button>
                  </Link>
                  <Link to="/user/topup">
                    <Button className="gap-2 bg-green-600 hover:bg-green-700">
                      <CreditCard className="h-4 w-4" />
                      Top Up
                    </Button>
                  </Link>
                </div>
              </div>
              {purchasedCount > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Link to="/user/wallet" className="flex items-center justify-between text-sm hover:text-primary transition-colors">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Lihat foto yang sudah dibeli
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Face Scan CTA */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-strong">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Scan className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-semibold mb-2">Find Your Photos</h2>
                  <p className="text-muted-foreground">
                    Scan your face to automatically discover all photos of you from events
                  </p>
                </div>
                <Link to="/user/scan-face">
                  <Button size="lg" className="shadow-soft">
                    <Camera className="mr-2 h-5 w-5" />
                    Start Face Scan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Photos */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Your Photos ({photos.length})</h2>
              {photos.length > 0 && (
                <Link to="/user/photos">
                  <Button variant="ghost">View All</Button>
                </Link>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden border-border/50">
                    <Skeleton className="aspect-square w-full" />
                  </Card>
                ))}
              </div>
            ) : recentPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentPhotos.map((photo) => (
                  <Link key={photo.photo_id} to="/user/photos">
                    <Card className="overflow-hidden border-border/50 shadow-soft hover:shadow-strong transition-smooth group cursor-pointer">
                      <div className="aspect-square bg-muted relative">
                        <img
                          src={aiService.getPreviewUrl(photo.photo_id)}
                          alt={photo.filename}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-smooth"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-xs text-white font-medium truncate">
                            {photo.metadata?.event_name || 'Unknown Event'}
                          </p>
                          <p className="text-xs text-white/80">
                            {photo.metadata?.date 
                              ? new Date(photo.metadata.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'No date'
                            }
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-border/50 shadow-soft p-8 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No photos yet. Start by scanning your face!</p>
                <Link to="/user/scan-face">
                  <Button>
                    <Camera className="mr-2 h-4 w-4" />
                    Scan Your Face
                  </Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Recent Events */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-border/50 shadow-soft">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : eventStats.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {eventStats.map((event, index) => (
                  <Link key={index} to="/user/photos">
                    <Card className="border-border/50 shadow-soft hover:shadow-strong transition-smooth cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 truncate">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.photos} photos</p>
                            <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-border/50 shadow-soft p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No events yet</p>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
