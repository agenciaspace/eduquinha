import React, { useState } from 'react'
import { User, AlertCircle, CheckCircle, Database } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function QuickFixProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const quickFix = async () => {
    if (!user) {
      setResult({ success: false, message: 'Usuário não logado' })
      return
    }

    try {
      setLoading(true)
      console.log('🚀 Quick fix for user:', user.email)

      // Try with minimal data first
      const minimalData = {
        id: user.id,
        email: user.email
      }

      console.log('🚀 Trying minimal insert:', minimalData)

      let { data, error } = await supabase
        .from('profiles')
        .insert([minimalData])
        .select()

      if (error) {
        console.log('🚀 Minimal insert failed, trying upsert:', error.message)
        
        // Try upsert instead
        const result = await supabase
          .from('profiles')
          .upsert([minimalData])
          .select()
        
        data = result.data
        error = result.error
      }

      if (error) {
        console.log('🚀 Upsert failed, trying manual fields:', error.message)
        
        // Try adding fields one by one
        const extendedData = { ...minimalData }
        
        // Try adding common fields
        const fieldsToTry = [
          { key: 'nome', value: 'Leon Hatori' },
          { key: 'role', value: 'admin' },
          { key: 'ativo', value: true }
        ]

        for (const field of fieldsToTry) {
          try {
            const testData = { ...extendedData, [field.key]: field.value }
            const testResult = await supabase
              .from('profiles')
              .insert([testData])
              .select()
            
            if (!testResult.error) {
              data = testResult.data
              error = null
              console.log(`🚀 Success with field ${field.key}:`, testData)
              break
            } else {
              console.log(`🚀 Field ${field.key} failed:`, testResult.error.message)
            }
          } catch (fieldError) {
            console.log(`🚀 Field ${field.key} threw error:`, fieldError.message)
          }
        }

        // If all fields failed, try the minimal version again with upsert
        if (error) {
          console.log('🚀 All fields failed, trying final minimal upsert')
          const finalResult = await supabase
            .from('profiles')
            .upsert([minimalData], { onConflict: 'id' })
            .select()
          
          data = finalResult.data
          error = finalResult.error
        }
      }

      if (error) {
        console.error('🚀 Final error:', error)
        setResult({ 
          success: false, 
          message: `Erro persistente: ${error.message}`,
          details: error
        })
      } else {
        console.log('🚀 Success! Profile created:', data)
        setResult({ 
          success: true, 
          message: 'Perfil criado com sucesso! Recarregando...',
          data: data?.[0]
        })
        
        // Force refresh after 2 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }

    } catch (error) {
      console.error('🚀 Unexpected error:', error)
      setResult({ 
        success: false, 
        message: `Erro inesperado: ${error.message}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const testEscola = async () => {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('id, nome, slug')
        .eq('slug', 'escola-teste-leon')
        .single()

      if (data) {
        console.log('🏫 Escola encontrada:', data)
        // Try to create profile with escola_id
        const profileWithSchool = {
          id: user.id,
          email: user.email,
          nome: 'Leon Hatori',
          role: 'admin',
          escola_id: data.id,
          ativo: true
        }

        const result = await supabase
          .from('profiles')
          .upsert([profileWithSchool])
          .select()

        if (result.error) {
          setResult({ success: false, message: `Erro: ${result.error.message}` })
        } else {
          setResult({ success: true, message: 'Perfil criado como admin da escola!' })
          setTimeout(() => window.location.reload(), 2000)
        }
      } else {
        setResult({ success: false, message: 'Escola teste não encontrada' })
      }
    } catch (error) {
      setResult({ success: false, message: error.message })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Não logado</h1>
          <p className="text-gray-600">Faça login primeiro</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Corrigir Perfil</h1>
          <p className="text-gray-600">
            Usuário: <strong>{user.email}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={quickFix}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Corrigindo...' : '🔧 Correção Rápida'}
          </button>

          <button
            onClick={testEscola}
            disabled={loading}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Corrigindo...' : '🏫 Admin da Escola Teste'}
          </button>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`text-sm ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
            </div>
            
            {result.data && (
              <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                <strong>Dados criados:</strong>
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Após a correção, você será redirecionado automaticamente
          </p>
        </div>
      </div>
    </div>
  )
}