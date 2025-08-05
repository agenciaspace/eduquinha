import React, { useState } from 'react'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import InputField from '../components/InputField'

export default function MudarSenha() {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    atual: false,
    nova: false,
    confirmar: false
  })
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsChanging(true)

    try {
      // Validações
      if (formData.novaSenha.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres')
      }

      if (formData.novaSenha !== formData.confirmarSenha) {
        throw new Error('As senhas não conferem')
      }

      if (formData.senhaAtual === formData.novaSenha) {
        throw new Error('A nova senha deve ser diferente da atual')
      }

      // 1. Atualizar senha no Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: formData.novaSenha
      })

      if (authError) throw authError

      // 2. Marcar que não é mais primeiro login
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          senha_temporaria: false,
          primeiro_login: false 
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      alert('Senha alterada com sucesso! Você será redirecionado.')
      
      // Recarregar página para atualizar o contexto
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setError(error.message)
    } finally {
      setIsChanging(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Alterar Senha</h1>
          <p className="text-gray-600">
            Por segurança, você deve alterar sua senha padrão antes de continuar.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Primeiro Acesso</h3>
              <p className="text-sm text-yellow-700">
                Sua senha atual é temporária. Escolha uma senha segura que apenas você conheça.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <InputField
              label="Senha Atual"
              type={showPasswords.atual ? 'text' : 'password'}
              value={formData.senhaAtual}
              onChange={(e) => setFormData({ ...formData, senhaAtual: e.target.value })}
              required
              placeholder="Digite sua senha atual (Mudar123)"
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('atual')}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.atual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <InputField
              label="Nova Senha"
              type={showPasswords.nova ? 'text' : 'password'}
              value={formData.novaSenha}
              onChange={(e) => setFormData({ ...formData, novaSenha: e.target.value })}
              required
              placeholder="Digite sua nova senha (mín. 6 caracteres)"
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('nova')}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.nova ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <InputField
              label="Confirmar Nova Senha"
              type={showPasswords.confirmar ? 'text' : 'password'}
              value={formData.confirmarSenha}
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
              required
              placeholder="Digite novamente sua nova senha"
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmar')}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Dicas para uma senha segura:</h3>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Use pelo menos 6 caracteres</li>
                  <li>• Misture letras, números e símbolos</li>
                  <li>• Não use informações pessoais</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChanging}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            {isChanging ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Esta alteração é obrigatória por questões de segurança.
          </p>
        </div>
      </div>
    </div>
  )
}