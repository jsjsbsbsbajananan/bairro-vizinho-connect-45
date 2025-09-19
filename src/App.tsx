import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MobileLayout from "./components/layout/MobileLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import AdminLayout from "./components/admin/AdminLayout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import CriarReclamacao from "./pages/CriarReclamacao";
import Perfil from "./pages/Perfil";
import Ranking from "./pages/Ranking";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Landing page */}
              <Route path="/" element={<MobileLayout><Home /></MobileLayout>} />
              
              {/* Rotas de autenticação (sem layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              
              {/* Rotas protegidas */}
              <Route path="/criar" element={<ProtectedRoute><MobileLayout><CriarReclamacao /></MobileLayout></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><MobileLayout><Perfil /></MobileLayout></ProtectedRoute>} />
              <Route path="/ranking" element={<MobileLayout><Ranking /></MobileLayout>} />
              
              {/* Rotas do admin */}
              <Route path="/admin-site1" element={<AdminLogin />} />
              <Route path="/admin-site1/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin-site1/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/admin-site1/posts" element={<AdminLayout><AdminPosts /></AdminLayout>} />
              <Route path="/admin-site1/banners" element={<AdminLayout><AdminBanners /></AdminLayout>} />
              <Route path="/admin-site1/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
              
              {/* Rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
