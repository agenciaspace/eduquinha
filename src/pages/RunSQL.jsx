import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function RunSQL() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState('')

  const runSQL = async () => {
    setIsRunning(true)
    setResult('')

    try {
      console.log('🔧 Executando SQL para adicionar coluna auth_criado...')

      // Add missing columns to all tables
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          -- Add missing columns to profiles table
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primeiro_login BOOLEAN DEFAULT false;
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS senha_temporaria BOOLEAN DEFAULT false;
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_criado BOOLEAN DEFAULT false;
          
          -- Add missing columns to turmas table
          ALTER TABLE turmas ADD COLUMN IF NOT EXISTS periodo VARCHAR(20) DEFAULT 'integral';
          ALTER TABLE turmas ADD COLUMN IF NOT EXISTS capacidade INTEGER DEFAULT 20;
          ALTER TABLE turmas ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativa';
          
          -- Add missing columns to eventos table (if it exists, otherwise create it)
          CREATE TABLE IF NOT EXISTS eventos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT,
            data DATE NOT NULL,
            horario TIME,
            tipo VARCHAR(50) DEFAULT 'evento',
            local VARCHAR(255),
            criador_id UUID REFERENCES profiles(id),
            escola_id UUID REFERENCES escolas(id),
            status VARCHAR(20) DEFAULT 'agendado',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Add missing columns to comunicados table (if it exists, otherwise create it)
          CREATE TABLE IF NOT EXISTS comunicados (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            conteudo TEXT NOT NULL,
            tipo VARCHAR(50) DEFAULT 'geral',
            prioridade VARCHAR(20) DEFAULT 'normal',
            target_audience VARCHAR(50) DEFAULT 'todos',
            autor_id UUID REFERENCES profiles(id),
            escola_id UUID REFERENCES escolas(id),
            status VARCHAR(20) DEFAULT 'publicado',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Update existing records
          UPDATE profiles SET primeiro_login = false WHERE primeiro_login IS NULL;
          UPDATE profiles SET senha_temporaria = false WHERE senha_temporaria IS NULL;
          UPDATE profiles SET auth_criado = true WHERE auth_criado IS NULL;
          UPDATE turmas SET periodo = 'integral' WHERE periodo IS NULL;
          UPDATE turmas SET capacidade = 20 WHERE capacidade IS NULL;  
          UPDATE turmas SET status = 'ativa' WHERE status IS NULL;
          
          -- Fix alunos table columns
          ALTER TABLE alunos ADD COLUMN IF NOT EXISTS escola_id UUID REFERENCES escolas(id);
          ALTER TABLE alunos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
          ALTER TABLE alunos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
          
          -- Update alunos escola_id based on their turma
          UPDATE alunos a
          SET escola_id = t.escola_id
          FROM turmas t
          WHERE a.turma_id = t.id
          AND a.escola_id IS NULL;
          
          -- Update timestamps for existing records
          UPDATE alunos SET created_at = now() WHERE created_at IS NULL;
          UPDATE alunos SET updated_at = now() WHERE updated_at IS NULL;
        `
      })

      if (error) {
        throw error
      }

      setResult('✅ Todas as colunas e tabelas foram adicionadas com sucesso! Agora todas as funcionalidades administrativas devem funcionar completamente.')
      console.log('✅ SQL executado com sucesso')

    } catch (error) {
      console.error('❌ Erro ao executar SQL:', error)
      setResult(`❌ Erro: ${error.message}`)
      
      // Try alternative method using direct SQL
      try {
        console.log('🔧 Tentando método alternativo...')
        
        const { data, error: altError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)

        if (altError) {
          setResult(`❌ Erro alternativo: ${altError.message}`)
        } else {
          setResult('✅ Tabela acessível - coluna pode ser adicionada manualmente via SQL')
        }
      } catch (altError) {
        setResult(`❌ Erro alternativo: ${altError.message}`)
      }
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Executar SQL - Adicionar Colunas Necessárias</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">SQL a ser executado:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primeiro_login BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS senha_temporaria BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_criado BOOLEAN DEFAULT false;

-- Add missing columns to turmas table
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS periodo VARCHAR(20) DEFAULT 'integral';
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS capacidade INTEGER DEFAULT 20;
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativa';

-- Create eventos table if it doesn't exist
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  horario TIME,
  tipo VARCHAR(50) DEFAULT 'evento',
  local VARCHAR(255),
  criador_id UUID REFERENCES profiles(id),
  escola_id UUID REFERENCES escolas(id),
  status VARCHAR(20) DEFAULT 'agendado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comunicados table if it doesn't exist  
CREATE TABLE IF NOT EXISTS comunicados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'geral',
  prioridade VARCHAR(20) DEFAULT 'normal',
  target_audience VARCHAR(50) DEFAULT 'todos',
  autor_id UUID REFERENCES profiles(id),
  escola_id UUID REFERENCES escolas(id),
  status VARCHAR(20) DEFAULT 'publicado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update existing records
UPDATE profiles SET primeiro_login = false WHERE primeiro_login IS NULL;
UPDATE profiles SET senha_temporaria = false WHERE senha_temporaria IS NULL;
UPDATE profiles SET auth_criado = true WHERE auth_criado IS NULL;
UPDATE turmas SET periodo = 'integral' WHERE periodo IS NULL;
UPDATE turmas SET capacidade = 20 WHERE capacidade IS NULL;
UPDATE turmas SET status = 'ativa' WHERE status IS NULL;

-- Fix alunos table columns
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update timestamps for existing records
UPDATE alunos SET created_at = now() WHERE created_at IS NULL;
UPDATE alunos SET updated_at = now() WHERE updated_at IS NULL;`}
            </pre>
          </div>

          <button
            onClick={runSQL}
            disabled={isRunning}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Executando SQL...' : 'Executar SQL'}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Funcionalidades Desbloqueadas:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Professores:</strong> Mudança de senha obrigatória no primeiro login</li>
              <li>• <strong>Turmas:</strong> Período (manhã/tarde/integral) e capacidade máxima</li>
              <li>• <strong>Eventos:</strong> Horário, local, tipo e status</li>
              <li>• <strong>Comunicados:</strong> Prioridade, tipo e público-alvo</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Método Alternativo:</h3>
            <p className="text-yellow-700 text-sm">
              Se este método não funcionar, você pode executar o SQL diretamente no painel do Supabase:
              <br />
              Dashboard → SQL Editor → Execute o comando acima
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}