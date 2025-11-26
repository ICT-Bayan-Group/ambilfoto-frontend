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
      <div className="container flex h-16 items-center justify-between">
        <Link to="/user/dashboard" className="flex items-center gap-2 transition-smooth hover:opacity-80">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AmbilFoto.id</span>
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