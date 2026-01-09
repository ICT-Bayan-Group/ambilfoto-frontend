import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { paymentService } from "@/services/api/payment.service";
import { CheckCircle2, Download, ArrowRight, Loader2, Star } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);

  const orderId = searchParams.get('order_id');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (transactionId) {
      fetchTransactionStatus();
    } else {
      setIsLoading(false);
    }
  }, [transactionId]);

  const fetchTransactionStatus = async () => {
    try {
      const response = await paymentService.getTransactionStatus(transactionId!);
      if (response.success) {
        setTransaction(response.data);
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTopUp = orderId?.startsWith('TOPUP');
  const isPhotoPurchase = orderId?.startsWith('PHOTO');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Memverifikasi pembayaran...</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Pembayaran Berhasil!</CardTitle>
                <CardDescription>
                  {isTopUp 
                    ? 'Points telah ditambahkan ke akun Anda'
                    : 'Foto telah ditambahkan ke koleksi Anda'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {transaction && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-medium">{transaction.midtrans_order_id || orderId}</span>
                    </div>
                    {transaction.points_amount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Points</span>
                        <span className="font-medium flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          +{transaction.points_amount}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-green-600">Paid</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {isPhotoPurchase && (
                    <Button 
                      className="gap-2" 
                      onClick={() => navigate('/user/gallery')}
                    >
                      <Download className="h-4 w-4" />
                      Download Foto
                    </Button>
                  )}
                  
                  {isTopUp && (
                    <Button 
                      className="gap-2" 
                      onClick={() => navigate('/user/wallet')}
                    >
                      <Star className="h-4 w-4" />
                      Lihat Wallet
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    className="gap-2" 
                    onClick={() => navigate('/user/dashboard')}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Kembali ke Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
