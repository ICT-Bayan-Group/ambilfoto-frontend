import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaceCamera } from "@/components/camera/FaceCamera";
import HeaderDash from "@/components/layout/HeaderDash";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/api/ai.service";
import { userService } from "@/services/api/user.service"; // ✅ Import userService

const ScanFace = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    
    try {
      console.log('📸 Step 1: Extracting face embedding...');
      
      // Step 1: Extract face embedding from image
      const faceResult = await aiService.registerFace(imageData);
      
      if (!faceResult.success || !faceResult.embedding) {
        toast({
          title: "No face detected",
          description: "Please try again with a clear face photo",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      console.log('✅ Face detected, embedding length:', faceResult.embedding.length);
      console.log('📤 Step 2: Matching photos via Node.js API...');
      
      // Step 2: Match photos via Node.js API (authenticated, akan save ke DB)
      const matchResult = await userService.matchPhotos({
        face_image: faceResult.embedding
      });
      
      console.log('📥 Match result:', matchResult);
      
      if (matchResult.success && matchResult.data) {
        const photoCount = matchResult.data.matched_count;
        
        if (photoCount > 0) {
          toast({
            title: "Photos found! 🎉",
            description: `We found ${photoCount} photo${photoCount > 1 ? 's' : ''} of you`,
          });
          
          console.log('✅ Navigating to photo gallery...');
          
          // Navigate to photos page (data sudah di database, tidak perlu localStorage)
          navigate('/user/photos');
        } else {
          toast({
            title: "No photos found",
            description: "We couldn't find any photos matching your face",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      } else {
        throw new Error(matchResult.error || 'Face matching failed');
      }
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to process image';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderDash />
      
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
                      Analyzing face and searching photos
                    </p>
                  </div>
                  <div className="w-64 h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: '70%' }} />
                  </div>
                </div>
              ) : (
                <FaceCamera onCapture={handleCapture} mode="scan" isProcessing={isProcessing} />
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