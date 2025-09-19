import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MobileLayout from "./components/layout/MobileLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import CriarReclamacao from "./pages/CriarReclamacao";
import Perfil from "./pages/Perfil";
import Ranking from "./pages/Ranking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
