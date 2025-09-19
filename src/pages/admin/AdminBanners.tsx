import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  Upload,
  AlertTriangle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface Banner {
  id: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  order_position: number;
  created_at: string;
}

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    image_url: "",
    link_url: "",
    is_active: true
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Erro ao buscar banners:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar banners",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('posts')
        .upload(`banners/${fileName}`, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(`banners/${fileName}`);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const saveBanner = async () => {
    if (!formData.image_url || !formData.link_url) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update({
            image_url: formData.image_url,
            link_url: formData.link_url,
            is_active: formData.is_active
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast({
          title: "Banner atualizado",
          description: "Banner atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('banners')
          .insert({
            image_url: formData.image_url,
            link_url: formData.link_url,
            is_active: formData.is_active,
            order_position: banners.length
          });

        if (error) throw error;
        toast({
          title: "Banner criado",
          description: "Banner criado com sucesso",
        });
      }

      setFormData({ image_url: "", link_url: "", is_active: true });
      setEditingBanner(null);
      fetchBanners();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteBanner = async (bannerId: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;

      setBanners(banners.filter(banner => banner.id !== bannerId));
      toast({
        title: "Banner deletado",
        description: "Banner removido com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao deletar banner",
        variant: "destructive"
      });
    }
  };

  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', bannerId);

      if (error) throw error;

      setBanners(banners.map(banner => 
        banner.id === bannerId 
          ? { ...banner, is_active: !currentStatus }
          : banner
      ));

      toast({
        title: "Status atualizado",
        description: `Banner ${!currentStatus ? 'ativado' : 'desativado'}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive"
      });
    }
  };

  const editBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url,
      link_url: banner.link_url,
      is_active: banner.is_active
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banners</h2>
          <p className="text-muted-foreground">
            Gerencie os banners de divulgação do site
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Novo Banner</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </DialogTitle>
              <DialogDescription>
                Adicione um novo banner de divulgação para o site
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Imagem do Banner</Label>
                {formData.image_url ? (
                  <div className="relative">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {uploading ? "Enviando..." : "Clique para enviar uma imagem"}
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">Link de destino</Label>
                <Input
                  id="link_url"
                  placeholder="https://exemplo.com"
                  value={formData.link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Banner ativo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={saveBanner}
                disabled={uploading || !formData.image_url || !formData.link_url}
              >
                {editingBanner ? 'Atualizar' : 'Criar'} Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5" />
            <span>Lista de Banners</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando banners...
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div 
                  key={banner.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-12 rounded overflow-hidden">
                      <img 
                        src={banner.image_url} 
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm truncate max-w-xs">
                        {banner.link_url}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado em {new Date(banner.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                    >
                      {banner.is_active ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editBanner(banner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Editar Banner</DialogTitle>
                        </DialogHeader>
                        
                        {/* Mesmo conteúdo do form de criação */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Imagem do Banner</Label>
                            {formData.image_url ? (
                              <div className="relative">
                                <img 
                                  src={formData.image_url} 
                                  alt="Preview" 
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                                >
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  {uploading ? "Enviando..." : "Clique para enviar uma imagem"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit_link_url">Link de destino</Label>
                            <Input
                              id="edit_link_url"
                              placeholder="https://exemplo.com"
                              value={formData.link_url}
                              onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="edit_is_active"
                              checked={formData.is_active}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                            />
                            <Label htmlFor="edit_is_active">Banner ativo</Label>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button 
                            onClick={saveBanner}
                            disabled={uploading || !formData.image_url || !formData.link_url}
                          >
                            Atualizar Banner
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <span>Deletar banner</span>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar este banner?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteBanner(banner.id)}
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {banners.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum banner encontrado
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBanners;