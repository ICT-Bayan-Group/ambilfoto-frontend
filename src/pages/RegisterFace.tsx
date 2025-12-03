import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ArrowLeft } from "lucide-react";
import { FaceCamera } from "@/components/camera/FaceCamera";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
      await register({
        ...userData,
        face_image: imageData,
        role: userData.role || 'user'
      });
      
      // Redirect based on role
      if (userData.role === 'photographer') {
        navigate('/photographer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <div className="w-full max-w-lg">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          Back to Registration
        </Link>
        
        <Card className="shadow-strong border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Register Your Face</CardTitle>
            <CardDescription>
              Take a clear photo of your face to complete registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FaceCamera 
              onCapture={handleCapture} 
              mode="register"
              isProcessing={isProcessing}
            />
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h3 className="font-medium text-sm">Tips for best results:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Ensure good lighting on your face</li>
                <li>Look directly at the camera</li>
                <li>Remove sunglasses or face coverings</li>
                <li>Keep your face centered in the circle</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterFace;
