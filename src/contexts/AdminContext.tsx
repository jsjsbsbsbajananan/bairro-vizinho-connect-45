import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminContextType {
  admin: { username: string } | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se admin está logado via localStorage
    const adminData = localStorage.getItem('admin_session');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        setAdmin(parsed);
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Como não podemos usar bcrypt no frontend, vamos criar uma edge function para autenticação
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { username, password }
      });

      if (error) throw error;

      if (data.success) {
        const adminData = { username };
        setAdmin(adminData);
        localStorage.setItem('admin_session', JSON.stringify(adminData));
        toast({
          title: "Login realizado",
          description: "Bem-vindo ao painel administrativo!",
        });
        return { error: null };
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setAdmin(null);
    localStorage.removeItem('admin_session');
  };

  const value = {
    admin,
    loading,
    signIn,
    signOut
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};