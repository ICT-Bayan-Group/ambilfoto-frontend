import { useState, useRef, useEffect } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaceCameraProps {
  onCapture: (imageData: string) => void;
  mode?: 'scan' | 'register';
  className?: string;
}

export const FaceCamera = ({ onCapture, mode = 'scan', className = '' }: FaceCameraProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Simulate face detection (in production, use face-api.js or backend)
      const detectionInterval = setInterval(() => {
        setFaceDetected(Math.random() > 0.3); // Simulate detection
      }, 500);

      return () => clearInterval(detectionInterval);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(imageData);
    }
    
    setTimeout(() => setIsCapturing(false), 500);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  if (error) {
    return (
      <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo Instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Face detection overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`h-64 w-64 border-2 rounded-full transition-all duration-300 ${
            faceDetected 
              ? 'border-secondary shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
              : 'border-primary/30'
          }`}>
            {/* Corner guides */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-primary rounded-tl-lg" />
            <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-primary rounded-br-lg" />
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm flex items-center gap-2 shadow-soft">
          <div className={`h-2 w-2 rounded-full ${
            faceDetected ? 'bg-secondary animate-pulse' : 'bg-destructive'
          }`} />
          <span className="text-xs font-medium">
            {faceDetected ? 'Face Detected' : 'Position Your Face'}
          </span>
        </div>
        
        {/* Capture animation */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white animate-fade-out" />
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Controls */}
      <div className="mt-4 flex gap-3">
        <Button 
          onClick={captureImage} 
          className="flex-1"
          disabled={!faceDetected || isCapturing}
        >
          <Camera className="mr-2 h-4 w-4" />
          {mode === 'scan' ? 'Scan & Find Photos' : 'Capture Face'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="mt-2 text-xs text-center text-muted-foreground">
        {mode === 'scan' 
          ? 'Position your face in the circle for automatic detection'
          : 'Capture a clear photo of your face for registration'}
      </p>
    </div>
  );
};
