import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { FaceCamera } from "@/components/camera/FaceCamera";
import { useAuth } from "@/contexts/AuthContext";

const FaceLogin = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { loginWithFace, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    
    try {
      await loginWithFace(imageData);
      navigate('/user/dashboard');
    } catch (error) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <div className="w-full max-w-lg">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Login
        </Link>
        
        <Card className="shadow-strong border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Masuk dengan Pengenalan Wajah</CardTitle>
            <CardDescription>
              Posisikan wajah Anda dalam bingkai untuk login yang aman
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FaceCamera 
              onCapture={handleCapture} 
              mode="scan"
              isProcessing={isProcessing}
            />
            
            <p className="text-xs text-center text-muted-foreground">
              Data wajah Anda dienkripsi dan tidak akan pernah dibagikan. Kami menggunakannya hanya untuk memverifikasi identitas Anda.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaceLogin;