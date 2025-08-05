-- ===============================================
-- VERIFICAR ESTRUTURA DA TABELA ROTINAS
-- ===============================================

-- 1. Estrutura da tabela rotinas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rotinas' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela rotinas existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'rotinas'
);

-- 3. Ver todas as tabelas disponíveis
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;