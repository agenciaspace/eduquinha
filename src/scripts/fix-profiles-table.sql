-- Execute este script no console SQL do Supabase para corrigir a tabela profiles

-- 1. Verificar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Aplicar o trigger na tabela profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar se existem outros triggers problemáticos
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 6. Criar um perfil de teste para leonhatori@gmail.com
DO $$
DECLARE
    user_uuid UUID;
    escola_uuid UUID;
BEGIN
    -- Buscar o UUID do usuário na tabela auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'leonhatori@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        RAISE NOTICE 'Usuário encontrado: %', user_uuid;
        
        -- Buscar a escola teste
        SELECT id INTO escola_uuid 
        FROM escolas 
        WHERE slug = 'escola-teste-leon' 
        LIMIT 1;
        
        IF escola_uuid IS NOT NULL THEN
            RAISE NOTICE 'Escola encontrada: %', escola_uuid;
        END IF;
        
        -- Inserir/atualizar perfil
        INSERT INTO profiles (
            id,
            email,
            nome,
            role,
            escola_id,
            ativo,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
            'leonhatori@gmail.com',
            'Leon Hatori',
            'admin',
            escola_uuid,
            true,
            now(),
            now()
        ) 
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            nome = EXCLUDED.nome,
            role = EXCLUDED.role,
            escola_id = EXCLUDED.escola_id,
            ativo = EXCLUDED.ativo,
            updated_at = now();
            
        RAISE NOTICE 'Perfil criado/atualizado com sucesso!';
    ELSE
        RAISE NOTICE 'Usuário leonhatori@gmail.com não encontrado na tabela auth.users';
    END IF;
END $$;

-- 7. Verificar resultado
SELECT 
    p.id,
    p.email,
    p.nome,
    p.role,
    p.ativo,
    e.nome as escola_nome,
    p.created_at,
    p.updated_at
FROM profiles p
LEFT JOIN escolas e ON p.escola_id = e.id
WHERE p.email = 'leonhatori@gmail.com';