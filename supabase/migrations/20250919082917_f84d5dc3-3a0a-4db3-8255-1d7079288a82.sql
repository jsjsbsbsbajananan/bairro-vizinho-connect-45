-- Criar trigger para atualizar updated_at em banners
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas configurações padrão do site
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('site_name', 'CidadãoAtivo'),
('site_description', 'Plataforma de reclamações da comunidade')
ON CONFLICT (setting_key) DO NOTHING;

-- Inserir admin padrão
INSERT INTO public.admins (username, password_hash) VALUES 
('gustavo455', '$2b$10$8K1p0t0.LzTixyb.0o.CqO9gQyMx1o9K1p0t0.LzTixyb.0o.CqO9g')
ON CONFLICT (username) DO NOTHING;