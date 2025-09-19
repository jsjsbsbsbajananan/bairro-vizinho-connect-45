import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
    neighborhood: string;
  } | null;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  commentsCount: number;
  onCommentsUpdate?: (newCount: number) => void;
}

export const CommentsModal = ({ isOpen, onClose, postId, commentsCount, onCommentsUpdate }: CommentsModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Buscar os perfis dos usuários separadamente
      if (data && data.length > 0) {
        const userIds = data.map(comment => comment.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, neighborhood')
          .in('user_id', userIds);

        const commentsWithProfiles = data.map(comment => {
          const profile = profiles?.find(p => p.user_id === comment.user_id);
          return {
            ...comment,
            profiles: profile || {
              display_name: "Usuário",
              avatar_url: null,
              neighborhood: "Local"
            }
          };
        });

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para comentar",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      await fetchComments();
      
      // Update comments count
      if (onCommentsUpdate) {
        onCommentsUpdate(comments.length + 1);
      }

      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Comentários ({comments.length})</span>
          </DialogTitle>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Carregando comentários...
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    {comment.profiles?.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium">
                        {comment.profiles?.display_name || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ainda não há comentários.</p>
              <p className="text-xs">Seja o primeiro a comentar!</p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        {user && (
          <form onSubmit={handleSubmitComment} className="flex space-x-2 pt-4 border-t">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.user_metadata?.display_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 flex space-x-2">
              <Input
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={submitting || !newComment.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {!user && (
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Faça login para comentar
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};