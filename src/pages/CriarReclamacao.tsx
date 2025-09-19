import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthRequired } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const categorias = [
  { value: "buraco", label: "Buraco na Rua", color: "category-buraco" },
  { value: "iluminacao", label: "Iluminação", color: "category-iluminacao" },
  { value: "lixo", label: "Lixo", color: "category-lixo" },
  { value: "saude", label: "Saúde", color: "category-saude" },
  { value: "seguranca", label: "Segurança", color: "category-seguranca" },
  { value: "transporte", label: "Transporte", color: "category-transporte" },
];

const CriarReclamacao = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    image: ""
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthRequired();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('posts')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image: data.publicUrl }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validação básica
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para publicar sua reclamação.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          image_url: formData.image || null
        });

      if (error) throw error;

      toast({
        title: "Reclamação publicada!",
        description: "Sua reclamação foi adicionada ao feed e outros cidadãos podem interagir.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao publicar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

  return (
    <div className="p-4">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-primary" />
            <span>Nova Reclamação</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ajude a melhorar sua cidade relatando problemas
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto */}
            <div className="space-y-2">
              <Label>Foto do problema</Label>
              {formData.image ? (
                <div className="relative">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Enviando..." : "Toque para adicionar uma foto"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Recomendado para melhor visibilidade)
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

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título da reclamação</Label>
              <Input
                id="title"
                placeholder="Ex: Buraco grande na rua..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição detalhada</Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema, quando começou, como afeta os moradores..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.value} value={categoria.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-${categoria.color}`} />
                        <span>{categoria.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  className="pl-10"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Botão de envio */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary"
              disabled={submitting || uploading}
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Publicando..." : "Publicar Reclamação"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="mt-4 bg-secondary/50">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-2">💡 Dicas para uma boa reclamação:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Seja específico na descrição</li>
            <li>• Adicione uma foto clara do problema</li>
            <li>• Informe a localização exata</li>
            <li>• Escolha a categoria correta</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CriarReclamacao;