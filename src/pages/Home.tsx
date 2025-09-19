import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PostCard } from "@/components/ui/post-card";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  category: string;
  location: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
    neighborhood: string;
  } | null;
  likes: { user_id: string }[];
  comments: { id: string }[];
  reposts: { user_id: string }[];
}

const Home = () => {
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      let query = supabase
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
        `);

      if (sortBy === "popular") {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: postsData, error } = await query;

      if (error) throw error;

      if (postsData && postsData.length > 0) {
        // Buscar profiles, likes, comments e reposts separadamente
        const userIds = postsData.map(post => post.user_id);
        const postIds = postsData.map(post => post.id);

        const [profilesRes, likesRes, commentsRes, repostsRes] = await Promise.all([
          supabase.from('profiles').select('user_id, display_name, avatar_url, neighborhood').in('user_id', userIds),
          supabase.from('likes').select('user_id, post_id').in('post_id', postIds),
          supabase.from('comments').select('id, post_id').in('post_id', postIds),
          supabase.from('reposts').select('user_id, post_id').in('post_id', postIds)
        ]);

        const postsWithData = postsData.map(post => {
          const profile = profilesRes.data?.find(p => p.user_id === post.user_id);
          const postLikes = likesRes.data?.filter(l => l.post_id === post.id) || [];
          const postComments = commentsRes.data?.filter(c => c.post_id === post.id) || [];
          const postReposts = repostsRes.data?.filter(r => r.post_id === post.id) || [];

          return {
            ...post,
            profiles: profile || {
              display_name: "Usuário",
              avatar_url: null,
              neighborhood: "Local"
            },
            likes: postLikes,
            comments: postComments,
            reposts: postReposts
          };
        });

        setPosts(postsWithData);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "popular") {
      return b.likes.length - a.likes.length;
    }
    return 0;
  });

  return (
    <div className="pb-4">
      {/* Banner de Anúncio Local */}
      <div className="mx-4 mt-4 mb-6">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 text-center shadow-glow border border-primary/20">
          <h3 className="font-semibold text-base text-foreground mb-2">🍕 Pizzaria do Bairro</h3>
          <p className="text-sm text-muted-foreground mb-2">Promoção especial para nossa comunidade!</p>
          <p className="text-xs font-medium text-primary">Pizza grande por R$ 25,90 - Entrega grátis no seu bairro!</p>
        </div>
      </div>

      {/* Filtros e Ordenação */}
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="font-bold text-lg text-foreground">Feed de Reclamações</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === "recent" ? "popular" : "recent")}
            className="flex items-center space-x-1"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span className="text-xs">
              {sortBy === "recent" ? "Mais Recente" : "Mais Curtido"}
            </span>
          </Button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-0">
        {loading ? (
          <div className="mx-4 mt-4">
            <div className="bg-card rounded-lg shadow-card border p-6 text-center">
              <p className="text-muted-foreground text-sm">Carregando reclamações...</p>
            </div>
          </div>
        ) : sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <PostCard 
              key={post.id} 
              id={post.id}
               user={{
                name: post.profiles?.display_name || "Usuário",
                avatar: post.profiles?.avatar_url || "",
                neighborhood: post.profiles?.neighborhood || "Local"
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
              createdAt={new Date(post.created_at).toLocaleString('pt-BR')}
              isLiked={user ? post.likes.some(like => like.user_id === user.id) : false}
              onRefresh={fetchPosts}
            />
          ))
        ) : (
          <div className="mx-4 mt-4">
            <div className="bg-card rounded-lg shadow-card border p-6 text-center">
              <p className="text-muted-foreground text-sm">Nenhuma reclamação encontrada.</p>
            </div>
          </div>
        )}
      </div>

      {/* Espaço para mais posts - Loading placeholder */}
      <div className="mx-4 mt-4">
        <div className="bg-card rounded-lg shadow-card border p-6 text-center">
          <p className="text-muted-foreground text-sm">Carregando mais reclamações...</p>
        </div>
      </div>
    </div>
  );
};

export default Home;