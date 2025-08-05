import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import InputField from '../components/InputField'
import { BookOpen, Mail, Lock, User, Phone, Shield, GraduationCap, Heart, ArrowRight } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    telefone: '',
    role: 'responsavel'
  })
  const [error, setError] = useState(null)
  const { signUpWithEmail, loading } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { error } = await signUpWithEmail(
      formData.email,
      formData.password,
      {
        nome: formData.nome,
        telefone: formData.telefone,
        role: formData.role
      }
    )
    
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Navigation */}
      <nav className="eduquinha-nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Eduquinha</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Decorative Elements - Reduced intensity */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full eduquinha-decorative animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-pink-400 rounded-full eduquinha-decorative animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-16 w-28 h-28 bg-green-500 rounded-full eduquinha-decorative animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-blue-500 rounded-full eduquinha-decorative animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md">
              <div className="eduquinha-card p-8 max-w-none">
                
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-black text-gray-800 mb-2">Criar Conta</h1>
                  <p className="text-gray-600">Junte-se à comunidade Eduquinha</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <InputField
                    label="Nome completo"
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    icon={User}
                    required
                  />

                  <InputField
                    label="E-mail"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    icon={Mail}
                    required
                  />

                  <InputField
                    label="Telefone"
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    icon={Phone}
                  />

                  <InputField
                    label="Senha"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    icon={Lock}
                    required
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Tipo de conta
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    >
                      <option value="responsavel">Responsável</option>
                      <option value="professor">Professor</option>
                      <option value="admin">Administração</option>
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Erro ao criar conta</h3>
                          <div className="mt-1 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="eduquinha-button-primary w-full py-4 px-8 text-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Criando conta...</span>
                      </>
                    ) : (
                      <>
                        <span>Criar Conta</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Já tem uma conta?{' '}
                    <Link 
                      to="/login" 
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                    >
                      Fazer login
                    </Link>
                  </p>
                </div>

                {/* Account Types Info */}
                <div className="mt-8 pt-6">
                  <div className="space-y-4">
                    <div className="eduquinha-card bg-purple-50 flex items-center space-x-4">
                      <div className="eduquinha-icon-circle w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-700">Administração</h4>
                        <p className="text-xs text-gray-600">Gestão completa da escola</p>
                      </div>
                    </div>
                    
                    <div className="eduquinha-card bg-green-50 flex items-center space-x-4">
                      <div className="eduquinha-icon-circle w-10 h-10 bg-gradient-to-br from-green-500 to-green-600">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-700">Professor</h4>
                        <p className="text-xs text-gray-600">Rotinas, fotos e atividades</p>
                      </div>
                    </div>
                    
                    <div className="eduquinha-card bg-orange-50 flex items-center space-x-4">
                      <div className="eduquinha-icon-circle w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-700">Responsável</h4>
                        <p className="text-xs text-gray-600">Acompanhe seu pequeno</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm">
                    © 2025 Eduquinha. Feito com ❤️ para a educação infantil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}