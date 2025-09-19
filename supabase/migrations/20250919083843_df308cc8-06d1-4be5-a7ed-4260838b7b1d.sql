-- Inserir algumas configurações padrão do site
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('site_name', 'CidadãoAtivo'),
('site_description', 'Plataforma de reclamações da comunidade')
ON CONFLICT (setting_key) DO NOTHING;

-- Inserir admin padrão com hash real do bcrypt para a senha gustavo45@@
INSERT INTO public.admins (username, password_hash) VALUES 
('gustavo455', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;