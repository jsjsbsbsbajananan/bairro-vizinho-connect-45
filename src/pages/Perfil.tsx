import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/ui/post-card";
import { Settings, MapPin, Heart, MessageCircle, Calendar, Trophy } from "lucide-react";
import { useAuthRequired } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  display_name: string;
  avatar_url?: string;
  neighborhood: string;
  created_at: string;
}

interface UserPost {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  category: string;
  location: string;
  created_at: string;
  likes: { user_id: string }[];
  comments: { id: string }[];
  reposts: { user_id: string }[];
}

const Perfil = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthRequired();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          image_url,
          category,
          location,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(post => post.id);

        const [likesRes, commentsRes, repostsRes] = await Promise.all([
          supabase.from('likes').select('user_id, post_id').in('post_id', postIds),
          supabase.from('comments').select('id, post_id').in('post_id', postIds),
          supabase.from('reposts').select('user_id, post_id').in('post_id', postIds)
        ]);

        const postsWithData = postsData.map(post => {
          const postLikes = likesRes.data?.filter(l => l.post_id === post.id) || [];
          const postComments = commentsRes.data?.filter(c => c.post_id === post.id) || [];
          const postReposts = repostsRes.data?.filter(r => r.post_id === post.id) || [];

          return {
            ...post,
            likes: postLikes,
            comments: postComments,
            reposts: postReposts
          };
        });

        setUserPosts(postsWithData);
      } else {
        setUserPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="p-4 text-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Header do Perfil */}
      <div className="bg-gradient-primary px-4 pt-6 pb-16 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Meu Perfil</h1>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20 border-4 border-white/20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-2xl">{profile.display_name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile.display_name}</h2>
            <p className="text-white/80 text-sm flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {profile.neighborhood}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Trophy className="w-3 h-3 mr-1" />
                Cidadão Ativo
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-8 mb-6">
        <div className="grid grid-cols-4 gap-2">
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-primary">{userPosts.length}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-red-500">
                {userPosts.reduce((sum, post) => sum + post.likes.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Curtidas</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-500">
                {userPosts.reduce((sum, post) => sum + post.reposts.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Reposts</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-accent">
                {userPosts.reduce((sum, post) => sum + post.comments.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Coments</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informações */}
      <Card className="mx-4 mb-6 shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Minhas Reclamações</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-4 space-y-0">
            {loading ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Carregando suas reclamações...</p>
                </CardContent>
              </Card>
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard 
                  key={post.id}
                  id={post.id}
                  user={{
                    name: profile.display_name,
                    avatar: profile.avatar_url || "",
                    neighborhood: profile.neighborhood
                  }}
                  title={post.title}
                  description={post.description}
                  image={post.image_url}
                  category={post.category as any}
                  likes={post.likes.length}
                  comments={post.comments.length}
                  shares={0}
                  reposts={post.reposts.length}
                  location={post.location}
                  createdAt={new Date(post.created_at).toLocaleDateString('pt-BR')}
                  isLiked={post.likes.some(like => like.user_id === user?.id)}
                  onRefresh={fetchUserPosts}
                />
              ))
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Nenhuma reclamação ainda</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comece a fazer a diferença na sua cidade!
                  </p>
                  <Button asChild>
                    <Link to="/criar">Criar primeira reclamação</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Histórico de Atividades</h3>
                <p className="text-sm text-muted-foreground">
                  Curtidas, comentários e interações aparecerão aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Perfil;