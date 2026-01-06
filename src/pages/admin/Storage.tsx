import { useState, useEffect } from 'react';
import { Database, Server, Image, Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services/api/admin.service';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';

const AdminStorage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStorage = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStorageStats();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data storage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Storage & Photos</h1>
            <p className="text-muted-foreground">Monitor penyimpanan dan sinkronisasi foto</p>
          </div>
          <Button onClick={fetchStorage} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Sync Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {data?.sync_status?.in_sync ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Synchronized
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Out of Sync
                </>
              )}
            </CardTitle>
            <CardDescription>
              Status sinkronisasi antara database dan AI server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4" />
                  <span className="font-medium">Database</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(data?.sync_status?.db_photos || 0)}</p>
                <p className="text-sm text-muted-foreground">photos</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4" />
                  <span className="font-medium">AI Server</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(data?.sync_status?.ai_photos || 0)}</p>
                <p className="text-sm text-muted-foreground">photos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data?.database?.total_photos || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data?.database?.active_photos || 0)} aktif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Faces</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data?.database?.total_faces || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Deleted Photos</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data?.database?.deleted_photos || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Server Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={data?.ai_server?.status === 'available' ? 'default' : 'destructive'}>
                {data?.ai_server?.status === 'available' ? 'Online' : 'Offline'}
              </Badge>
              {data?.ai_server?.dropbox_photos > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(data?.ai_server?.dropbox_photos)} di Dropbox
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Photos by Event */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Events by Photos</CardTitle>
              <CardDescription>Event dengan jumlah foto terbanyak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.by_event?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data</p>
                ) : (
                  data?.by_event?.map((event: any) => (
                    <div key={event.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-[200px]">{event.event_name}</span>
                        <span className="text-sm text-muted-foreground">{event.photo_count} photos</span>
                      </div>
                      <Progress 
                        value={(event.photo_count / (data?.by_event?.[0]?.photo_count || 1)) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(event.faces_count || 0)} faces detected
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Photographers by Photos</CardTitle>
              <CardDescription>Fotografer dengan jumlah foto terbanyak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.by_photographer?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data</p>
                ) : (
                  data?.by_photographer?.map((photographer: any) => (
                    <div key={photographer.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{photographer.business_name}</span>
                          <p className="text-xs text-muted-foreground">{photographer.photographer_name}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{photographer.photo_count} photos</span>
                      </div>
                      <Progress 
                        value={(photographer.photo_count / (data?.by_photographer?.[0]?.photo_count || 1)) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStorage;
