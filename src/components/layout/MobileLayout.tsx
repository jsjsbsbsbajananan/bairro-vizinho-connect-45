import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plus, User, Trophy, MessageCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();

  const navigationItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Plus, label: "Criar", path: "/criar" },
    { icon: Trophy, label: "Ranking", path: "/ranking" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b shadow-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg text-foreground">CidadãoAtivo</h1>
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation - only show if user is logged in */}
      {user && (
        <nav className="bg-card border-t shadow-elevated sticky bottom-0">
          <div className="flex items-center justify-around py-2">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Show login/register buttons if not logged in */}
      {!user && currentPath === "/" && (
        <div className="bg-card border-t shadow-elevated sticky bottom-0 px-4 py-4">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link to="/cadastro">Cadastrar</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLayout;