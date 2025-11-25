import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaceCamera } from "@/components/camera/FaceCamera";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ScanFace = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate API calls
      // 1. Extract face embedding
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 2. Match with photos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Photos found!",
        description: "We found 24 photos of you across multiple events",
      });
      
      // Redirect to results
      setTimeout(() => {
        navigate('/user/photos');
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          <Link 
            to="/user/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <Card className="shadow-strong border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">Scan Your Face</CardTitle>
              <CardDescription>
                Position your face clearly in the camera to find all your photos automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="aspect-square w-full rounded-lg bg-muted flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <div className="text-center space-y-2">
                    <p className="font-medium">Processing your photo...</p>
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments
                    </p>
                  </div>
                  <div className="w-64 h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: '70%' }} />
                  </div>
                </div>
              ) : (
                <FaceCamera onCapture={handleCapture} mode="scan" />
              )}
              
              <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-2">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default ScanFace;
