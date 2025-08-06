import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSchool } from '../../contexts/SchoolContext'
import { useAuth } from '../../contexts/AuthContext'
import { useSchoolRedirect } from '../../hooks/useSchoolRedirect'
import { Mail, Lock, LogIn } from 'lucide-react'
import InputField from '../../components/InputField'

export default function SchoolLogin() {
  const { school, loading: schoolLoading } = useSchool()
  const { signInWithEmail, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Use school redirect hook to handle post-login navigation
  useSchoolRedirect()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Redirect if no school context
    if (!schoolLoading && !school) {
      navigate('/')
    }
  }, [school, schoolLoading, navigate])

  useEffect(() => {
    // Only redirect if we're actually on the login page and user is logged in
    if (user && location.pathname === '/login') {
      const urlParams = new URLSearchParams(window.location.search)
      const escola = urlParams.get('escola')
      if (escola) {
        // Stay on the same school site
        navigate(`/dashboard?escola=${escola}`)
      } else {
        navigate('/dashboard')
      }
    }
  }, [user, navigate, location.pathname])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await signInWithEmail(formData.email, formData.password)
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos')
        } else {
          setError(error.message)
        }
      }
      // Navigation is handled by useSchoolRedirect hook
    } catch (error) {
      setError('Erro ao fazer login: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando informações da escola...</p>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Escola não encontrada</h1>
          <p className="text-gray-600 mb-4">Não foi possível encontrar esta escola.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* School Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              {school.logo_url ? (
                <img 
                  src={school.logo_url} 
                  alt={`Logo ${school.nome}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl text-white font-bold">
                  {school.nome?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {school.nome}
            </h1>
            <p className="text-lg text-gray-600">{school.endereco}</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Fazer Login</h2>
              <p className="text-sm text-gray-600 mt-2">
                Acesse sua conta do {school.nome}
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                icon={Mail}
                placeholder="Digite seu email"
              />

              <InputField
                label="Senha"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                icon={Lock}
                placeholder="Digite sua senha"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-400 to-purple-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link 
                  to="/esqueceu-senha" 
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ainda não tem conta?</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/cadastro?tipo=aluno"
                  className="flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  Sou Aluno
                </Link>
                <Link
                  to="/cadastro?tipo=professor"
                  className="flex items-center justify-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  Sou Professor
                </Link>
              </div>
            </div>

            {school.mensagem_login && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  {school.mensagem_login}
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Voltar ao Eduquinha
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}