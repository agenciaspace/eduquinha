import React, { useState, useEffect } from 'react'
import { Search, Database, User, Globe, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSchool } from '../contexts/SchoolContext'
import { getSubdomain, isSchoolSubdomain, getSchoolUrl } from '../utils/subdomain'

export default function DebugSchool() {
  const { user, profile } = useAuth()
  const { school, loading: schoolLoading, error: schoolError, isSchoolSite } = useSchool()
  const [debugInfo, setDebugInfo] = useState({})
  const [escolas, setEscolas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDebugInfo()
    loadEscolas()
  }, [])

  const loadDebugInfo = () => {
    const info = {
      // URL Info
      currentUrl: window.location.href,
      hostname: window.location.hostname,
      search: window.location.search,
      
      // Subdomain Detection
      detectedSubdomain: getSubdomain(),
      isSchoolSite: isSchoolSubdomain(),
      
      // School Context
      schoolLoading: schoolLoading,
      schoolError: schoolError,
      schoolData: school,
      
      // Auth Info
      userLoggedIn: !!user,
      userEmail: user?.email,
      profileData: profile
    }
    
    setDebugInfo(info)
    console.log('🐛 Debug Info:', info)
  }

  const loadEscolas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEscolas(data || [])
      console.log('🏫 Escolas encontradas:', data)
    } catch (error) {
      console.error('❌ Erro ao carregar escolas:', error)
    } finally {
      setLoading(false)
    }
  }

  const testSchoolUrl = (slug) => {
    const url = `${window.location.origin}${window.location.pathname}?escola=${slug}`
    window.open(url, '_blank')
  }

  const navigateToSchool = (slug) => {
    const url = `${window.location.origin}?escola=${slug}`
    window.location.href = url
  }

  const testSchoolContext = async (slug) => {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        alert(`Erro: ${error.message}`)
      } else {
        alert(`Escola encontrada: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      alert(`Erro: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug - Sistema de Escolas</h1>
          <p className="text-lg text-gray-600">
            Diagnóstico completo do sistema de subdomínios
          </p>
          <button 
            onClick={() => { loadDebugInfo(); loadEscolas(); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar Informações
          </button>
        </div>

        {/* URL Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Informações da URL
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div><strong>URL Atual:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.currentUrl}</code></div>
              <div><strong>Hostname:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.hostname}</code></div>
              <div><strong>Search Params:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.search || 'Nenhum'}</code></div>
            </div>
            <div className="space-y-2">
              <div><strong>Subdomínio Detectado:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{debugInfo.detectedSubdomain || 'Nenhum'}</code></div>
              <div><strong>É Site de Escola:</strong> <span className={`px-2 py-1 rounded ${debugInfo.isSchoolSite ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{debugInfo.isSchoolSite ? 'SIM' : 'NÃO'}</span></div>
            </div>
          </div>
        </div>

        {/* School Context */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Contexto da Escola
          </h2>
          <div className="space-y-3">
            <div><strong>School Loading:</strong> <span className={`px-2 py-1 rounded text-sm ${debugInfo.schoolLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{debugInfo.schoolLoading ? 'CARREGANDO' : 'FINALIZADO'}</span></div>
            <div><strong>School Error:</strong> <span className={`px-2 py-1 rounded text-sm ${debugInfo.schoolError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{debugInfo.schoolError || 'NENHUM'}</span></div>
            <div><strong>School Data:</strong></div>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo.schoolData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Auth Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações de Autenticação
          </h2>
          <div className="space-y-3">
            <div><strong>Usuário Logado:</strong> <span className={`px-2 py-1 rounded text-sm ${debugInfo.userLoggedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{debugInfo.userLoggedIn ? 'SIM' : 'NÃO'}</span></div>
            <div><strong>Email:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.userEmail || 'N/A'}</code></div>
            <div><strong>Profile Data:</strong></div>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo.profileData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Schools List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏫 Escolas no Banco de Dados</h2>
          
          {loading ? (
            <p className="text-gray-600">Carregando escolas...</p>
          ) : escolas.length === 0 ? (
            <p className="text-red-600">❌ Nenhuma escola encontrada no banco</p>
          ) : (
            <div className="space-y-4">
              {escolas.map((escola) => (
                <div key={escola.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">{escola.nome}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>ID:</strong> {escola.id}</div>
                        <div><strong>Slug:</strong> <code className="bg-gray-100 px-1 rounded">{escola.slug || 'N/A'}</code></div>
                        <div><strong>Email:</strong> {escola.email || 'N/A'}</div>
                        <div><strong>Ativo:</strong> {escola.ativo ? '✅ Sim' : '❌ Não'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {escola.slug && (
                        <>
                          <button
                            onClick={() => testSchoolUrl(escola.slug)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Nova Aba
                          </button>
                          <button
                            onClick={() => navigateToSchool(escola.slug)}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                          >
                            Ir para Escola
                          </button>
                          <button
                            onClick={() => testSchoolContext(escola.slug)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Testar Query
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {escola.slug && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                      <strong className="text-sm">URL de Teste:</strong>
                      <br />
                      <code className="text-xs break-all">
                        {window.location.origin}?escola={escola.slug}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Test Links */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">🧪 Links de Teste Manual</h3>
          <div className="space-y-2">
            <a 
              href="?escola=escola-teste-leon" 
              className="block text-blue-600 hover:text-blue-800 underline"
              target="_blank"
            >
              ?escola=escola-teste-leon (Nova aba)
            </a>
            <a 
              href="?escola=teste" 
              className="block text-blue-600 hover:text-blue-800 underline"
              target="_blank"
            >
              ?escola=teste (Teste com escola inexistente)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}