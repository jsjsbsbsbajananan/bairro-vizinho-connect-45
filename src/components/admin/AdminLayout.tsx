import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  LogOut, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Settings, 
  Image, 
  UserX 
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: "/admin-site1/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/admin-site1/users", label: "Usuários", icon: Users },
  { path: "/admin-site1/posts", label: "Publicações", icon: MessageSquare },
  { path: "/admin-site1/banners", label: "Banners", icon: Image },
  { path: "/admin-site1/settings", label: "Configurações", icon: Settings },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { admin, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!admin) {
      navigate("/admin-site1");
    }
  }, [admin, navigate]);

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">Bem-vindo, {admin.username}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver Site
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-card border-r">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link 
                      to={item.path}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;