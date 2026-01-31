import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, LogOut, Settings, User, Bell, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { photographerUpgradeService, UpgradeStatus } from "@/services/api/photographer.upgrade.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const HeaderDash = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeStatus | null>(null);
  const [showUpgradeNotif, setShowUpgradeNotif] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadUpgradeStatus();
    }
  }, [isAuthenticated]);

  const loadUpgradeStatus = async () => {
    try {
      const response = await photographerUpgradeService.getUpgradeStatus();
      if (response.success && response.data) {
        setUpgradeStatus(response.data);
        // Show notification if user hasn't requested upgrade yet
        setShowUpgradeNotif(!response.data.has_request);
      }
    } catch (error) {
      console.error('Error loading upgrade status:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-all duration-200 hover:opacity-80">
          <img 
            src="https://res.cloudinary.com/dwyi4d3rq/image/upload/v1765171746/ambilfoto-logo_hvn8s2.png" 
            alt="AmbilFoto.id Logo" 
            className="h-20 w-auto"
          />
        </Link>
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Photographer Upgrade Notification */}
              {showUpgradeNotif && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 relative border-purple-200 text-purple-600 hover:bg-purple-700">
                      <Briefcase className="h-4 w-4" />
                      <span className="hidden md:inline">Jadi Photographer</span>
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-purple-500 hover:bg-purple-600">
                        !
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center gap-2 text-purple-600">
                      <Briefcase className="h-4 w-4" />
                      Upgrade ke Photographer
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-3 space-y-2">
                      <p className="text-sm text-gray-700 font-medium">
                        Ingin Jadi Photographer?
                      </p>
                      <p className="text-xs text-gray-600">
                        Upgrade akun Anda dan mulai upload foto, buat event, dan hasilkan pendapatan dari foto Anda!
                      </p>
                      <Link to="/user/upgrade-to-photographer">
                        <Button size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700">
                          <Camera className="mr-2 h-4 w-4" />
                          Upgrade Sekarang
                        </Button>
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{user?.full_name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/user/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/user/photos" className="cursor-pointer">
                      My Photos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/user/scan-face" className="cursor-pointer">
                      Scan Face
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/user/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderDash;