import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Users, TrendingUp, Map } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-white max-w-md">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">CidadãoAtivo</h1>
          <p className="text-white/90 text-lg mb-8 leading-relaxed">
            Sua voz faz a diferença na cidade. Relate problemas, mobilize a comunidade e acompanhe soluções.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Users className="w-5 h-5 mx-auto mb-2" />
              <p>Conecte com vizinhos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <TrendingUp className="w-5 h-5 mx-auto mb-2" />
              <p>Mobilize a comunidade</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Map className="w-5 h-5 mx-auto mb-2" />
              <p>Mapeie problemas</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <MessageCircle className="w-5 h-5 mx-auto mb-2" />
              <p>Acompanhe soluções</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
              <Link to="/cadastro">Criar Conta Grátis</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-white text-white hover:bg-white/10">
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access to Demo */}
      <div className="p-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-white/80 text-sm mb-3">
              Quer ver como funciona primeiro?
            </p>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/app">Ver Demonstração</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
