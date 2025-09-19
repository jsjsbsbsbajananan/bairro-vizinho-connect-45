import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Calendar, Heart, MessageCircle, MapPin, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface RankingPost {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
    neighborhood: string;
  } | null;
  likes: { user_id: string }[];
  comments: { id: string }[];
}

interface UserRankingData {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  neighborhood: string;
  total_likes: number;
  total_posts: number;
}

const categoryColors = {
  buraco: "bg-category-buraco",
  iluminacao: "bg-category-iluminacao", 
  lixo: "bg-category-lixo",
  saude: "bg-category-saude",
  seguranca: "bg-category-seguranca",
  transporte: "bg-category-transporte",
};

const Ranking = () => {
  const [activeTab, setActiveTab] = useState("problemas");
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPost[]>([]);
  const [userRanking, setUserRanking] = useState<UserRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      // Buscar posts da última semana ordenados por likes
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          category,
          location,
          image_url,
          created_at,
          user_id
        `)
        .gte('created_at', lastWeek.toISOString())
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(post => post.id);
        const userIds = postsData.map(post => post.user_id);

        const [profilesRes, likesRes, commentsRes] = await Promise.all([
          supabase.from('profiles').select('user_id, display_name, avatar_url, neighborhood').in('user_id', userIds),
          supabase.from('likes').select('user_id, post_id').in('post_id', postIds),
          supabase.from('comments').select('id, post_id').in('post_id', postIds)
        ]);

        const postsWithData = postsData.map(post => {
          const profile = profilesRes.data?.find(p => p.user_id === post.user_id);
          const postLikes = likesRes.data?.filter(l => l.post_id === post.id) || [];
          const postComments = commentsRes.data?.filter(c => c.post_id === post.id) || [];

          return {
            ...post,
            profiles: profile || {
              display_name: "Usuário",
              avatar_url: null,
              neighborhood: "Local"
            },
            likes: postLikes,
            comments: postComments
          };
        });

        // Ordenar por número de likes (descrescente)
        const sortedPosts = postsWithData
          .sort((a, b) => b.likes.length - a.likes.length)
          .slice(0, 10); // Top 10

        setWeeklyRanking(sortedPosts);
      }

      // Buscar ranking de usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, neighborhood');

      if (usersError) throw usersError;

      if (usersData) {
        const userStatsPromises = usersData.map(async (user) => {
          const [likesRes, postsRes] = await Promise.all([
            supabase
              .from('likes')
              .select('id')
              .eq('user_id', user.user_id),
            supabase
              .from('posts')
              .select('id')
              .eq('user_id', user.user_id)
          ]);

          return {
            ...user,
            total_likes: likesRes.data?.length || 0,
            total_posts: postsRes.data?.length || 0
          };
        });

        const usersWithStats = await Promise.all(userStatsPromises);
        
        // Ordenar por total de likes (descrescente)
        const sortedUsers = usersWithStats
          .sort((a, b) => b.total_likes - a.total_likes)
          .slice(0, 10); // Top 10

        setUserRanking(sortedUsers);
      }
    } catch (error) {
      console.error('Erro ao buscar rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    if (position === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (position === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (position === 2) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position + 1}</span>;
  };

  return (
    <div className="p-4 pb-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 mb-2">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Ranking Semanal</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Os problemas e cidadãos que mais mobilizaram a comunidade
        </p>
      </div>

      {/* Período */}
      <Card className="mb-6 shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">14 - 21 de Setembro</span>
            </div>
            <Badge variant="secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              Esta semana
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="problemas">Top Problemas</TabsTrigger>
          <TabsTrigger value="usuarios">Top Cidadãos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="problemas" className="space-y-4">
          {weeklyRanking.map((item, index) => (
            <Card key={item.id} className={cn(
              "shadow-card overflow-hidden",
              index === 0 && "ring-2 ring-primary/20 bg-primary/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Posição */}
                  <div className="flex flex-col items-center">
                    {getRankIcon(index)}
                    <span className="text-xs text-muted-foreground mt-1">#{index + 1}</span>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-white text-xs", categoryColors[item.category as keyof typeof categoryColors])}
                      >
                        {item.category}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-xs font-medium">{item.likes.length}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium">{item.comments.length}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={item.profiles?.avatar_url} />
                          <AvatarFallback className="text-xs">{item.profiles?.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium">{item.profiles?.display_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="usuarios" className="space-y-4">
          {userRanking.map((user, index) => (
            <Card key={user.user_id} className={cn(
              "shadow-card",
              index === 0 && "ring-2 ring-primary/20 bg-primary/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Posição */}
                  <div className="flex flex-col items-center">
                    {getRankIcon(index)}
                    <span className="text-xs text-muted-foreground mt-1">#{index + 1}</span>
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{user.display_name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {user.neighborhood}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {user.total_likes > 50 ? 'Super Cidadão' : user.total_likes > 20 ? 'Cidadão Ativo' : 'Cidadão Engajado'}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">{user.total_likes}</div>
                    <div className="text-xs text-muted-foreground">curtidas</div>
                    <div className="text-xs text-muted-foreground">{user.total_posts} posts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="mt-6 bg-gradient-secondary shadow-card">
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Quer aparecer no ranking?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Publique reclamações que ajudem sua comunidade e ganhe curtidas!
          </p>
          <Button asChild className="bg-gradient-primary">
            <Link to="/app/criar">Criar Reclamação</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ranking;