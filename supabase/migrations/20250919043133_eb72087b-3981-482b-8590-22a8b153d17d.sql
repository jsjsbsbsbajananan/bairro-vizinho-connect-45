-- Adicionar foreign keys para melhorar as relações e corrigir dados de perfil

-- Primeiro, vamos criar avatars padrão para usuários que não têm
UPDATE profiles 
SET avatar_url = CASE 
  WHEN avatar_url IS NULL THEN 'https://ui-avatars.com/api/?name=' || REPLACE(display_name, ' ', '+') || '&background=6366f1&color=fff'
  ELSE avatar_url 
END;

-- Adicionar foreign keys nas tabelas
ALTER TABLE posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE likes 
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE likes 
ADD CONSTRAINT likes_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE reposts 
ADD CONSTRAINT reposts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE reposts 
ADD CONSTRAINT reposts_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;