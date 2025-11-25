import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AmbilFoto.id</span>
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
