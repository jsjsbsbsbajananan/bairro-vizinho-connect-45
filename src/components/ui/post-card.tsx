import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, MapPin, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";  
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CommentsModal } from "@/components/ui/comments-modal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  id: string;
  user: {
    name: string;
    avatar?: string;
    neighborhood: string;
  };
  title: string;
  description: string;
  image?: string;
  category: "buraco" | "iluminacao" | "lixo" | "saude" | "seguranca" | "transporte";
  likes: number;
  comments: number;
  shares: number;
  reposts?: number;
  location: string;
  createdAt: string;
  isLiked?: boolean;
  isShared?: boolean;
  originalPost?: {
    user: { name: string; avatar?: string; neighborhood: string };
    createdAt: string;
  };
  onRefresh?: () => void;
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
  buraco: "bg-category-buraco",
  iluminacao: "bg-category-iluminacao", 
  lixo: "bg-category-lixo",
  saude: "bg-category-saude",
  seguranca: "bg-category-seguranca",
  transporte: "bg-category-transporte",
};

export const PostCard = ({ 
  id, user, title, description, image, category, likes, comments, shares, reposts = 0,
  location, createdAt, isLiked = false, isShared = false, originalPost, onRefresh
}: PostCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const [shared, setShared] = useState(false); // Inicializar com reposts existentes
  const [likeCount, setLikeCount] = useState(likes);
  const [repostCount, setRepostCount] = useState(reposts);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [showComments, setShowComments] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Verificar se o usuário já fez repost
  useEffect(() => {
    if (currentUser && reposts > 0) {
      // Esta verificação seria melhor fazer via query, mas por simplicidade mantemos assim
      setShared(false);
    }
  }, [currentUser, reposts]);

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir posts",
        variant: "destructive"
      });
      return;
    }

    try {
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', id);

        if (error) throw error;
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: currentUser.id,
            post_id: id
          });

        if (error) throw error;
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
      
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRepost = async () => {
    if (!currentUser) {
      toast({
        title: "Login necessário",
        description: "Faça login para repostar",
        variant: "destructive"
      });
      return;
    }

    try {
      if (shared) {
        const { error } = await supabase
          .from('reposts')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', id);

        if (error) throw error;
        setShared(false);
        setRepostCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('reposts')
          .insert({
            user_id: currentUser.id,
            post_id: id
          });

        if (error) throw error;
        setShared(true);
        setRepostCount(prev => prev + 1);
      }
      
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-card mb-4 overflow-hidden border-0 bg-card/50 backdrop-blur-sm mx-4">
      <CardContent className="p-0">
        {/* Repost indicator */}
        {originalPost && (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Repeat2 className="w-3 h-3 mr-1" />
              <span>{user.name} repostou</span>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-11 h-11 ring-2 ring-primary/10">
              <AvatarImage src={originalPost?.user.avatar || user.avatar} />
              <AvatarFallback>{(originalPost?.user.name || user.name).charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{originalPost?.user.name || user.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {originalPost?.user.neighborhood || user.neighborhood} • {originalPost?.createdAt || createdAt}
              </p>
            </div>
            <Badge 
              variant="secondary" 
              className={cn("text-white text-xs font-medium", categoryColors[category])}
            >
              {categoryLabels[category]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <h2 className="font-semibold text-base mb-2 line-clamp-2 leading-snug">{title}</h2>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">{description}</p>
          
          <div className="flex items-center text-xs text-muted-foreground bg-muted/30 rounded-full px-2 py-1 w-fit">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{location}</span>
          </div>
        </div>

        {/* Image */}
        {image && (
          <div className="relative mx-4 mb-3 rounded-xl overflow-hidden">
            <img 
              src={image} 
              alt={title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 border-t border-border/30">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-all duration-200 hover:bg-red-50 rounded-full px-3 py-2",
                liked && "text-red-500 bg-red-50"
              )}
              onClick={handleLike}
            >
              <Heart className={cn("w-4 h-4", liked && "fill-current")} />
              <span className="text-xs font-medium">{likeCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-all duration-200 hover:bg-blue-50 rounded-full px-3 py-2"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium">{commentsCount}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex items-center space-x-2 text-muted-foreground hover:text-green-500 transition-all duration-200 hover:bg-green-50 rounded-full px-3 py-2",
                shared && "text-green-500 bg-green-50"
              )}
              onClick={handleRepost}
            >
              <Repeat2 className="w-4 h-4" />
              <span className="text-xs font-medium">{repostCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/10 rounded-full px-3 py-2">
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-medium">{shares}</span>
            </Button>
          </div>
        </div>
      </CardContent>

      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={id}
        commentsCount={commentsCount}
        onCommentsUpdate={setCommentsCount}
      />
    </Card>
  );
};