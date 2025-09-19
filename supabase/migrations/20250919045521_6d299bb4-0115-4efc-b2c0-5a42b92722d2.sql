-- Apenas atualizar avatars padrão para usuários sem foto
UPDATE profiles 
SET avatar_url = CASE 
  WHEN avatar_url IS NULL THEN 'https://ui-avatars.com/api/?name=' || REPLACE(display_name, ' ', '+') || '&background=6366f1&color=fff'
  ELSE avatar_url 
END;