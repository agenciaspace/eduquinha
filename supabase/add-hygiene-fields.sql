-- ===============================================
-- ADICIONAR CAMPOS DE HIGIENE À TABELA ROTINAS
-- ===============================================

-- Primeiro, vamos verificar a estrutura atual
\echo 'Verificando estrutura atual da tabela rotinas...'

-- Adicionar colunas de higiene/fraldas/banheiro à tabela rotinas
ALTER TABLE rotinas 
ADD COLUMN IF NOT EXISTS trocas_fraldas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fraldas_xixi INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fraldas_coco INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS horarios_fraldas TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS idas_banheiro INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xixi_banheiro INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coco_banheiro INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS acidentes_xixi INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS acidentes_coco INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS horarios_banheiro TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS escovacao_dentes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lavagem_maos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS banho_dado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS troca_roupas BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS observacoes_higiene TEXT DEFAULT '';

-- Verificar as novas colunas
\echo 'Verificando colunas adicionadas...'
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'rotinas' AND table_schema = 'public'
AND column_name IN (
  'trocas_fraldas', 'fraldas_xixi', 'fraldas_coco', 
  'idas_banheiro', 'xixi_banheiro', 'coco_banheiro',
  'acidentes_xixi', 'acidentes_coco', 'escovacao_dentes',
  'lavagem_maos', 'banho_dado', 'troca_roupas', 'observacoes_higiene'
)
ORDER BY ordinal_position;