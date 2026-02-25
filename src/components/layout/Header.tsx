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
      <div className="container flex h-24 items-center justify-between py-2">
        <Link to={isAuthenticated ? getDashboardLink() : "/"} className="flex items-center gap-2 transition-smooth hover:opacity-80">
         <img 
            src="https://res.cloudinary.com/dwyi4d3rq/image/upload/v1765171746/ambilfoto-logo_hvn8s2.png" 
            alt="Logo AmbilFoto.id" 
            className="h-28 w-auto"
          />
        </Link>
        
        {isAuthenticated ? (
          isAdmin ? (
            // Navigasi Admin
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/admin/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dasbor
              </Link>
              <Link to="/admin/users" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Pengguna
              </Link>
              <Link to="/admin/events" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Acara
              </Link>
              <Link to="/admin/revenue" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Pendapatan
              </Link>
            </nav>
          ) : isPhotographer ? (
            // Navigasi Fotografer
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/photographer/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dasbor
              </Link>
              <Link to="/photographer/events" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Acara
              </Link>
              <Link to="/photographer/wallet" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dompet
              </Link>
            </nav>
          ) : (
            // Navigasi Pengguna
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/user/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dasbor
              </Link>
              <Link to="/user/photos" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Foto Saya
              </Link>
              <Link to="/user/wallet" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dompet
              </Link>
            </nav>
          )
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              Fitur
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              Harga AI
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              Tentang
            </Link>
            <Link to="/contact" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              Kontak
            </Link>
          </nav>
        )}
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user?.full_name || 'Pengguna'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {isAdmin ? 'Akun Admin' : isPhotographer ? 'Akun Fotografer' : 'Akun Saya'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isAdmin ? (
                  // Menu Admin
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Dasbor
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        Kelola Pengguna
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/events" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Acara
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/downloads" className="cursor-pointer">
                        <Image className="mr-2 h-4 w-4" />
                        Unduhan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/revenue" className="cursor-pointer">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Pendapatan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/logs" className="cursor-pointer">
                        <Activity className="mr-2 h-4 w-4" />
                        Log Aktivitas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/storage" className="cursor-pointer">
                        <Database className="mr-2 h-4 w-4" />
                        Penyimpanan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/withdrawals" className="cursor-pointer">
                        <Banknote className="mr-2 h-4 w-4" />
                        Penarikan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Pengaturan
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : isPhotographer ? (
                  // Menu Fotografer
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/dashboard" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Dasbor
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/events" className="cursor-pointer">
                        <Image className="mr-2 h-4 w-4" />
                        Acara Saya
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/events/new" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Buat Acara
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/wallet" className="cursor-pointer">
                        <Wallet className="mr-2 h-4 w-4" />
                        Dompet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/photographer/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Profil Bisnis
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Menu Pengguna
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/user/dashboard" className="cursor-pointer">
                        Dasbor
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/user/photos" className="cursor-pointer">
                        Foto Saya
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/user/scan-face" className="cursor-pointer">
                        Pindai Wajah
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/user/wallet" className="cursor-pointer">
                        <Wallet className="mr-2 h-4 w-4" />
                        Dompet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/user/topup" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Isi Poin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/user/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Pengaturan Profil
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link to="/register">
                <Button>Mulai</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};