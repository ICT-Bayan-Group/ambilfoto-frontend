import { useState, useEffect } from 'react';
import { Search, Eye, Calendar, MapPin, Camera, Users, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService, AdminEvent, PaginationInfo } from '@/services/api/admin.service';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AdminEvents = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Event Details
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await adminService.getAllEvents(params);
      if (response.success) {
        setEvents(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Gagal memuat data events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchEvents();
  };

  const handleViewDetails = async (eventId: string) => {
    try {
      setLoadingDetails(true);
      setShowEventDetails(true);
      const response = await adminService.getEventDetails(eventId);
      if (response.success) {
        setSelectedEvent(response.data);
      }
    } catch (error) {
      toast.error('Gagal memuat detail event');
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktif</Badge>;
      case 'completed':
        return <Badge variant="secondary">Selesai</Badge>;
      case 'archived':
        return <Badge variant="outline">Diarsipkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">Kelola semua event fotografer</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Cari nama event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="archived">Diarsipkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Fotografer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Photos</TableHead>
                  <TableHead className="text-center">Downloads</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada event ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.event_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(event.event_date), 'dd MMM yyyy', { locale: id })}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.business_name}</div>
                          <div className="text-sm text-muted-foreground">{event.photographer_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(event.status)}
                        {event.is_public && (
                          <Badge variant="outline" className="ml-1">Publik</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                          {event.photo_count}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Download className="w-4 h-4 text-muted-foreground" />
                          {event.download_count}
                        </div>
                        {event.matched_users > 0 && (
                          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.matched_users} users
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(event.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(event.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan {events.length} dari {pagination.total} events
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.total_pages}
                onClick={() => setPage(page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Event Details Dialog */}
        <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Event</DialogTitle>
            </DialogHeader>
            {loadingDetails ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : selectedEvent ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Event</p>
                    <p className="font-medium">{selectedEvent.event.event_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipe</p>
                    <p className="font-medium">{selectedEvent.event.event_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal</p>
                    <p className="font-medium">
                      {format(new Date(selectedEvent.event.event_date), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lokasi</p>
                    <p className="font-medium">{selectedEvent.event.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fotografer</p>
                    <p className="font-medium">{selectedEvent.event.photographer_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.event.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedEvent.event.status)}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Statistik</h4>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-2xl font-bold">{selectedEvent.photos?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Photos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedEvent.statistics?.unique_users_matched || 0}</p>
                      <p className="text-sm text-muted-foreground">Users Matched</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(selectedEvent.statistics?.total_revenue || 0)}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </div>

                {selectedEvent.photos && selectedEvent.photos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Photos ({selectedEvent.photos.length})</h4>
                    <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                      {selectedEvent.photos.slice(0, 20).map((photo: any) => (
                        <div key={photo.id} className="aspect-square bg-muted rounded-lg flex items-center justify-center relative">
                          <Camera className="w-6 h-6 text-muted-foreground" />
                          {photo.downloads > 0 && (
                            <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">
                              {photo.downloads}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminEvents;
