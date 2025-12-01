import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import WhatsAppWidget from "@/components/layout/Whatsapp-button";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterFace from "./pages/RegisterFace";
import FaceLogin from "./pages/FaceLogin";
import UserDashboard from "./pages/user/Dashboard";
import ScanFace from "./pages/user/ScanFace";
import PhotoGallery from "./pages/user/PhotoGallery";
import UserProfile from "./pages/user/Profile";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfService from "./pages/Terms";
import Features from "./pages/Feature";
import Pricing from "./pages/Pricing";

// Photographer pages
import PhotographerDashboard from "./pages/photographer/Dashboard";
import PhotographerEvents from "./pages/photographer/Events";
import PhotographerEventDetail from "./pages/photographer/EventDetail";
import PhotographerCreateEvent from "./pages/photographer/CreateEvent";
import PhotographerProfile from "./pages/photographer/Profile";

const queryClient = new QueryClient();

// Protected route for photographers only
const PhotographerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'photographer' && user?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/face" element={<RegisterFace />} />
            <Route path="/login/face" element={<FaceLogin />} />
            
            {/* User Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/scan-face" 
              element={
                <ProtectedRoute>
                  <ScanFace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/photos" 
              element={
                <ProtectedRoute>
                  <PhotoGallery />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Photographer Routes - DIPINDAHKAN KE DALAM ROUTES */}
            <Route 
              path="/photographer/dashboard" 
              element={
                <PhotographerRoute>
                  <PhotographerDashboard />
                </PhotographerRoute>
              } 
            />
            <Route 
              path="/photographer/events" 
              element={
                <PhotographerRoute>
                  <PhotographerEvents />
                </PhotographerRoute>
              } 
            />
            <Route 
              path="/photographer/events/new" 
              element={
                <PhotographerRoute>
                  <PhotographerCreateEvent />
                </PhotographerRoute>
              } 
            />
            <Route 
              path="/photographer/events/:eventId" 
              element={
                <PhotographerRoute>
                  <PhotographerEventDetail />
                </PhotographerRoute>
              } 
            />
            <Route 
              path="/photographer/profile" 
              element={
                <PhotographerRoute>
                  <PhotographerProfile />
                </PhotographerRoute>
              } 
            />
            
            {/* 404 Route - Harus di paling bawah */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* WhatsApp Widget - Di luar Routes tapi di dalam AuthProvider */}
          <WhatsAppWidget />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;