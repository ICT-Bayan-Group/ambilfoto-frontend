import { Link } from "react-router-dom";
import { Camera, Mail, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-all duration-200 hover:opacity-80">
              <img 
                src="https://res.cloudinary.com/dwyi4d3rq/image/upload/v1765171746/ambilfoto-logo_hvn8s2.png" 
                alt="AmbilFoto.id Logo" 
                className="h-24 w-auto"
              />
            </Link>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
               <li><Link to="/about" className="hover:text-foreground transition-smooth">About</Link></li>
              <li><Link to="/features" className="hover:text-foreground transition-smooth">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-smooth">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground transition-smooth">Help Center</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-smooth">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-smooth">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@ambildfoto.id</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Balikpapan, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 AmbilFoto.id. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
