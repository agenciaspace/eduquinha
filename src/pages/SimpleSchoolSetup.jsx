import React, { useState } from 'react'
import { School, User, Settings, ExternalLink, Copy, Check, X, AlertCircle, Database } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { setupDatabaseDirect } from '../utils/setup-database'

export default function SimpleSchoolSetup() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [dbSetupResult, setDbSetupResult] = useState(null)

  const setupDatabase = async () => {
    try {
      setLoading(true)
      console.log('🔧 Configurando estrutura do banco...')
      const result = await setupDatabaseDirect()
      setDbSetupResult(result)
      return result
    } catch (error) {
      const errorResult = { success: false, error: error.message }
      setDbSetupResult(errorResult)
      return errorResult
    } finally {
      setLoading(false)
    }
  }

  const setupTestSchool = async () => {
    try {
      setLoading(true)
      setResult(null)

      console.log('🏫 Configurando escola de teste...')

      // 1. Dados básicos da escola
      const schoolData = {
        nome: 'Escola Teste Leon',
        slug: 'escola-teste-leon',
        endereco: 'Rua de Teste, 123 - Centro, São Paulo - SP',
        telefone: '(11) 98765-4321',
        email: 'contato@escola-teste-leon.com.br',
        cnpj: '12.345.678/0001-90',
        responsavel_nome: 'Leon Hatori',
        responsavel_email: 'leonhatori@gmail.com',
        mensagem_login: 'Bem-vindo à Escola Teste Leon! Esta é uma escola criada para testes e desenvolvimento.',
        ativo: true
      }

      // 2. Verificar se escola já existe
      let escola_id
      const { data: existingSchool, error: findError } = await supabase
        .from('escolas')
        .select('id')
        .eq('nome', 'Escola Teste Leon')
        .maybeSingle()

      if (existingSchool) {
        console.log('📝 Escola já existe, atualizando...')
        const { data, error } = await supabase
          .from('escolas')
          .update(schoolData)
          .eq('id', existingSchool.id)
          .select('id')
          .single()

        if (error) throw error
        escola_id = data.id
        console.log('✅ Escola atualizada!')
      } else {
        console.log('🆕 Criando nova escola...')
        const { data, error } = await supabase
          .from('escolas')
          .insert([schoolData])
          .select('id')
          .single()

        if (error) throw error
        escola_id = data.id
        console.log('✅ Escola criada!')
      }

      // 3. Atualizar perfil do usuário se estiver logado
      if (user) {
        console.log('👤 Atualizando perfil do usuário...')
        
        const profileData = {
          id: user.id,
          email: user.email,
          nome: 'Leon Hatori',
          role: 'admin',
          escola_id: escola_id,
          ativo: true
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([profileData])

        if (profileError) {
          console.warn('Aviso ao atualizar perfil:', profileError.message)
        } else {
          console.log('✅ Perfil atualizado!')
        }
      }

      // 4. Criar configurações da escola
      console.log('⚙️ Criando configurações da escola...')
      
      const configData = {
        escola_id: escola_id,
        tema_cor: '#10B981',
        permite_cadastro_aluno: true,
        permite_cadastro_professor: true,
        aprovacao_automatica_professor: false,
        horario_funcionamento: {
          segunda: { inicio: '07:00', fim: '17:00' },
          terca: { inicio: '07:00', fim: '17:00' },
          quarta: { inicio: '07:00', fim: '17:00' },
          quinta: { inicio: '07:00', fim: '17:00' },
          sexta: { inicio: '07:00', fim: '17:00' }
        }
      }

      const { error: configError } = await supabase
        .from('configuracoes_escola')
        .upsert([configData], { onConflict: 'escola_id' })

      if (configError) {
        console.warn('Aviso ao criar configurações:', configError.message)
      } else {
        console.log('✅ Configurações criadas!')
      }

      // 5. URLs finais
      const localUrl = `http://localhost:5173?escola=escola-teste-leon`
      const prodUrl = `https://escola-teste-leon.eduquinha.com.br`

      setResult({
        success: true,
        escola_id: escola_id,
        localUrl: localUrl,
        prodUrl: prodUrl,
        schoolData: schoolData
      })

      console.log('🎉 Configuração concluída!')

    } catch (error) {
      console.error('❌ Erro ao configurar escola:', error)
      setResult({
        success: false,
        error: error.message,
        details: error
      })
    } finally {
      setLoading(false)
    }
  }

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (error) {
      console.error('Error copying URL:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurar Escola de Teste</h1>
          <p className="text-lg text-gray-600">
            Crie uma escola de teste para development local
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Primeiro Execute o SQL</h3>
              <p className="text-yellow-800 text-sm mb-3">
                Antes de usar este botão, execute o arquivo <code className="bg-yellow-100 px-2 py-1 rounded">simple-school-setup.sql</code> no console SQL do Supabase para criar as colunas necessárias.
              </p>
              <p className="text-yellow-700 text-xs">
                Arquivo localizado em: <code>/src/scripts/simple-school-setup.sql</code>
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Usuário Atual</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Setup Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={setupDatabase}
              disabled={loading || !user}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Database className="w-5 h-5" />
              {loading ? 'Configurando...' : '1. Configurar Banco'}
            </button>
            
            <button
              onClick={setupTestSchool}
              disabled={loading || !user || (dbSetupResult && !dbSetupResult.success)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              {loading ? 'Configurando...' : '2. Criar Escola'}
            </button>
          </div>
          
          {!user && (
            <p className="text-sm text-red-600 mt-2">
              Você precisa estar logado para configurar a escola
            </p>
          )}
          
          <p className="text-sm text-gray-600">
            Execute primeiro "Configurar Banco", depois "Criar Escola"
          </p>
        </div>

        {/* Database Setup Result */}
        {dbSetupResult && (
          <div className={`bg-white rounded-xl p-4 shadow-sm border ${
            dbSetupResult.success ? 'border-green-200' : 'border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              <Database className={`w-5 h-5 ${
                dbSetupResult.success ? 'text-green-600' : 'text-yellow-600'
              }`} />
              <div>
                <h4 className={`font-medium ${
                  dbSetupResult.success ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  Configuração do Banco
                </h4>
                <p className={`text-sm ${
                  dbSetupResult.success ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {dbSetupResult.success 
                    ? '✅ Banco configurado com sucesso! Agora você pode criar a escola.'
                    : `⚠️ ${dbSetupResult.error || 'Erro na configuração do banco'}`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`bg-white rounded-xl p-6 shadow-sm border ${
            result.success ? 'border-green-200' : 'border-red-200'
          }`}>
            {result.success ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Escola Configurada com Sucesso!
                  </h3>
                </div>

                {/* URLs */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">🔗 Acesse sua escola:</h4>
                  
                  {/* Local URL */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">URL Local (Use esta para testar)</h5>
                        <p className="text-blue-700 font-mono text-sm break-all">{result.localUrl}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => copyUrl(result.localUrl)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                          title="Copiar URL"
                        >
                          {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={result.localUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                          title="Abrir escola"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">✅ Próximos passos:</h5>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Clique no link azul acima para acessar a escola</li>
                    <li>Faça login com: <strong>leonhatori@gmail.com</strong></li>
                    <li>Você será automaticamente admin da escola</li>
                    <li>Teste os cadastros de alunos e professores</li>
                    <li>Explore as diferentes interfaces por perfil</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Erro na Configuração</h3>
                <p className="text-red-700 mb-4">{result.error}</p>
                
                <div className="bg-red-50 rounded-lg p-4 text-left">
                  <h5 className="font-medium text-red-900 mb-2">Possíveis soluções:</h5>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Execute primeiro o arquivo SQL: <code>simple-school-setup.sql</code></li>
                    <li>Verifique se você tem permissões no Supabase</li>
                    <li>Verifique se a conexão com o banco está funcionando</li>
                    <li>Tente fazer logout e login novamente</li>
                  </ul>
                </div>
                
                {process.env.NODE_ENV === 'development' && result.details && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                      Ver detalhes do erro (desenvolvimento)
                    </summary>
                    <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto text-red-900">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}