import React, { useState } from 'react'
import { School, User, Settings, ExternalLink, Copy, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function SetupTestSchool() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const setupTestSchool = async () => {
    try {
      setLoading(true)
      setResult(null)

      console.log('🏫 Configurando escola de teste...')

      // 1. Primeiro, verificar colunas disponíveis na tabela
      console.log('🔧 Verificando colunas disponíveis...')
      
      // Testar quais colunas existem fazendo uma query simples
      let availableColumns = ['nome'] // sempre existe
      const testColumns = ['id', 'slug', 'endereco', 'telefone', 'email', 'cnpj', 'responsavel_nome', 'responsavel_email', 'mensagem_login', 'ativo']
      
      for (const col of testColumns) {
        try {
          await supabase.from('escolas').select(col).limit(1)
          availableColumns.push(col)
        } catch (error) {
          console.log(`Coluna ${col} não existe`)
        }
      }
      
      console.log('Colunas disponíveis:', availableColumns)

      // 2. Criar dados da escola apenas com colunas disponíveis
      const baseSchoolData = {
        nome: 'Escola Teste Leon'
      }
      
      // Adicionar campos opcionais se as colunas existirem
      if (availableColumns.includes('slug')) baseSchoolData.slug = 'escola-teste-leon'
      if (availableColumns.includes('endereco')) baseSchoolData.endereco = 'Rua de Teste, 123 - Centro, São Paulo - SP'
      if (availableColumns.includes('telefone')) baseSchoolData.telefone = '(11) 98765-4321'
      if (availableColumns.includes('email')) baseSchoolData.email = 'contato@escola-teste-leon.com.br'
      if (availableColumns.includes('cnpj')) baseSchoolData.cnpj = '12.345.678/0001-90'
      if (availableColumns.includes('responsavel_nome')) baseSchoolData.responsavel_nome = 'Leon Hatori'
      if (availableColumns.includes('responsavel_email')) baseSchoolData.responsavel_email = 'leonhatori@gmail.com'
      if (availableColumns.includes('mensagem_login')) baseSchoolData.mensagem_login = 'Bem-vindo à Escola Teste Leon! Esta é uma escola criada para testes e desenvolvimento.'
      if (availableColumns.includes('ativo')) baseSchoolData.ativo = true
      
      const schoolData = baseSchoolData

      // Verificar se escola já existe
      let existingSchool = null
      
      if (availableColumns.includes('slug')) {
        // Tentar encontrar por slug se a coluna existir
        try {
          const { data } = await supabase
            .from('escolas')
            .select('id, slug')
            .eq('slug', 'escola-teste-leon')
            .single()
          existingSchool = data
        } catch (error) {
          console.log('Escola não encontrada por slug')
        }
      }
      
      if (!existingSchool) {
        // Tentar por nome
        try {
          const { data } = await supabase
            .from('escolas')
            .select('id, nome')
            .eq('nome', 'Escola Teste Leon')
            .single()
          existingSchool = data
        } catch (error) {
          console.log('Escola não existe, será criada')
        }
      }

      let escola_id

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
      } else {
        console.log('🆕 Criando nova escola...')
        const { data, error } = await supabase
          .from('escolas')
          .insert([schoolData])
          .select('id')
          .single()

        if (error) throw error
        escola_id = data.id
      }

      // 2. Atualizar perfil do usuário
      if (user) {
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

        if (profileError) throw profileError
      }

      // 3. Criar configurações da escola
      const configData = {
        escola_id: escola_id,
        tema_cor: '#10B981', // Verde
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

      if (configError) throw configError

      // 4. Resultado final
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
      console.log('📍 URL local:', localUrl)

    } catch (error) {
      console.error('❌ Erro ao configurar escola:', error)
      setResult({
        success: false,
        error: error.message
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

        {/* Setup Button */}
        <div className="text-center">
          <button
            onClick={setupTestSchool}
            disabled={loading || !user}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
          >
            <Settings className="w-5 h-5" />
            {loading ? 'Configurando...' : 'Configurar Escola de Teste'}
          </button>
          
          {!user && (
            <p className="text-sm text-red-600 mt-2">
              Você precisa estar logado para configurar a escola
            </p>
          )}
        </div>

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

                {/* School Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informações da Escola:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><strong>Nome:</strong> {result.schoolData.nome}</div>
                    <div><strong>Slug:</strong> {result.schoolData.slug}</div>
                    <div><strong>Email:</strong> {result.schoolData.email}</div>
                    <div><strong>Responsável:</strong> {result.schoolData.responsavel_nome}</div>
                  </div>
                </div>

                {/* URLs */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">URLs de Acesso:</h4>
                  
                  {/* Local URL */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">URL Local (Development)</h5>
                        <p className="text-blue-700 font-mono text-sm">{result.localUrl}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyUrl(result.localUrl)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Copiar URL"
                        >
                          {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={result.localUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Abrir escola"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Production URL */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-green-900 mb-1">URL Produção</h5>
                        <p className="text-green-700 font-mono text-sm">{result.prodUrl}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyUrl(result.prodUrl)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Copiar URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-900 mb-2">Como testar:</h5>
                  <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                    <li>Clique na URL local acima para acessar a escola</li>
                    <li>Faça login com seu email: leonhatori@gmail.com</li>
                    <li>Teste as funcionalidades de aluno e professor</li>
                    <li>Use o painel de administração da escola</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Erro na Configuração</h3>
                <p className="text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}