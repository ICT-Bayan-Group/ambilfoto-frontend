import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, LogOut, User, Settings, Calendar, Image, Upload, Shield, Users, DollarSign, Activity, Database, Wallet, CreditCard, Banknote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const isPhotographer = user?.role === 'photographer' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin/dashboard";
    return isPhotographer ? "/photographer/dashboard" : "/user/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to={isAuthenticated ? getDashboardLink() : "/"} className="flex items-center gap-2 transition-smooth hover:opacity-80">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AmbildFoto.id</span>
        </Link>
        
        {isAuthenticated ? (
          isAdmin ? (
            // Admin Navigation
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/admin/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dashboard
              </Link>
              <Link to="/admin/users" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Users
              </Link>
              <Link to="/admin/events" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Events
              </Link>
              <Link to="/admin/revenue" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Revenue
              </Link>
            </nav>
          ) : isPhotographer ? (
            // Photographer Navigation
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/photographer/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dashboard
              </Link>
              <Link to="/photographer/events" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Events
              </Link>
              <Link to="/photographer/wallet" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Wallet
              </Link>
            </nav>
          ) : (
            // User Navigation
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/user/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dashboard
              </Link>
              <Link to="/user/photos" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                My Photos
              </Link>
              <Link to="/user/wallet" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Wallet
              </Link>
            </nav>
          )
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              About
            </Link>
          </nav>
        )}
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user?.full_name || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {isAdmin ? 'Admin Account' : isPhotographer ? 'Photographer Account' : 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isAdmin ? (
                  // Admin Menu Items
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        User Management
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/events" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Events
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/downloads" className="cursor-pointer">
                        <Image className="mr-2 h-4 w-4" />
                        Downloads
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/revenue" className="cursor-pointer">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Revenue
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/logs" className="cursor-pointer">
                        <Activity className="mr-2 h-4 w-4" />
                        Activity Logs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/storage" className="cursor-pointer">
                        <Database className="mr-2 h-4 w-4" />
                        Storage
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/withdrawals" className="cursor-pointer">
                        <Banknote className="mr-2 h-4 w-4" />
                        Withdrawals
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : isPhotographer ? (
                  // Photographer Menu Items
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/dashboard" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/events" className="cursor-pointer">
                        <Image className="mr-2 h-4 w-4" />
                        My Events
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/events/new" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Create Event
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/wallet" className="cursor-pointer">
                        <Wallet className="mr-2 h-4 w-4" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Business Profile
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  // User Menu Items
                  <>
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
                    <DropdownMenuItem asChild>
                      <Link to="/user/wallet" className="cursor-pointer">
                        <Wallet className="mr-2 h-4 w-4" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/user/topup" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Top Up Points
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/user/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
