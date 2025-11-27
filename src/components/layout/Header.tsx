import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-all duration-200 hover:opacity-80">
          <img 
            src="https://res.cloudinary.com/dgcedsrzf/image/upload/c_pad,w_440,h_330,ar_4:3/v1764206071/logo-ambilfoto_ijxmmm.png" 
            alt="AmbilFoto.id Logo" 
            className="h-20 w-auto"
          />
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            About
          </Link>
          <Link to="/features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Features
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Pricing
          </Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
