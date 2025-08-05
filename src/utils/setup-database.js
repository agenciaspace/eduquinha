import { supabase } from '../lib/supabase'

export const setupDatabase = async () => {
  const queries = [
    // 1. Adicionar colunas necessárias à tabela escolas
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS slug TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS endereco TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS telefone TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS email TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS cnpj TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS responsavel_nome TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS responsavel_email TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS logo_url TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS mensagem_login TEXT',
    'ALTER TABLE escolas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true',
    
    // 2. Criar índice único para slug
    'CREATE UNIQUE INDEX IF NOT EXISTS escolas_slug_unique ON escolas(slug)',
    
    // 3. Adicionar coluna escola_id à tabela profiles se não existir
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS escola_id UUID',
    
    // 4. Criar tabela de configurações se não existir
    `CREATE TABLE IF NOT EXISTS configuracoes_escola (
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
    )`
  ]
  
  const results = []
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i]
    console.log(`Executando query ${i + 1}/${queries.length}:`, query.substring(0, 50) + '...')
    
    try {
      // Para comandos DDL, usar rpc com uma função customizada ou fazer via REST API
      const { data, error } = await supabase.rpc('execute_sql', { query: query })
      
      if (error) {
        console.warn(`Query ${i + 1} com aviso:`, error.message)
        results.push({ query: i + 1, status: 'warning', message: error.message })
      } else {
        console.log(`Query ${i + 1} executada com sucesso`)
        results.push({ query: i + 1, status: 'success' })
      }
    } catch (error) {
      console.error(`Erro na query ${i + 1}:`, error)
      results.push({ query: i + 1, status: 'error', message: error.message })
    }
  }
  
  return results
}

// Função alternativa que tenta executar via query direta
export const setupDatabaseDirect = async () => {
  try {
    console.log('🔧 Tentando configurar banco de dados...')
    
    // Testar se as colunas já existem
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'escolas')
    
    if (columnsError) {
      console.log('Não foi possível verificar colunas, continuando...')
    } else {
      const existingColumns = columns.map(c => c.column_name)
      console.log('Colunas existentes na tabela escolas:', existingColumns)
    }
    
    // Tentar criar uma escola simples para verificar quais campos funcionam
    const testData = { nome: 'TESTE_TEMP_' + Date.now() }
    
    const { data, error } = await supabase
      .from('escolas')
      .insert([testData])
      .select('id')
      .single()
    
    if (data) {
      // Remover o teste
      await supabase.from('escolas').delete().eq('id', data.id)
      console.log('✅ Tabela escolas funciona corretamente')
      return { success: true, message: 'Tabela básica funciona' }
    }
    
    return { success: false, error: error?.message }
    
  } catch (error) {
    console.error('Erro ao configurar banco:', error)
    return { success: false, error: error.message }
  }
}