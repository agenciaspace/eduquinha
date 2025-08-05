-- Execute este script PRIMEIRO no console SQL do Supabase
-- Ele vai adicionar as colunas necessárias à tabela existente

-- 1. Adicionar colunas necessárias à tabela escolas
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS responsavel_nome TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS responsavel_email TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS mensagem_login TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 2. Criar índice único para slug
CREATE UNIQUE INDEX IF NOT EXISTS escolas_slug_unique ON escolas(slug);

-- 3. Adicionar coluna escola_id à tabela profiles se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS escola_id UUID;

-- 4. Adicionar foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_escola 
FOREIGN KEY (escola_id) REFERENCES escolas(id) 
ON DELETE SET NULL;

-- 5. Criar tabela de configurações se não existir
CREATE TABLE IF NOT EXISTS configuracoes_escola (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
    tema_cor TEXT DEFAULT '#3B82F6',
    permite_cadastro_aluno BOOLEAN DEFAULT true,
    permite_cadastro_professor BOOLEAN DEFAULT true,
    aprovacao_automatica_professor BOOLEAN DEFAULT false,
    horario_funcionamento JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(escola_id)
);

-- Confirmar que as colunas foram criadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'escolas' 
ORDER BY ordinal_position;