import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { paymentService, PointPackage } from "@/services/api/payment.service";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { 
  Star, 
  Gift, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  CreditCard,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import HeaderDash from "@/components/layout/HeaderDash";

const TopUpPage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { pay, isLoaded: isSnapLoaded } = useMidtransSnap();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.getPointPackages();
      if (response.success && response.data) {
        setPackages(response.data.sort((a, b) => a.sort_order - b.sort_order));
      }
    } catch (error) {
      toast.error('Gagal memuat paket FOTOPOIN');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleTopUp = async () => {
    if (!selectedPackage) {
      toast.error('Pilih paket terlebih dahulu');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await paymentService.createTopUp(selectedPackage);
      
      if (response.success && response.data) {
        // Use Midtrans Snap if available
        if (response.data.token && isSnapLoaded) {
          try {
            await pay(response.data.token, {
              onSuccess: (result) => {
                toast.success('Pembayaran berhasil!');
                navigate(`/payment/success?order_id=${result.order_id}&transaction_id=${response.data?.transaction_id}`);
              },
              onPending: (result) => {
                toast.info('Menunggu pembayaran...');
                navigate(`/payment/pending?order_id=${result.order_id}`);
              },
              onError: (result) => {
                toast.error('Pembayaran gagal');
                navigate(`/payment/failed?order_id=${result.order_id}&status_message=${result.status_message}`);
              },
              onClose: () => {
                toast.info('Pembayaran dibatalkan');
                setIsProcessing(false);
              }
            });
          } catch (snapError) {
            // Fallback to redirect
            if (response.data.payment_url) {
              window.location.href = response.data.payment_url;
            }
          }
        } else if (response.data.payment_url) {
          window.location.href = response.data.payment_url;
        }
      } else {
        toast.error(response.error || 'Gagal membuat transaksi');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPackageStyle = (index: number) => {
    const styles = [
      'border-border',
      'border-primary/50 bg-primary/5',
      'border-yellow-500/50 bg-yellow-500/5 ring-2 ring-yellow-500/20',
      'border-purple-500/50 bg-purple-500/5'
    ];
    return styles[index] || styles[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderDash />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Star className="h-8 w-8 text-primary" />
            Isi FOTOPOIN
          </h1>
          <p className="text-muted-foreground mt-1">
            Pilih paket FOTOPOIN untuk membeli foto
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Hemat lebih banyak dengan FOTOPOIN!</p>
                <p className="text-sm text-muted-foreground">
                  Gunakan FOTOPOIN untuk membeli foto dengan harga lebih hemat. 1 FOTOPOIN = Rp 5.000
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <Skeleton className="h-10 w-20 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            packages.map((pkg, index) => (
              <Card 
                key={pkg.id}
                className={`relative cursor-pointer transition-all hover:scale-105 ${getPackageStyle(index)} ${
                  selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {index === 2 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-black">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Populer
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pkg.display_name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1 mb-4">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-3xl font-bold">{pkg.points_amount}</span>
                    <span className="text-muted-foreground">FOTOPOIN</span>
                  </div>
                  
                  {pkg.bonus_points > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-green-600">
                      <Gift className="h-4 w-4" />
                      <span className="text-sm font-medium">+{pkg.bonus_points} Bonus FOTOPOIN!</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(pkg.price)}
                    </p>
                  </div>

                  {selectedPackage === pkg.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Action Section */}
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ringkasan Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPackage ? (
              <>
                {(() => {
                  const selected = packages.find(p => p.id === selectedPackage);
                  if (!selected) return null;
                  return (
                    <>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>Paket</span>
                        <span className="font-medium">{selected.display_name}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>FOTOPOIN</span>
                        <span className="font-medium">{selected.points_amount} FOTOPOIN</span>
                      </div>
                      {selected.bonus_points > 0 && (
                        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg text-green-600">
                          <span>Bonus</span>
                          <span className="font-medium">+{selected.bonus_points} FOTOPOIN</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg text-primary font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(selected.price)}</span>
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Pilih paket FOTOPOIN di atas</p>
              </div>
            )}

            <Button 
              className="w-full gap-2" 
              size="lg"
              disabled={!selectedPackage || isProcessing}
              onClick={handleTopUp}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Bayar Sekarang
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Pembayaran diproses melalui Midtrans. Aman & Terpercaya.
            </p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default TopUpPage;