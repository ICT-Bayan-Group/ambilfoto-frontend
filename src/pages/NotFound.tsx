import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
          {/* Left Content */}
          <div className="flex-1">
            <div className="mb-4 text-5xl font-bold text-blue-600">404 ERROR</div>
            <h1 className="mb-6 text-5xl font-bold uppercase leading-tight text-gray-900 lg:text-5xl">
             HAYOO MAU KEMANA??<br />
              Yang Kamu cari ga ada nih...
            </h1>
            <p className="mb-8 text-lg font-semibold text-gray-600">
              Jangan khawatir, klik tombol di bawah untuk kembali ke website ambilfoto.id!
            </p>
            <a 
              href="/" 
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Home
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Right Illustration */}
          <div className="relative flex-1">
            <img 
              src="https://res.cloudinary.com/dgcedsrzf/image/upload/v1764312505/notfound_uoa0sr.png" 
              alt="404 illustration" 
              className="w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default NotFound;