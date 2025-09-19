import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Heart, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  todayUsers: number;
  todayPosts: number;
  todayLikes: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    todayUsers: 0,
    todayPosts: 0,
    todayLikes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total de posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Total de likes
      const { count: totalLikes } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true });

      // Usuários de hoje (novo perfil criado hoje)
      const { count: todayUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Posts de hoje
      const { count: todayPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Likes de hoje
      const { count: todayLikes } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        totalLikes: totalLikes || 0,
        todayUsers: todayUsers || 0,
        todayPosts: todayPosts || 0,
        todayLikes: todayLikes || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    todayValue, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    todayValue: number; 
    icon: any; 
    color: string 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? "..." : value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Hoje: {loading ? "..." : todayValue}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do seu site e atividade dos usuários
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          todayValue={stats.todayUsers}
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Total de Publicações"
          value={stats.totalPosts}
          todayValue={stats.todayPosts}
          icon={MessageSquare}
          color="text-green-500"
        />
        <StatCard
          title="Total de Curtidas"
          value={stats.totalLikes}
          todayValue={stats.todayLikes}
          icon={Heart}
          color="text-red-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Atividade Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Novos usuários hoje:</span>
                <span className="font-medium">{stats.todayUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Novas publicações hoje:</span>
                <span className="font-medium">{stats.todayPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Curtidas hoje:</span>
                <span className="font-medium">{stats.todayLikes}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status do sistema:</span>
                <span className="text-green-500 font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Último backup:</span>
                <span className="font-medium">Automático</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Versão:</span>
                <span className="font-medium">1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;