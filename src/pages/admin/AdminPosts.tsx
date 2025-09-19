import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Heart, 
  MessageCircle,
  MapPin,
  Calendar,
  AlertTriangle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  location: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
    neighborhood: string;
  } | null;
  likes: { user_id: string }[];
  comments: { id: string }[];
}

const categoryLabels = {
  buraco: "Buraco na Rua",
  iluminacao: "Iluminação",
  lixo: "Lixo",
  saude: "Saúde",
  seguranca: "Segurança",
  transporte: "Transporte",
};

const categoryColors = {
  buraco: "bg-red-500",
  iluminacao: "bg-yellow-500", 
  lixo: "bg-green-500",
  saude: "bg-blue-500",
  seguranca: "bg-purple-500",
  transporte: "bg-orange-500",
};

const AdminPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
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
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (postsData && postsData.length > 0) {
        const userIds = postsData.map(post => post.user_id);
        const postIds = postsData.map(post => post.id);

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

        setPosts(postsWithData);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar publicações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      // Primeiro deletar likes e comentários relacionados
      await Promise.all([
        supabase.from('likes').delete().eq('post_id', postId),
        supabase.from('comments').delete().eq('post_id', postId),
        supabase.from('reposts').delete().eq('post_id', postId)
      ]);

      // Depois deletar o post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Post deletado",
        description: "A publicação foi removida com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar publicação",
        variant: "destructive"
      });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.profiles?.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Publicações</h2>
          <p className="text-muted-foreground">
            Gerencie todas as publicações da plataforma
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Lista de Publicações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar publicações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando publicações...
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {post.profiles?.display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{post.profiles?.display_name}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {post.profiles?.neighborhood}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(post.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-white text-xs ${categoryColors[post.category as keyof typeof categoryColors]}`}
                      >
                        {categoryLabels[post.category as keyof typeof categoryLabels]}
                      </Badge>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center space-x-2">
                              <AlertTriangle className="w-5 h-5 text-orange-500" />
                              <span>Deletar publicação</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar esta publicação?
                              <span className="block mt-2 text-red-600">
                                Esta ação não pode ser desfeita e irá remover também todos os likes e comentários.
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePost(post.id)}
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                      {post.description}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {post.location}
                    </p>
                  </div>

                  {/* Image */}
                  {post.image_url && (
                    <div className="w-full h-32 rounded-lg overflow-hidden">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1 text-red-500" />
                      {post.likes.length} curtidas
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1 text-blue-500" />
                      {post.comments.length} comentários
                    </span>
                  </div>
                </div>
              ))}

              {filteredPosts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma publicação encontrada
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPosts;