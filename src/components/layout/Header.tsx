import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-all duration-200 hover:opacity-80"
        >
          <img
            src="https://res.cloudinary.com/dwyi4d3rq/image/upload/v1765171746/ambilfoto-logo_hvn8s2.png"
            alt="AmbilFoto.id Logo"
            className="h-24 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/about" className="nav-link font-semibold">About</Link>
          <Link to="/features" className="nav-link font-semibold">Features</Link>
          <Link to="/pricing" className="nav-link font-semibold">Pricing</Link>
          <Link to="/contact" className="nav-link font-semibold">Contact</Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 animate-fade-down">
          <nav className="flex flex-col gap-4">
            <Link to="/about" className="mobile-link  font-semibold" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/features" className="mobile-link font-semibold" onClick={() => setMobileOpen(false)}>Features</Link>
            <Link to="/pricing" className="mobile-link font-semibold" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link to="/contact" className="mobile-link font-semibold" onClick={() => setMobileOpen(false)}>Contact</Link>
          </nav>

          <div className="flex flex-col gap-3 mt-6">
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full font-semibold">Login</Button>
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}>
              <Button className="w-full font-semibold">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
