import React, { useState, useEffect } from 'react'
import { User, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function CheckProfileStatus() {
  const { user, profile, loading: authLoading } = useAuth()
  const [profileCheck, setProfileCheck] = useState(null)
  const [schoolCheck, setSchoolCheck] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && !authLoading) {
      checkEverything()
    }
  }, [user, authLoading])

  const checkEverything = async () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      // 1. Check profile directly
      console.log('🔍 Checking profile for user:', user.id)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfileCheck({ data: profileData, error: profileError })
      console.log('🔍 Profile check result:', { data: profileData, error: profileError })

      // 2. Check escola-teste-leon
      console.log('🏫 Checking escola-teste-leon')
      const { data: schoolData, error: schoolError } = await supabase
        .from('escolas')
        .select('*')
        .eq('slug', 'escola-teste-leon')
        .single()

      setSchoolCheck({ data: schoolData, error: schoolError })
      console.log('🏫 School check result:', { data: schoolData, error: schoolError })

    } catch (error) {
      console.error('❌ Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fixProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get escola ID first
      const { data: escola } = await supabase
        .from('escolas')
        .select('id')
        .eq('slug', 'escola-teste-leon')
        .single()

      const profileData = {
        id: user.id,
        email: user.email,
        nome: 'Leon Hatori',
        role: 'admin',
        escola_id: escola?.id,
        ativo: true
      }

      console.log('🔧 Fixing profile with data:', profileData)

      const { data, error } = await supabase
        .from('profiles')
        .upsert([profileData])
        .select()
        .single()

      if (error) {
        console.error('❌ Fix failed:', error)
        alert(`Erro: ${error.message}`)
      } else {
        console.log('✅ Profile fixed:', data)
        alert('Perfil corrigido! Recarregando...')
        window.location.reload()
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert(`Erro inesperado: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const goToSchoolSite = () => {
    window.location.href = 'http://localhost:5174?escola=escola-teste-leon'
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando auth...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Não logado</h1>
          <p className="text-gray-600">Faça login primeiro</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Status do Perfil</h1>
          <p className="text-lg text-gray-600">
            Verificação após execução do SQL
          </p>
          <button
            onClick={checkEverything}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            {loading ? 'Verificando...' : 'Atualizar'}
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Usuário Atual</h2>
          <div className="space-y-2 text-sm">
            <div><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user.id}</code></div>
            <div><strong>Email:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user.email}</code></div>
            <div><strong>Auth Profile:</strong> <span className={`px-2 py-1 rounded ${profile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{profile ? 'CARREGADO' : 'NULL'}</span></div>
          </div>
        </div>

        {/* Profile Check */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Perfil no Banco de Dados
          </h2>
          
          {profileCheck ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {profileCheck.error ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">
                      Erro: {profileCheck.error.message}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Perfil encontrado</span>
                  </>
                )}
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <strong>Dados do perfil:</strong>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(profileCheck.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Clique em "Atualizar" para verificar</p>
          )}
        </div>

        {/* School Check */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏫 Escola Teste</h2>
          
          {schoolCheck ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {schoolCheck.error ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">
                      Erro: {schoolCheck.error.message}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Escola encontrada</span>
                  </>
                )}
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <strong>Dados da escola:</strong>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(schoolCheck.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Clique em "Atualizar" para verificar</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Ações</h2>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fixProfile}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
            >
              {loading ? 'Corrigindo...' : 'Corrigir Perfil'}
            </button>
            
            <button
              onClick={goToSchoolSite}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Ir para Site da Escola
            </button>
            
            <a
              href="/debug-school"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-block"
            >
              Debug Completo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}