import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterFace from "./pages/RegisterFace";
import FaceLogin from "./pages/FaceLogin";
import UserDashboard from "./pages/user/Dashboard";
import ScanFace from "./pages/user/ScanFace";
import About from "./pages/About";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfService from "./pages/Terms";
import Features from "./pages/Feature";
import Pricing from "./pages/Pricing";
import ContactUs from "./pages/Contact";
import PhotoGallery from "./pages/user/PhotoGallery";
import UserProfile from "./pages/user/Profile";
import PhotographerDashboard from "./pages/photographer/Dashboard";
import PhotographerEvents from "./pages/photographer/Events";
import PhotographerEventDetail from "./pages/photographer/EventDetail";
import PhotographerCreateEvent from "./pages/photographer/CreateEvent";
import PhotographerProfile from "./pages/photographer/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminEvents from "./pages/admin/Events";
import AdminDownloads from "./pages/admin/Downloads";
import AdminRevenue from "./pages/admin/Revenue";
import AdminLogs from "./pages/admin/Logs";
import AdminStorage from "./pages/admin/Storage";
import AdminRoute from "./components/AdminRoute";
import AdminWithdrawals from "./pages/admin/Withdrawals";
import AdminSettings from "./pages/admin/Settings";
import UserWallet from "./pages/user/Walllet";
import UserTopUp from "./pages/user/TopUp";
import PhotographerWallet from "./pages/photographer/Wallet";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentPending from "./pages/payment/PaymentPending";
import PaymentFailed from "./pages/payment/PaymentFailed";
import NotFound from "./pages/NotFound";
import PhotoSales from "./pages/photographer/PhotoSales";
import AdminHiResAnalytics from "./pages/admin/HiResAnalytics";
import HiResQueue from "./pages/photographer/HiResQueue";
import UserHiResPhotos from "./pages/user/HiResPhotos";
import PhotographerPhotoLocations from "./pages/photographer/PhotoLocations";
import UserFotoMap from "./pages/user/FotoMap";
import GlobalEventsMap from "./pages/user/GlobalEventMap"; // 🆕 NEW IMPORT
import AdminDropboxImport from "./pages/admin/DropboxImport";
const queryClient = new QueryClient();

// Protected route for photographers only
const PhotographerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Navigate to="/login" replace />} />
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
            <Route 
              path="/user/wallet" 
              element={
                <ProtectedRoute>
                  <UserWallet />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/topup" 
              element={
                <ProtectedRoute>
                  <UserTopUp />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/hires" 
              element={
                <ProtectedRoute>
                  <UserHiResPhotos />
                </ProtectedRoute>
              } 
            />
            {/* 🆕 NEW: Global Events Discovery Map */}
            <Route 
              path="/user/fotomap" 
              element={
                <ProtectedRoute>
                  <GlobalEventsMap />
                </ProtectedRoute>
              } 
            />
            {/* Event-specific FotoMap (existing) */}
            <Route 
              path="/user/fotomap/:eventId" 
              element={
                <ProtectedRoute>
                  <UserFotoMap />
                </ProtectedRoute>
              } 
            />
            
            {/* Photographer Routes */}
            <Route 
              path="/photographer/dashboard" 
              element={
                <PhotographerRoute>
                  <PhotographerDashboard />
                </PhotographerRoute>
              } 
            />
            <Route 
              path="/photographer/photosales" 
              element={
                <PhotographerRoute>
                  <PhotoSales />
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
              path="/photographer/events/:eventId/locations" 
              element={
                <PhotographerRoute>
                  <PhotographerPhotoLocations />
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
            <Route 
              path="/photographer/wallet" 
              element={
                <PhotographerRoute>
                  <PhotographerWallet />
                </PhotographerRoute>
              } 
            />
            <Route 
              path="/photographer/hires-queue" 
              element={
                <PhotographerRoute>
                  <HiResQueue />
                </PhotographerRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/events" 
              element={
                <AdminRoute>
                  <AdminEvents />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/downloads" 
              element={
                <AdminRoute>
                  <AdminDownloads />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/revenue" 
              element={
                <AdminRoute>
                  <AdminRevenue />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/logs" 
              element={
                <AdminRoute>
                  <AdminLogs />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/storage" 
              element={
                <AdminRoute>
                  <AdminStorage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/withdrawals" 
              element={
                <AdminRoute>
                  <AdminWithdrawals />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/hires-analytics" 
              element={
                <AdminRoute>
                  <AdminHiResAnalytics />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/dropbox-import" 
              element={
                <AdminRoute>
                  <AdminDropboxImport />
                </AdminRoute>
              } 
            />
            
            {/* Payment Callback Routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/pending" element={<PaymentPending />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;