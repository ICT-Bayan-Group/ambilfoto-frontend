import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, Clock, CheckCircle, AlertTriangle, RefreshCw, 
  Image, User, Calendar, DollarSign, ArrowLeft, Camera,
  FileImage, AlertCircle, Timer, Package
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { hiresService, HiResQueueItem, HiResQueueStats } from '@/services/api/hires.service';

const HiResQueue = () => {
  const [queue, setQueue] = useState<HiResQueueItem[]>([]);
  const [stats, setStats] = useState<HiResQueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  
  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HiResQueueItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await hiresService.getQueue({ 
        status, 
        overdue_only: showOverdueOnly 
      });
      
      if (response.success && response.data) {
        setQueue(response.data.queue);
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Gagal memuat antrian Hi-Res');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeTab, showOverdueOnly]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format file tidak valid. Gunakan JPG, PNG, atau TIFF.');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimum 50MB.');
      return;
    }

    setUploadFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedItem || !uploadFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setUploadProgress(30);

        // Get image dimensions
        const img = new window.Image();
        img.onload = async () => {
          setUploadProgress(50);

          const response = await hiresService.uploadHiRes(selectedItem.queue_id, {
            face_image: base64,
            filename: uploadFile.name,
            metadata: {
              resolution: `${img.width}x${img.height}`,
              format: uploadFile.type.split('/')[1].toUpperCase(),
              filesize_mb: uploadFile.size / (1024 * 1024),
            },
          });

          setUploadProgress(90);

          if (response.success) {
            toast.success('Hi-Res berhasil diupload!');
            setUploadModalOpen(false);
            setUploadFile(null);
            setUploadPreview(null);
            setSelectedItem(null);
            fetchQueue();
          } else {
            toast.error(response.error || 'Gagal upload Hi-Res');
          }
          
          setIsUploading(false);
          setUploadProgress(100);
        };
        img.src = base64;
      };
      reader.readAsDataURL(uploadFile);
    } catch (error) {
      toast.error('Gagal upload Hi-Res');
      setIsUploading(false);
    }
  };

  const openUploadModal = (item: HiResQueueItem) => {
    setSelectedItem(item);
    setUploadModalOpen(true);
    setUploadFile(null);
    setUploadPreview(null);
  };

  const getStatusBadge = (item: HiResQueueItem) => {
    if (item.is_overdue) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Overdue</Badge>;
    }
    
    switch (item.status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'uploaded':
        return <Badge variant="default" className="gap-1 bg-blue-600"><Upload className="h-3 w-3" /> Uploaded</Badge>;
      case 'delivered':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Delivered</Badge>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/photographer/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileImage className="h-8 w-8 text-primary" />
                Antrian AmbilFoto Hi-Res
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload foto resolusi tinggi untuk pembeli
              </p>
            </div>
          </div>
          <Button onClick={fetchQueue} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className={stats?.pending ? 'border-yellow-500/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={stats?.overdue ? 'border-destructive/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.overdue || 0}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.uploaded || 0}</p>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <div>
                 <p className="text-2xl font-bold">
                {stats?.avg_hours ? parseFloat(stats.avg_hours.toString()).toFixed(1) : 0}h
                </p>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SLA Warning */}
        {(stats?.overdue || 0) > 0 && (
          <Card className="mb-6 bg-destructive/10 border-destructive/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">
                    {stats?.overdue} foto melebihi batas waktu SLA 24 jam!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload segera untuk menghindari rating buruk
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="uploaded" className="gap-2">
                <Upload className="h-4 w-4" />
                Uploaded
              </TabsTrigger>
              <TabsTrigger value="delivered" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Delivered
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Package className="h-4 w-4" />
                All
              </TabsTrigger>
            </TabsList>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showOverdueOnly}
                onChange={(e) => setShowOverdueOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Overdue only</span>
            </label>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : queue.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold">Tidak ada antrian</h3>
                  <p className="text-muted-foreground">
                    Semua foto sudah diproses untuk status ini
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {queue.map((item) => (
                  <Card key={item.queue_id} className={item.is_overdue ? 'border-destructive/50 bg-destructive/5' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Preview */}
                        <div className="w-full md:w-32 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.preview_url ? (
                            <img 
                              src={item.preview_url} 
                              alt={item.filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold truncate">{item.filename}</h3>
                              <p className="text-sm text-muted-foreground">{item.event_name}</p>
                            </div>
                            {getStatusBadge(item)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{item.buyer_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(item.payment_date), 'dd MMM yyyy', { locale: id })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className={item.is_overdue ? 'text-destructive font-semibold' : ''}>
                                {item.hours_since_payment.toFixed(1)}h ago
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{formatCurrency(item.purchase_price)}</span>
                            </div>
                          </div>

                          {/* Deadline progress */}
                          {item.status === 'pending' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">
                                  Deadline: {format(new Date(item.sla_deadline), 'dd MMM HH:mm', { locale: id })}
                                </span>
                                <span className={item.is_overdue ? 'text-destructive' : 'text-muted-foreground'}>
                                  {item.is_overdue ? 'Overdue!' : formatDistanceToNow(new Date(item.sla_deadline), { locale: id, addSuffix: true })}
                                </span>
                              </div>
                              <Progress 
                                value={Math.min((item.hours_since_payment / 24) * 100, 100)} 
                                className={item.is_overdue ? '[&>div]:bg-destructive' : item.hours_since_payment > 18 ? '[&>div]:bg-yellow-500' : ''}
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row md:flex-col gap-2">
                          {item.status === 'pending' && (
                            <Button 
                              onClick={() => openUploadModal(item)}
                              className="gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Upload Hi-Res
                            </Button>
                          )}
                          {item.status === 'uploaded' && (
                            <Badge className="bg-blue-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Waiting Delivery
                            </Badge>
                          )}
                          {item.status === 'delivered' && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Hi-Res Photo
            </DialogTitle>
            <DialogDescription>
              Upload foto resolusi tinggi untuk "{selectedItem?.filename}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File requirements */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 text-sm space-y-1">
                <p className="font-semibold">Persyaratan:</p>
                <ul className="text-muted-foreground list-disc list-inside">
                  <li>Resolusi minimal: 2048x1536</li>
                  <li>Format: JPG, PNG, atau TIFF</li>
                  <li>Ukuran maksimal: 50MB</li>
                  <li>Tanpa watermark</li>
                </ul>
              </CardContent>
            </Card>

            {/* Upload area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${uploadFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary'}
              `}
            >
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/tiff"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {uploadPreview ? (
                <div className="space-y-2">
                  <img 
                    src={uploadPreview} 
                    alt="Preview" 
                    className="max-h-40 mx-auto rounded"
                  />
                  <p className="text-sm font-medium">{uploadFile?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile?.size || 0) / (1024 * 1024) > 1 
                      ? `${((uploadFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`
                      : `${((uploadFile?.size || 0) / 1024).toFixed(0)} KB`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Klik untuk memilih file
                  </p>
                </div>
              )}
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUploadModalOpen(false)}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!uploadFile || isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default HiResQueue;
