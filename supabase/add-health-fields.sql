-- ===============================================
-- ADICIONAR CAMPOS DE SAÚDE À TABELA ALUNOS
-- ===============================================

-- Adicionar colunas de saúde à tabela alunos
ALTER TABLE alunos 
ADD COLUMN IF NOT EXISTS medicamentos TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS condicoes_medicas TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS pediatra_nome TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS pediatra_telefone TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS plano_saude TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS numero_plano TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS observacoes_medicas TEXT DEFAULT '';

-- Adicionar colunas adicionais à tabela profiles para responsáveis
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS endereco TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS profissao TEXT DEFAULT '';

-- Adicionar coluna para identificar contato de emergência na tabela aluno_responsavel
ALTER TABLE aluno_responsavel
ADD COLUMN IF NOT EXISTS contato_emergencia BOOLEAN DEFAULT FALSE;

-- Verificar as novas colunas de saúde
\echo 'Verificando colunas de saúde adicionadas à tabela alunos...'
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'alunos' AND table_schema = 'public'
AND column_name IN (
  'medicamentos', 'condicoes_medicas', 'pediatra_nome', 
  'pediatra_telefone', 'plano_saude', 'numero_plano', 'observacoes_medicas'
)
ORDER BY ordinal_position;

-- Verificar as novas colunas de profiles
\echo 'Verificando colunas adicionadas à tabela profiles...'
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
AND column_name IN ('endereco', 'profissao')
ORDER BY ordinal_position;

-- Verificar a nova coluna de aluno_responsavel
\echo 'Verificando coluna adicionada à tabela aluno_responsavel...'
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'aluno_responsavel' AND table_schema = 'public'
AND column_name = 'contato_emergencia'
ORDER BY ordinal_position;