import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeaderDash = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

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
        <div className="flex items-center gap-4">
          {/* User Email Info */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{user?.full_name || "user@example.com"}</span>
          </div>
          
          {/* Logout Button */}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderDash;