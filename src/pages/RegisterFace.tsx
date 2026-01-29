import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ArrowLeft } from "lucide-react";
import { FaceCamera } from "@/components/camera/FaceCamera";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/api/auth.service";

const RegisterFace = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const userData = location.state as {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: 'user' | 'photographer';
  };

  if (!userData) {
    navigate('/register');
    return null;
  }

  const handleCapture = async (imageData: string) => {
  setIsProcessing(true);
  
  try {
    // ✅ Call registerFace (bukan register lagi)
    const res = await authService.registerFace(imageData);
    
    if (!res.success) {
      throw new Error(res.error || 'Face upload failed');
    }

    // ✅ Update token dengan yang baru (verified)
    if (res.data?.token) {
      localStorage.setItem('auth_token', res.data.token);
    }

    toast({
      title: "Berhasil!",
      description: "Wajah Anda telah terdaftar. Selamat datang!",
    });
    
    // Redirect berdasarkan role
    if (userData.role === 'photographer') {
      navigate('/photographer/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  } catch (error: any) {
    toast({
      title: "Upload gagal",
      description: error.message,
      variant: "destructive"
    });
    setIsProcessing(false);
  }
};

const handleSkip = () => {
  toast({
    title: "Info",
    description: "Anda dapat mendaftarkan wajah nanti di pengaturan profil.",
  });
  
  if (userData.role === 'photographer') {
    navigate('/photographer/dashboard');
  } else {
    navigate('/user/dashboard');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <div className="w-full max-w-lg">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pendaftaran
        </Link>
        
        <Card className="shadow-strong border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Daftarkan Wajah Anda</CardTitle>
            <CardDescription>
              Ambil foto wajah Anda dengan jelas untuk menyelesaikan pendaftaran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FaceCamera 
              onCapture={handleCapture} 
              mode="register"
              isProcessing={isProcessing}
            />
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h3 className="font-medium text-sm">Tips untuk hasil terbaik:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Pastikan pencahayaan yang baik pada wajah Anda</li>
                <li>Lihat langsung ke kamera</li>
                <li>Lepaskan kacamata hitam atau penutup wajah</li>
                <li>Pastikan wajah Anda berada di tengah lingkaran</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterFace;