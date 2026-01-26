import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  FolderOpen,
  Image,
  HardDrive,
  Clock,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Square,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Lock,
  Globe,
  Cpu,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Header } from '@/components/layout/Header';
import { toast } from 'sonner';
import {
  dropboxService,
  DropboxFolder,
  FolderDetailsResponse,
  ProcessingStatusResponse,
  ProcessingLog,
  Photographer,
} from '@/services/api/dropbox.service';

const AdminDropboxImport = () => {
  const navigate = useNavigate();
  
  // Folder browsing state
  const [folders, setFolders] = useState<DropboxFolder[]>([]);
  const [currentPath, setCurrentPath] = useState('/events');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  
  // Selected folder state
  const [selectedFolder, setSelectedFolder] = useState<DropboxFolder | null>(null);
  const [folderDetails, setFolderDetails] = useState<FolderDetailsResponse['data'] | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Event creation state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loadingPhotographers, setLoadingPhotographers] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    event_name: '',
    event_type: 'wedding',
    event_date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    is_public: false,
    access_code: '',
    photographer_id: '',
    default_price_points: 5,
    default_price_cash: 10000,
    is_for_sale: true,
    watermark_enabled: true,
    extract_gps: true,
    event_latitude: undefined as number | undefined,
    event_longitude: undefined as number | undefined,
  });
  
  // Processing monitoring state
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusResponse['data'] | null>(null);
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([]);
  const [showLogsDialog, setShowLogsDialog] = useState(false);

  // Fetch folders
  const fetchFolders = useCallback(async (path?: string) => {
    try {
      setLoadingFolders(true);
      const response = await dropboxService.getDropboxFolders(path);
      if (response.success) {
        setFolders(response.data.folders);
        if (path) {
          setCurrentPath(path);
        }
      }
    } catch (error) {
      toast.error('Gagal memuat folder Dropbox');
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  // Fetch folder details
  const fetchFolderDetails = async (folder: DropboxFolder) => {
    try {
      setLoadingDetails(true);
      setSelectedFolder(folder);
      const response = await dropboxService.getFolderDetails(folder.path);
      if (response.success) {
        setFolderDetails(response.data);
        // Pre-fill event name from folder name
        setEventForm(prev => ({
          ...prev,
          event_name: folder.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        }));
      }
    } catch (error) {
      toast.error('Gagal memuat detail folder');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch photographers
  const fetchPhotographers = async () => {
    try {
      setLoadingPhotographers(true);
      const response = await dropboxService.getPhotographers();
      if (response.success) {
        setPhotographers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch photographers:', error);
    } finally {
      setLoadingPhotographers(false);
    }
  };

  // Navigate into folder
  const navigateToFolder = (folder: DropboxFolder) => {
    setPathHistory(prev => [...prev, currentPath]);
    fetchFolders(folder.path);
    setSelectedFolder(null);
    setFolderDetails(null);
  };

  // Navigate back
  const navigateBack = () => {
    const previousPath = pathHistory.pop();
    if (previousPath) {
      setPathHistory([...pathHistory]);
      fetchFolders(previousPath);
      setSelectedFolder(null);
      setFolderDetails(null);
    }
  };

  // Create event
  const handleCreateEvent = async () => {
    if (!selectedFolder) return;
    
    if (!eventForm.event_name || !eventForm.photographer_id || !eventForm.location) {
      toast.error('Lengkapi semua field yang diperlukan');
      return;
    }
    
    try {
      setCreating(true);
      const response = await dropboxService.createEventFromDropbox({
        dropbox_path: selectedFolder.path,
        ...eventForm,
      });
      
      if (response.success) {
        toast.success(response.message);
        setShowCreateDialog(false);
        setProcessingEventId(response.data.event_id);
        // Start polling for status
        pollProcessingStatus(response.data.event_id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal membuat event');
    } finally {
      setCreating(false);
    }
  };

  // Poll processing status
  const pollProcessingStatus = useCallback(async (eventId: string) => {
    try {
      const response = await dropboxService.getProcessingStatus(eventId);
      if (response.success) {
        setProcessingStatus(response.data);
        
        // Continue polling if still processing
        if (response.data.status === 'processing' || response.data.status === 'pending') {
          setTimeout(() => pollProcessingStatus(eventId), 3000);
        } else {
          // Processing complete
          if (response.data.status === 'completed') {
            toast.success(`Event berhasil diproses! ${response.data.total_photos} foto dengan AI.`);
          } else if (response.data.status === 'failed') {
            toast.error('Proses AI gagal');
          }
        }
      }
    } catch (error) {
      console.error('Failed to poll status:', error);
    }
  }, []);

  // Cancel processing
  const handleCancelProcessing = async () => {
    if (!processingEventId) return;
    
    try {
      const response = await dropboxService.cancelProcessing(processingEventId);
      if (response.success) {
        toast.success('Proses dibatalkan');
        setProcessingStatus(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
    } catch (error) {
      toast.error('Gagal membatalkan proses');
    }
  };

  // View logs
  const handleViewLogs = async () => {
    if (!processingEventId) return;
    
    try {
      const response = await dropboxService.getProcessingLog(processingEventId);
      if (response.success) {
        setProcessingLogs(response.data.logs);
        setShowLogsDialog(true);
      }
    } catch (error) {
      toast.error('Gagal memuat log');
    }
  };

  // Initial load
  useEffect(() => {
    fetchFolders();
    fetchPhotographers();
  }, [fetchFolders]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Cpu className="w-8 h-8" />
            AI Event Import
          </h1>
          <p className="text-muted-foreground">
            Import event dari folder Dropbox dengan AI Face Recognition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Folder Browser */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Dropbox Browser
                  </CardTitle>
                  <CardDescription className="font-mono text-sm mt-1">
                    {currentPath}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={navigateBack}
                    disabled={pathHistory.length === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchFolders(currentPath)}
                    disabled={loadingFolders}
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingFolders ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {loadingFolders ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : folders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada folder ditemukan</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedFolder?.id === folder.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => fetchFolderDetails(folder)}
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="w-8 h-8 text-amber-500" />
                          <div>
                            <p className="font-medium">{folder.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {folder.file_count} files
                              </span>
                              <span className="flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {folder.total_size_mb} MB
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToFolder(folder);
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Folder Details & Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Detail Folder
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedFolder ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Pilih folder untuk melihat detail</p>
                </div>
              ) : loadingDetails ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : folderDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{selectedFolder.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {folderDetails.folder_path}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{folderDetails.total_files}</p>
                      <p className="text-sm text-muted-foreground">Total Files</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{folderDetails.total_size_mb}</p>
                      <p className="text-sm text-muted-foreground">MB Size</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Estimasi waktu proses: ~{folderDetails.estimated_processing_time} menit</span>
                  </div>

                  {folderDetails.sample_thumbnails.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Preview Sampel</p>
                      <div className="grid grid-cols-3 gap-2">
                        {folderDetails.sample_thumbnails.slice(0, 6).map((thumb, i) => (
                          <div
                            key={i}
                            className="aspect-square bg-muted rounded-lg overflow-hidden"
                          >
                            <img
                              src={thumb.thumbnail_url}
                              alt={thumb.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowCreateDialog(true)}
                    disabled={folderDetails.total_files === 0}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Create Event & Start AI
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Processing Status Card */}
        {processingStatus && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  AI Processing Status
                </CardTitle>
                <Badge
                  variant={
                    processingStatus.status === 'completed'
                      ? 'default'
                      : processingStatus.status === 'processing'
                      ? 'secondary'
                      : processingStatus.status === 'failed'
                      ? 'destructive'
                      : 'outline'
                  }
                >
                  {processingStatus.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {processingStatus.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                  {processingStatus.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                  {processingStatus.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold">{processingStatus.progress.total}</p>
                    <p className="text-xs text-muted-foreground">Total Files</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold">{processingStatus.progress.processed}</p>
                    <p className="text-xs text-muted-foreground">Processed</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{processingStatus.progress.successful}</p>
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{processingStatus.progress.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{processingStatus.total_photos}</p>
                    <p className="text-xs text-muted-foreground">Photos Created</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {processingStatus.progress.processed} / {processingStatus.progress.total}
                      {' '}({Math.round((processingStatus.progress.processed / processingStatus.progress.total) * 100)}%)
                    </span>
                  </div>
                  <Progress
                    value={(processingStatus.progress.processed / processingStatus.progress.total) * 100}
                  />
                  {processingStatus.progress.current_file && (
                    <p className="text-xs text-muted-foreground">
                      Processing: {processingStatus.progress.current_file}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleViewLogs}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                  {processingStatus.status === 'processing' && (
                    <Button variant="destructive" onClick={handleCancelProcessing}>
                      <Square className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                  {processingStatus.status === 'completed' && (
                    <Button onClick={() => navigate(`/admin/events`)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      View Event
                    </Button>
                  )}
                </div>

                {/* Recent Logs */}
                {processingStatus.recent_logs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recent Activity</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {processingStatus.recent_logs.slice(0, 5).map((log, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                        >
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="flex-1 truncate">{log.file_name}</span>
                          {log.faces_detected > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {log.faces_detected} faces
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Event dari Dropbox</DialogTitle>
            <DialogDescription>
              Folder: {selectedFolder?.name} ({folderDetails?.total_files} files)
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Event Name *</Label>
                  <Input
                    value={eventForm.event_name}
                    onChange={(e) => setEventForm(prev => ({ ...prev, event_name: e.target.value }))}
                    placeholder="Wedding John & Jane"
                  />
                </div>

                <div>
                  <Label>Event Type</Label>
                  <Select
                    value={eventForm.event_type}
                    onValueChange={(v) => setEventForm(prev => ({ ...prev, event_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="graduation">Graduation</SelectItem>
                      <SelectItem value="concert">Concert</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Event Date *</Label>
                  <Input
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Location *</Label>
                  <Input
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Grand Ballroom Hotel XYZ"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Photographer *</Label>
                  <Select
                    value={eventForm.photographer_id}
                    onValueChange={(v) => setEventForm(prev => ({ ...prev, photographer_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih fotografer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {photographers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.business_name || p.full_name} ({p.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Dijual</p>
                  <p className="text-sm text-muted-foreground">Foto dapat dibeli user</p>
                </div>
                <Switch
                  checked={eventForm.is_for_sale}
                  onCheckedChange={(c) => setEventForm(prev => ({ ...prev, is_for_sale: c }))}
                />
              </div>

              {eventForm.is_for_sale && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Harga (Points)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={eventForm.default_price_points}
                      onChange={(e) => setEventForm(prev => ({ ...prev, default_price_points: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Harga (Cash IDR)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={eventForm.default_price_cash}
                      onChange={(e) => setEventForm(prev => ({ ...prev, default_price_cash: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Watermark</p>
                  <p className="text-sm text-muted-foreground">Tambahkan watermark pada preview</p>
                </div>
                <Switch
                  checked={eventForm.watermark_enabled}
                  onCheckedChange={(c) => setEventForm(prev => ({ ...prev, watermark_enabled: c }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {eventForm.is_public ? (
                    <Globe className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium">Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      {eventForm.is_public ? 'Publik - Semua bisa akses' : 'Private - Perlu kode akses'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={eventForm.is_public}
                  onCheckedChange={(c) => setEventForm(prev => ({ ...prev, is_public: c }))}
                />
              </div>

              {!eventForm.is_public && (
                <div>
                  <Label>Access Code</Label>
                  <Input
                    value={eventForm.access_code}
                    onChange={(e) => setEventForm(prev => ({ ...prev, access_code: e.target.value.toUpperCase() }))}
                    placeholder="JOHN2026"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Extract GPS</p>
                  <p className="text-sm text-muted-foreground">Ambil lokasi dari EXIF metadata</p>
                </div>
                <Switch
                  checked={eventForm.extract_gps}
                  onCheckedChange={(c) => setEventForm(prev => ({ ...prev, extract_gps: c }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={eventForm.event_latitude || ''}
                    onChange={(e) => setEventForm(prev => ({ 
                      ...prev, 
                      event_latitude: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="-6.200000"
                  />
                </div>
                <div>
                  <Label>Default Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={eventForm.event_longitude || ''}
                    onChange={(e) => setEventForm(prev => ({ 
                      ...prev, 
                      event_longitude: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="106.816666"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateEvent} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Create & Start AI Processing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Processing Logs</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Faces</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processingLogs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {log.status === 'success' ? (
                        <Badge variant="default" className="bg-green-500">Success</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.file_name}</TableCell>
                    <TableCell>{log.faces_detected}</TableCell>
                    <TableCell className="text-red-500 text-sm max-w-[200px] truncate">
                      {log.error_message || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDropboxImport;
