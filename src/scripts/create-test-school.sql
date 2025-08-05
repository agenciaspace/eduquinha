-- Script para criar escola de teste e configurar perfil
-- Execute este script no console SQL do Supabase

-- 1. Criar tabela de escolas se não existir
CREATE TABLE IF NOT EXISTS escolas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    cnpj TEXT,
    responsavel_nome TEXT,
    responsavel_email TEXT,
    logo_url TEXT,
    mensagem_login TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Criar tabela de configurações da escola se não existir
CREATE TABLE IF NOT EXISTS configuracoes_escola (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
    tema_cor TEXT DEFAULT '#3B82F6',
    permite_cadastro_aluno BOOLEAN DEFAULT true,
    permite_cadastro_professor BOOLEAN DEFAULT true,
    aprovacao_automatica_professor BOOLEAN DEFAULT false,
    horario_funcionamento JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Atualizar tabela profiles para incluir escola_id se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS escola_id UUID REFERENCES escolas(id);

-- 4. Criar escola de teste
INSERT INTO escolas (
    nome,
    slug,
    endereco,
    telefone,
    email,
    cnpj,
    responsavel_nome,
    responsavel_email,
    mensagem_login,
    ativo
) VALUES (
    'Escola Teste Leon',
    'escola-teste-leon',
    'Rua de Teste, 123 - Centro, São Paulo - SP',
    '(11) 98765-4321',
    'contato@escola-teste-leon.com.br',
    '12.345.678/0001-90',
    'Leon Hatori',
    'leonhatori@gmail.com',
    'Bem-vindo à Escola Teste Leon! Esta é uma escola criada para testes e desenvolvimento.',
    true
) ON CONFLICT (slug) DO UPDATE SET
    nome = EXCLUDED.nome,
    endereco = EXCLUDED.endereco,
    telefone = EXCLUDED.telefone,
    email = EXCLUDED.email,
    responsavel_nome = EXCLUDED.responsavel_nome,
    responsavel_email = EXCLUDED.responsavel_email,
    mensagem_login = EXCLUDED.mensagem_login,
    updated_at = now();

-- 5. Obter o ID da escola criada
DO $$
DECLARE
    escola_test_id UUID;
    user_profile_id UUID;
BEGIN
    -- Buscar ID da escola
    SELECT id INTO escola_test_id FROM escolas WHERE slug = 'escola-teste-leon';
    
    -- Buscar ID do perfil do usuário leonhatori@gmail.com
    SELECT id INTO user_profile_id FROM profiles WHERE email = 'leonhatori@gmail.com';
    
    -- Se o perfil não existir, criar um
    IF user_profile_id IS NULL THEN
        -- Primeiro, buscar o user_id do auth.users
        SELECT id INTO user_profile_id FROM auth.users WHERE email = 'leonhatori@gmail.com';
        
        IF user_profile_id IS NOT NULL THEN
            INSERT INTO profiles (
                id,
                email,
                nome,
                role,
                escola_id,
                ativo
            ) VALUES (
                user_profile_id,
                'leonhatori@gmail.com',
                'Leon Hatori',
                'admin',
                escola_test_id,
                true
            ) ON CONFLICT (id) DO UPDATE SET
                escola_id = escola_test_id,
                role = 'admin',
                updated_at = now();
        END IF;
    ELSE
        -- Atualizar perfil existente
        UPDATE profiles 
        SET 
            escola_id = escola_test_id,
            role = 'admin',
            updated_at = now()
        WHERE id = user_profile_id;
    END IF;
    
    -- Criar configurações para a escola
    INSERT INTO configuracoes_escola (
        escola_id,
        tema_cor,
        permite_cadastro_aluno,
        permite_cadastro_professor,
        aprovacao_automatica_professor
    ) VALUES (
        escola_test_id,
        '#10B981',  -- Verde
        true,
        true,
        false
    ) ON CONFLICT (escola_id) DO UPDATE SET
        tema_cor = EXCLUDED.tema_cor,
        permite_cadastro_aluno = EXCLUDED.permite_cadastro_aluno,
        permite_cadastro_professor = EXCLUDED.permite_cadastro_professor,
        aprovacao_automatica_professor = EXCLUDED.aprovacao_automatica_professor,
        updated_at = now();
        
END $$;

-- 6. Mostrar informações da escola criada
SELECT 
    e.nome,
    e.slug,
    e.endereco,
    e.responsavel_nome,
    e.responsavel_email,
    CASE 
        WHEN '%%HOSTNAME%%' LIKE '%localhost%' THEN 
            CONCAT('http://localhost:5173?escola=', e.slug)
        ELSE 
            CONCAT('https://', e.slug, '.eduquinha.com.br')
    END as url_escola
FROM escolas e 
WHERE e.slug = 'escola-teste-leon';

-- 7. Mostrar perfil atualizado
SELECT 
    p.nome,
    p.email,
    p.role,
    e.nome as escola_nome,
    e.slug as escola_slug
FROM profiles p
LEFT JOIN escolas e ON p.escola_id = e.id
WHERE p.email = 'leonhatori@gmail.com';