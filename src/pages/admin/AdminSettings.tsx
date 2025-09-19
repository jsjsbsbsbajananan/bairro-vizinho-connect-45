import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SiteSetting {
  setting_key: string;
  setting_value: string;
}

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "",
    site_description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsObj = data?.reduce((acc: any, item: SiteSetting) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {}) || {};

      setSettings({
        site_name: settingsObj.site_name || "",
        site_description: settingsObj.site_description || ""
      });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Atualizar nome do site
      await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'site_name',
          setting_value: settings.site_name
        }, { onConflict: 'setting_key' });

      // Atualizar descrição do site
      await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'site_description',
          setting_value: settings.site_description
        }, { onConflict: 'setting_key' });

      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Configure as informações gerais do site
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Configurações Gerais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nome do Site</Label>
              <Input
                id="site_name"
                placeholder="Ex: CidadãoAtivo"
                value={settings.site_name}
                onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">Descrição do Site</Label>
              <Textarea
                id="site_description"
                placeholder="Ex: Plataforma de reclamações da comunidade"
                rows={3}
                value={settings.site_description}
                onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                disabled={loading}
              />
            </div>

            <Button 
              onClick={saveSettings}
              disabled={saving || loading}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Informações do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Versão:</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm font-medium text-green-500">Online</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Banco de dados:</span>
                <span className="text-sm font-medium text-green-500">Conectado</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage:</span>
                <span className="text-sm font-medium text-green-500">Ativo</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Estatísticas Rápidas</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Backup automático configurado</p>
                <p>• RLS ativado para segurança</p>
                <p>• Upload de imagens habilitado</p>
                <p>• Sistema de comentários ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview das configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Preview das Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold mb-1">
              {settings.site_name || "Nome do Site"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {settings.site_description || "Descrição do site"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Assim aparecerá o nome e descrição do seu site
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;