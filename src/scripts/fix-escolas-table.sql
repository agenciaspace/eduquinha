-- Script para corrigir a tabela escolas e adicionar colunas necessárias
-- Execute este script no console SQL do Supabase

-- 1. Verificar estrutura atual da tabela escolas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'escolas' 
ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS endereco TEXT;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS telefone TEXT;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS cnpj TEXT;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS responsavel_nome TEXT;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS responsavel_email TEXT;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS mensagem_login TEXT;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE escolas 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Criar tabela de configurações da escola se não existir
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

-- 4. Atualizar tabela profiles para incluir escola_id se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS escola_id UUID REFERENCES escolas(id);

-- 5. Criar escola de teste (usando UPSERT seguro)
DO $$
DECLARE
    escola_test_id UUID;
    user_profile_id UUID;
BEGIN
    -- Inserir ou atualizar escola
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
    ) 
    ON CONFLICT (slug) DO UPDATE SET
        nome = EXCLUDED.nome,
        endereco = EXCLUDED.endereco,
        telefone = EXCLUDED.telefone,
        email = EXCLUDED.email,
        responsavel_nome = EXCLUDED.responsavel_nome,
        responsavel_email = EXCLUDED.responsavel_email,
        mensagem_login = EXCLUDED.mensagem_login,
        updated_at = now()
    RETURNING id INTO escola_test_id;
    
    -- Se não retornou ID (caso de update), buscar o ID
    IF escola_test_id IS NULL THEN
        SELECT id INTO escola_test_id FROM escolas WHERE slug = 'escola-teste-leon';
    END IF;
    
    -- Buscar perfil do usuário leonhatori@gmail.com
    SELECT auth_user.id INTO user_profile_id 
    FROM auth.users auth_user 
    WHERE auth_user.email = 'leonhatori@gmail.com';
    
    -- Se encontrou o usuário, criar/atualizar perfil
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
        ) 
        ON CONFLICT (id) DO UPDATE SET
            escola_id = escola_test_id,
            role = 'admin',
            nome = EXCLUDED.nome,
            updated_at = now();
            
        RAISE NOTICE 'Perfil do usuário atualizado com sucesso';
    ELSE
        RAISE NOTICE 'Usuário leonhatori@gmail.com não encontrado na tabela auth.users';
    END IF;
    
    -- Criar configurações para a escola
    INSERT INTO configuracoes_escola (
        escola_id,
        tema_cor,
        permite_cadastro_aluno,
        permite_cadastro_professor,
        aprovacao_automatica_professor,
        horario_funcionamento
    ) VALUES (
        escola_test_id,
        '#10B981',  -- Verde
        true,
        true,
        false,
        '{"segunda": {"inicio": "07:00", "fim": "17:00"}, "terca": {"inicio": "07:00", "fim": "17:00"}, "quarta": {"inicio": "07:00", "fim": "17:00"}, "quinta": {"inicio": "07:00", "fim": "17:00"}, "sexta": {"inicio": "07:00", "fim": "17:00"}}'::jsonb
    ) 
    ON CONFLICT (escola_id) DO UPDATE SET
        tema_cor = EXCLUDED.tema_cor,
        permite_cadastro_aluno = EXCLUDED.permite_cadastro_aluno,
        permite_cadastro_professor = EXCLUDED.permite_cadastro_professor,
        aprovacao_automatica_professor = EXCLUDED.aprovacao_automatica_professor,
        horario_funcionamento = EXCLUDED.horario_funcionamento,
        updated_at = now();
        
    RAISE NOTICE 'Escola criada/atualizada com ID: %', escola_test_id;
        
END $$;

-- 6. Verificar resultado
SELECT 
    e.id,
    e.nome,
    e.slug,
    e.endereco,
    e.responsavel_nome,
    e.responsavel_email,
    e.ativo,
    CASE 
        WHEN current_setting('server_version_num')::int >= 120000 THEN 
            'http://localhost:5173?escola=' || e.slug
        ELSE 
            'http://localhost:5173?escola=' || e.slug
    END as url_local
FROM escolas e 
WHERE e.slug = 'escola-teste-leon';

-- 7. Verificar perfil
SELECT 
    p.id,
    p.nome,
    p.email,
    p.role,
    e.nome as escola_nome,
    e.slug as escola_slug
FROM profiles p
LEFT JOIN escolas e ON p.escola_id = e.id
WHERE p.email = 'leonhatori@gmail.com';