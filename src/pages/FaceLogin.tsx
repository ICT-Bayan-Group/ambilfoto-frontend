import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FaceLogin = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const { toast } = useToast();

  const handleCapture = () => {
    setIsScanning(true);
    
    // Simulate face detection
    setTimeout(() => {
      setFaceDetected(true);
      setIsScanning(false);
      toast({
        title: "Face detected!",
        description: "Verifying your identity...",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <div className="w-full max-w-lg">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
        
        <Card className="shadow-strong border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login with Face Recognition</CardTitle>
            <CardDescription>
              Position your face in the frame for secure login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera Preview */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                {!faceDetected ? (
                  <div className="text-center space-y-4">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      {isScanning ? "Detecting face..." : "Position your face in the frame"}
                    </p>
                    {isScanning && (
                      <div className="h-1 w-48 bg-primary/20 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                      <span className="text-3xl">✓</span>
                    </div>
                    <p className="text-sm font-medium text-secondary">Face detected!</p>
                  </div>
                )}
              </div>
              
              {/* Face detection overlay */}
              {!faceDetected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`h-64 w-64 border-2 rounded-full ${
                    faceDetected ? "border-secondary" : "border-primary/30"
                  } transition-colors`} />
                </div>
              )}
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className={`h-2 w-2 rounded-full ${
                faceDetected ? "bg-secondary" : "bg-destructive"
              } animate-pulse`} />
              <span className="text-muted-foreground">
                {faceDetected ? "Face Detected" : "No Face Detected"}
              </span>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleCapture} 
                className="w-full"
                disabled={isScanning || faceDetected}
              >
                <Camera className="mr-2 h-4 w-4" />
                {isScanning ? "Capturing..." : faceDetected ? "Verifying..." : "Capture & Login"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo Instead
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              Your face data is encrypted and never shared. We use it only to verify your identity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaceLogin;
