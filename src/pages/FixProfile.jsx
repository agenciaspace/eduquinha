import React, { useState, useEffect } from 'react'
import { User, Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function FixProfile() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [escolas, setEscolas] = useState([])

  useEffect(() => {
    if (user) {
      checkProfile()
      loadEscolas()
    }
  }, [user])

  const checkProfile = async () => {
    if (!user) return

    try {
      console.log('🔍 Checking profile for user:', user.id, user.email)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('🔍 Profile query result:', { data, error })
      setProfileData(data)

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  const loadEscolas = async () => {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('id, nome, slug')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      setEscolas(data || [])
    } catch (error) {
      console.error('Error loading escolas:', error)
    }
  }

  const createProfile = async (escolaId = null) => {
    if (!user) {
      setResult({ success: false, message: 'Usuário não logado' })
      return
    }

    try {
      setLoading(true)
      console.log('🛠️ Creating/updating profile for:', user.email)

      // First, let's check what columns exist in the profiles table
      const { data: tableInfo, error: tableError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      console.log('📋 Table structure check:', { tableInfo, tableError })

      // Create profile data with only basic required fields
      const profileData = {
        id: user.id,
        email: user.email,
        nome: user.user_metadata?.nome || user.email.split('@')[0] || 'Leon Hatori',
        role: 'admin',
        ativo: true
      }

      // Add escola_id if provided
      if (escolaId) {
        profileData.escola_id = escolaId
      }

      console.log('🛠️ Profile data to insert/update:', profileData)

      const { data, error } = await supabase
        .from('profiles')
        .upsert([profileData], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        console.error('🛠️ Error creating profile:', error)
        setResult({ 
          success: false, 
          message: `Erro ao criar perfil: ${error.message}` 
        })
      } else {
        console.log('🛠️ Profile created/updated successfully:', data)
        setResult({ 
          success: true, 
          message: 'Perfil criado/atualizado com sucesso!',
          data: data
        })
        
        // Refresh profile data
        await checkProfile()
        
        // Force auth context to refresh
        window.location.reload()
      }
    } catch (error) {
      console.error('🛠️ Unexpected error:', error)
      setResult({ 
        success: false, 
        message: `Erro inesperado: ${error.message}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteProfile = async () => {
    if (!user || !confirm('Tem certeza que deseja deletar o perfil?')) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) throw error
      
      setResult({ success: true, message: 'Perfil deletado com sucesso!' })
      await checkProfile()
    } catch (error) {
      setResult({ success: false, message: `Erro ao deletar: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Usuário não logado</h1>
          <p className="text-gray-600">Faça login para acessar esta página</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Corrigir Perfil</h1>
          <p className="text-lg text-gray-600">
            Diagnóstico e correção de problemas no perfil do usuário
          </p>
        </div>

        {/* Current User Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Informações do Usuário Atual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div><strong>User ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user.id}</code></div>
              <div><strong>Email:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user.email}</code></div>
              <div><strong>Email Confirmed:</strong> <span className={`px-2 py-1 rounded ${user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.email_confirmed_at ? 'SIM' : 'NÃO'}</span></div>
            </div>
            <div className="space-y-2">
              <div><strong>Auth Profile:</strong> <span className={`px-2 py-1 rounded ${profile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{profile ? 'EXISTE' : 'NÃO EXISTE'}</span></div>
              <div><strong>Metadata:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{JSON.stringify(user.user_metadata || {})}</code></div>
            </div>
          </div>
        </div>

        {/* Database Profile Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Perfil no Banco de Dados
            </h2>
            <button
              onClick={checkProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
          
          {profileData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Perfil encontrado no banco</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Nome:</strong> {profileData.nome || 'N/A'}</div>
                <div><strong>Email:</strong> {profileData.email || 'N/A'}</div>
                <div><strong>Role:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{profileData.role || 'N/A'}</span></div>
                <div><strong>Escola ID:</strong> {profileData.escola_id || 'N/A'}</div>
                <div><strong>Ativo:</strong> <span className={`px-2 py-1 rounded ${profileData.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{profileData.ativo ? 'SIM' : 'NÃO'}</span></div>
                <div><strong>Criado em:</strong> {profileData.created_at ? new Date(profileData.created_at).toLocaleString('pt-BR') : 'N/A'}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Nenhum perfil encontrado no banco de dados</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ações de Correção</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Criar/Atualizar Perfil</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => createProfile()}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                >
                  {loading ? 'Criando...' : 'Criar Perfil Básico'}
                </button>
                
                {escolas.map(escola => (
                  <button
                    key={escola.id}
                    onClick={() => createProfile(escola.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? 'Criando...' : `Admin de ${escola.nome}`}
                  </button>
                ))}
              </div>
            </div>

            {profileData && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Ações Perigosas</h3>
                <button
                  onClick={deleteProfile}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
                >
                  {loading ? 'Deletando...' : 'Deletar Perfil'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`bg-white rounded-xl p-6 shadow-sm border ${
            result.success ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.success ? 'Sucesso!' : 'Erro!'}
                </h3>
                <p className={`text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
            
            {result.data && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600">Ver dados criados</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}