
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id');
  const statusMessage = searchParams.get('status_message');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Pembayaran Gagal</CardTitle>
              <CardDescription>
                {statusMessage || 'Terjadi kesalahan saat memproses pembayaran'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {orderId && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-medium">{orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-destructive">Failed</span>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Silakan coba lagi atau gunakan metode pembayaran lain.</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="gap-2" 
                  onClick={() => navigate('/user/topup')}
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </Button>
                
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentFailed;
