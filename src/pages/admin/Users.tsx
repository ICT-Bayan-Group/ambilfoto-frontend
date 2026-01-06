import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Ban, CheckCircle, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService, AdminUser, PaginationInfo } from '@/services/api/admin.service';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Create Admin Dialog
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', full_name: '' });
  const [creating, setCreating] = useState(false);

  // User Details Dialog
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Action Dialog
  const [actionDialog, setActionDialog] = useState<{ open: boolean; user: AdminUser | null; action: string }>({
    open: false,
    user: null,
    action: '',
  });
  const [actionReason, setActionReason] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (verifiedFilter !== 'all') params.is_verified = verifiedFilter;

      const response = await adminService.getAllUsers(params);
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, verifiedFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleViewDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);
      setShowUserDetails(true);
      const response = await adminService.getUserDetails(userId);
      if (response.success) {
        setSelectedUser(response.data);
      }
    } catch (error) {
      toast.error('Gagal memuat detail user');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.user || !actionDialog.action) return;

    try {
      const response = await adminService.updateUserStatus(
        actionDialog.user.id,
        actionDialog.action as any,
        actionReason
      );
      if (response.success) {
        toast.success(response.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Gagal melakukan aksi');
    } finally {
      setActionDialog({ open: false, user: null, action: '' });
      setActionReason('');
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.full_name) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      setCreating(true);
      const response = await adminService.createAdmin(newAdmin);
      if (response.success) {
        toast.success('Admin berhasil dibuat');
        setShowCreateAdmin(false);
        setNewAdmin({ email: '', password: '', full_name: '' });
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal membuat admin');
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'photographer':
        return <Badge variant="default">Fotografer</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Kelola semua pengguna sistem</p>
          </div>
          <Button onClick={() => setShowCreateAdmin(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Buat Admin
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Cari nama, email, atau telepon..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="photographer">Fotografer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="true">Terverifikasi</SelectItem>
                  <SelectItem value="false">Belum Verifikasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead>Login Terakhir</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada user ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                        {user.business_name && (
                          <div className="text-xs text-muted-foreground mt-1">{user.business_name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.deleted_at ? (
                          <Badge variant="destructive">Dihapus</Badge>
                        ) : user.is_verified ? (
                          <Badge variant="default">Terverifikasi</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'dd MMM yyyy', { locale: id })}
                      </TableCell>
                      <TableCell>
                        {user.last_login
                          ? format(new Date(user.last_login), 'dd MMM yyyy HH:mm', { locale: id })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!user.is_verified && (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ open: true, user, action: 'verify' })}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verifikasi
                              </DropdownMenuItem>
                            )}
                            {user.is_verified && !user.deleted_at && (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ open: true, user, action: 'suspend' })}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {user.deleted_at && (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ open: true, user, action: 'activate' })}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aktifkan Kembali
                              </DropdownMenuItem>
                            )}
                            {!user.deleted_at && (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ open: true, user, action: 'delete' })}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              Menampilkan {users.length} dari {pagination.total} users
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

        {/* Create Admin Dialog */}
        <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Admin Baru</DialogTitle>
              <DialogDescription>
                Buat akun admin baru untuk mengelola sistem
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                  placeholder="Nama lengkap admin"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Password minimal 8 karakter"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateAdmin} disabled={creating}>
                {creating ? 'Membuat...' : 'Buat Admin'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Details Dialog */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail User</DialogTitle>
            </DialogHeader>
            {loadingDetails ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : selectedUser ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nama</Label>
                    <p className="font-medium">{selectedUser.user.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedUser.user.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p>{getRoleBadge(selectedUser.user.role)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p>
                      {selectedUser.user.is_verified ? (
                        <Badge>Terverifikasi</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </p>
                  </div>
                </div>

                {selectedUser.photographer_stats && (
                  <div>
                    <h4 className="font-semibold mb-2">Statistik Fotografer</h4>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-2xl font-bold">{selectedUser.photographer_stats.events?.total_events || 0}</p>
                        <p className="text-sm text-muted-foreground">Events</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedUser.photographer_stats.events?.total_photos || 0}</p>
                        <p className="text-sm text-muted-foreground">Photos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedUser.photographer_stats.downloads?.total_downloads || 0}</p>
                        <p className="text-sm text-muted-foreground">Downloads</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.activities && selectedUser.activities.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Aktivitas Terbaru</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUser.activities.slice(0, 10).map((activity: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                          <span>{activity.action}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(activity.created_at), 'dd MMM HH:mm')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, user: null, action: '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.action === 'verify' && 'Verifikasi User'}
                {actionDialog.action === 'suspend' && 'Suspend User'}
                {actionDialog.action === 'activate' && 'Aktifkan User'}
                {actionDialog.action === 'delete' && 'Hapus User'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.action === 'verify' && `Verifikasi akun ${actionDialog.user?.full_name}?`}
                {actionDialog.action === 'suspend' && `Suspend akun ${actionDialog.user?.full_name}?`}
                {actionDialog.action === 'activate' && `Aktifkan kembali akun ${actionDialog.user?.full_name}?`}
                {actionDialog.action === 'delete' && `Hapus akun ${actionDialog.user?.full_name}? Aksi ini tidak dapat dibatalkan.`}
              </DialogDescription>
            </DialogHeader>
            {(actionDialog.action === 'suspend' || actionDialog.action === 'delete') && (
              <div className="py-4">
                <Label htmlFor="reason">Alasan (opsional)</Label>
                <Input
                  id="reason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Masukkan alasan..."
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ open: false, user: null, action: '' })}>
                Batal
              </Button>
              <Button
                variant={actionDialog.action === 'delete' ? 'destructive' : 'default'}
                onClick={handleAction}
              >
                Konfirmasi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUsers;
