import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, 
  FileText, Calendar, User, RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { photographerUpgradeService, UpgradeStatus } from "@/services/api/photographer.upgrade.service";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PhotographerUpgradeStatus = () => {
  const [status, setStatus] = useState<UpgradeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Safe date formatter to handle null/invalid dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await photographerUpgradeService.getUpgradeStatus();
      if (response.success && response.data) {
        setStatus(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Gagal memuat status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan permintaan upgrade?")) {
      return;
    }

    setCanceling(true);
    try {
      const response = await photographerUpgradeService.cancelUpgradeRequest();
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Permintaan upgrade dibatalkan",
        });
        loadStatus();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Gagal membatalkan",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-8 w-64 mb-4" />
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/user/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Status Upgrade Photographer</h1>
            <p className="text-muted-foreground">
              Pantau status permintaan upgrade akun Anda
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* No Request Yet */}
        {!status?.has_request && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Belum Ada Permintaan</h3>
                <p className="text-muted-foreground mb-6">
                  Anda belum pernah mengajukan permintaan upgrade ke photographer
                </p>
                {status?.can_submit && (
                  <Link to="/user/upgrade-to-photographer">
                    <Button>Ajukan Sekarang</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Has Request */}
        {status?.has_request && status.current_request && (
          <div className="space-y-6">
            {/* Current Request Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Permintaan Terkini</CardTitle>
                  {getStatusBadge(status.current_request.status)}
                </div>
                <CardDescription>
                  Diajukan pada {formatDate(status.current_request.submitted_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Message */}
                {status.current_request.status === 'pending' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Permintaan Anda sedang dalam proses review oleh tim kami. Kami akan meninjau dalam 1-3 hari kerja.
                    </AlertDescription>
                  </Alert>
                )}

                {status.current_request.status === 'approved' && (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900">
                      Selamat! Permintaan Anda telah disetujui. Akun Anda sekarang adalah photographer.
                      {status.current_request.reviewed_at && (
                        <span className="block text-sm mt-1">
                          Disetujui pada {formatDate(status.current_request.reviewed_at)}
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {status.current_request.status === 'rejected' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Permintaan Ditolak</strong>
                      {status.current_request.rejection_reason && (
                        <p className="mt-2">Alasan: {status.current_request.rejection_reason}</p>
                      )}
                      {status.current_request.reviewed_at && (
                        <p className="text-sm mt-1">
                          Ditolak pada {formatDate(status.current_request.reviewed_at)}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Request Details */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Bisnis</p>
                    <p className="font-medium">{status.current_request.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status Verifikasi KTP</p>
                    <p className="font-medium capitalize">{status.current_request.ktp_verification_status || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status Face Match</p>
                    <p className="font-medium capitalize">{status.current_request.face_match_status || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Update</p>
                    <p className="font-medium">{formatDate(status.current_request.updated_at)}</p>
                  </div>
                </div>

                {/* Verification Scores */}
                {status.current_request.face_match_score && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Skor Verifikasi</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Face Match: {Math.round(status.current_request.face_match_score * 100)}%</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  {status.current_request.status === 'pending' && (
                    <Button variant="destructive" onClick={handleCancel} disabled={canceling}>
                      {canceling ? "Membatalkan..." : "Batalkan Permintaan"}
                    </Button>
                  )}
                  
                  {status.current_request.status === 'approved' && (
                    <Link to="/photographer/dashboard" className="flex-1">
                      <Button className="w-full">
                        Buka Dashboard Photographer
                      </Button>
                    </Link>
                  )}
                  
                  {status.current_request.status === 'rejected' && status.stats.can_resubmit && (
                    <Link to="/user/upgrade-to-photographer" className="flex-1">
                      <Button className="w-full">
                        Ajukan Ulang ({status.stats.remaining_attempts} percobaan tersisa)
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistik Permintaan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{status.stats.total_attempts}</p>
                    <p className="text-sm text-muted-foreground">Total Percobaan</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{status.stats.max_attempts}</p>
                    <p className="text-sm text-muted-foreground">Maksimal</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{status.stats.remaining_attempts}</p>
                    <p className="text-sm text-muted-foreground">Tersisa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            {status.current_request.status === 'rejected' && !status.stats.can_resubmit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Anda telah mencapai batas maksimal percobaan upgrade. Silakan hubungi customer support untuk bantuan lebih lanjut.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PhotographerUpgradeStatus;