import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, Clock, CheckCircle, Image, RefreshCw, ArrowLeft,
  FileImage, Camera, Calendar, User, Hourglass, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { hiresService, UserHiResPhoto } from '@/services/api/hires.service';

const UserHiResPhotos = () => {
  const [photos, setPhotos] = useState<UserHiResPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await hiresService.getMyHiResPhotos({ status });
      
      if (response.success && response.data) {
        setPhotos(response.data);
      }
    } catch (error) {
      toast.error('Gagal memuat foto Hi-Res');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [activeTab]);

  const handleDownload = async (photo: UserHiResPhoto) => {
    try {
      setDownloadingId(photo.purchase_id);
      await hiresService.downloadHiRes(photo.purchase_id);
      toast.success('Download dimulai!');
    } catch (error) {
      toast.error('Gagal download foto');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (photo: UserHiResPhoto) => {
    switch (photo.hires_status) {
      case 'waiting':
        return (
          <Badge variant="secondary" className="gap-1">
            <Hourglass className="h-3 w-3" /> 
            Menunggu
          </Badge>
        );
      case 'uploaded':
        return (
          <Badge variant="default" className="gap-1 bg-blue-600">
            <CheckCircle className="h-3 w-3" /> 
            Tersedia
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" /> 
            Terunduh
          </Badge>
        );
      default:
        return null;
    }
  };

  const countByStatus = () => {
    const waiting = photos.filter(p => p.hires_status === 'waiting').length;
    const available = photos.filter(p => p.hires_status === 'uploaded' || p.hires_status === 'delivered').length;
    return { waiting, available, total: photos.length };
  };

  const counts = countByStatus();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/user/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileImage className="h-8 w-8 text-primary" />
                Foto Hi-Res Saya
              </h1>
              <p className="text-muted-foreground mt-1">
                Download foto resolusi tinggi yang sudah dibeli
              </p>
            </div>
          </div>
          <Button onClick={fetchPhotos} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FileImage className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.total}</p>
                  <p className="text-sm text-muted-foreground">Total Pembelian</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={counts.available > 0 ? 'border-green-500/50 bg-green-500/5' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.available}</p>
                  <p className="text-sm text-muted-foreground">Siap Download</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={counts.waiting > 0 ? 'border-yellow-500/50 bg-yellow-500/5' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.waiting}</p>
                  <p className="text-sm text-muted-foreground">Menunggu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Tentang Foto Hi-Res
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Setelah pembayaran, fotografer akan mengupload versi resolusi tinggi dalam waktu 24 jam.
                  Anda akan menerima notifikasi ketika foto siap didownload.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="gap-2">
              <FileImage className="h-4 w-4" />
              Semua ({counts.total})
            </TabsTrigger>
            <TabsTrigger value="uploaded" className="gap-2">
              <Download className="h-4 w-4" />
              Siap Download ({counts.available})
            </TabsTrigger>
            <TabsTrigger value="waiting" className="gap-2">
              <Clock className="h-4 w-4" />
              Menunggu ({counts.waiting})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Belum ada foto</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' 
                      ? 'Anda belum membeli foto apapun'
                      : activeTab === 'uploaded'
                      ? 'Belum ada foto yang siap didownload'
                      : 'Tidak ada foto yang sedang menunggu'
                    }
                  </p>
                  <Link to="/user/photos">
                    <Button className="mt-4" variant="outline">
                      Lihat Foto Saya
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <Card key={photo.purchase_id} className="overflow-hidden">
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-32 h-full bg-muted flex-shrink-0">
                        {photo.preview_url ? (
                          <img 
                            src={photo.preview_url} 
                            alt={photo.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{photo.filename}</h3>
                            <p className="text-sm text-muted-foreground truncate">{photo.event_name}</p>
                          </div>
                          {getStatusBadge(photo)}
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            <span className="truncate">{photo.photographer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Dibeli {format(new Date(photo.purchased_at), 'dd MMM yyyy', { locale: id })}</span>
                          </div>
                          {photo.hires_status === 'waiting' && (
                            <div className="flex items-center gap-2 text-yellow-600">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Menunggu {photo.hours_waiting.toFixed(1)} jam</span>
                            </div>
                          )}
                          {photo.hires_uploaded_at && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Ready {formatDistanceToNow(new Date(photo.hires_uploaded_at), { locale: id, addSuffix: true })}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        {photo.can_download ? (
                          <Button 
                            onClick={() => handleDownload(photo)}
                            disabled={downloadingId === photo.purchase_id}
                            className="w-full gap-2"
                            size="sm"
                          >
                            {downloadingId === photo.purchase_id ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                Download Hi-Res
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            disabled
                            variant="secondary"
                            className="w-full gap-2"
                            size="sm"
                          >
                            <Hourglass className="h-4 w-4" />
                            Menunggu Fotografer
                          </Button>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default UserHiResPhotos;
