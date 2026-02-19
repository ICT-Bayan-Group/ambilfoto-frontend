import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Code2,
  ChevronRight,
  Play,
  ImagePlay,
} from "lucide-react";

interface DeveloperLayoutProps {
  children: React.ReactNode;
  developerId: string;
}

const navItems = (id: string) => [
  { label: "Overview", href: `/developer/${id}`, icon: LayoutDashboard },
  { label: "API Keys", href: `/developer/${id}/keys`, icon: Key },
  { label: "Usage & Analytics", href: `/developer/${id}/usage`, icon: BarChart3 },
  { label: "Billing", href: `/developer/${id}/billing`, icon: FileText },
  { label: "Settings", href: `/developer/${id}/settings`, icon: Settings },
  { label: "PLayground", href: `/developer/${id}/playground`, icon: ImagePlay },
];

export const DeveloperLayout = ({ children, developerId }: DeveloperLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img 
            src="https://res.cloudinary.com/dwyi4d3rq/image/upload/v1765171746/ambilfoto-logo_hvn8s2.png" 
            alt="Logo AmbilFoto.id" 
            className="h-16 w-auto"
             />
            <div>
              <p className="font-bold text-sm leading-tight">AmbilFoto</p>
              <p className="text-xs text-muted-foreground">API Developer Platform</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems(developerId).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Docs link + Logout */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/docs"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
          >
            <Code2 className="h-4 w-4" />
            Documentation
            <ChevronRight className="h-3 w-3 ml-auto" />
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};
