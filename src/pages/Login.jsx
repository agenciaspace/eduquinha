import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSchoolRedirect } from '../hooks/useSchoolRedirect'
import InputField from '../components/InputField'
import { 
  BookOpen, 
  Mail, 
  Lock, 
  User,
  Heart,
  Star,
  Sparkles,
  GraduationCap,
  Users,
  Shield,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const { signInWithEmail, loading } = useAuth()
  const navigate = useNavigate()
  
  // Use school redirect hook to handle post-login navigation
  useSchoolRedirect()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { error } = await signInWithEmail(email, password)
    
    if (error) {
      setError(error.message)
    }
    // Navigation is handled by useSchoolRedirect hook
  }

  const quickLoginOptions = [
    {
      role: 'admin',
      email: 'admin@eduquinha.com',
      password: 'admin123',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      icon: Shield,
      title: 'Administrador',
      description: 'Acesso completo ao sistema'
    },
    {
      role: 'professor',
      email: 'prof1@eduquinha.com', 
      password: 'prof123',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      icon: GraduationCap,
      title: 'Professor',
      description: 'Gerenciar turmas e alunos'
    },
    {
      role: 'responsavel',
      email: 'pai1@gmail.com',
      password: 'pai123', 
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      icon: Heart,
      title: 'Responsável',
      description: 'Acompanhar seus filhos'
    }
  ]

  const handleQuickLogin = (option) => {
    setEmail(option.email)
    setPassword(option.password)
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
        
        {/* Floating Icons */}
        <div className="absolute top-1/4 left-1/4 animate-float eduquinha-decorative">
          <Star className="w-8 h-8 text-yellow-400" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-delayed eduquinha-decorative">
          <Sparkles className="w-6 h-6 text-pink-400" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-bounce eduquinha-decorative">
          <Heart className="w-7 h-7 text-red-400" />
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            
            {/* Left Side - Branding */}
            <div className="hidden lg:block space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  <span>Acesso seguro à plataforma</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                  Entre na sua
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent block">
                    conta Eduquinha
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Acesse o painel completo de gestão escolar e acompanhe o desenvolvimento 
                  das crianças em tempo real.
                </p>
              </div>

              <div className="space-y-6">
                <div className="eduquinha-card flex items-center space-x-4">
                  <div className="eduquinha-icon-circle w-12 h-12">
                    <Users className="w-6 h-6 text-white" />  
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestão Completa</h3>
                    <p className="text-gray-600">Alunos, professores e responsáveis em um só lugar</p>
                  </div>
                </div>

                <div className="eduquinha-card flex items-center space-x-4">
                  <div className="eduquinha-icon-circle w-12 h-12 bg-gradient-to-br from-green-400 to-green-600">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cuidado Personalizado</h3>
                    <p className="text-gray-600">Acompanhamento individual de cada criança</p>
                  </div>
                </div>

                <div className="eduquinha-card flex items-center space-x-4">
                  <div className="eduquinha-icon-circle w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tecnologia Moderna</h3>
                    <p className="text-gray-600">Interface intuitiva e segura para todos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="eduquinha-card p-8 max-w-none">
                
                {/* Mobile Header */}
                <div className="lg:hidden text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-black text-gray-800">Eduquinha</h1>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
                  <p className="text-gray-600">Entre na sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    icon={Mail}
                    required
                  />

                  <InputField
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={Lock}
                    rightIcon={showPassword ? EyeOff : Eye}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    required
                  />

                  {error && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Erro ao fazer login</h3>
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
                        <div className="animate-spin rounded-full h-5 w-5 border-b border-white"></div>
                        <span>Entrando...</span>
                      </>
                    ) : (
                      <>
                        <span>Entrar no Eduquinha</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Login Options */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-px bg-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Acesso rápido para demonstração</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {quickLoginOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickLogin(option)}
                        className={`${option.bgColor} ${option.textColor} p-4 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 group`}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                          <option.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-semibold mb-1">{option.title}</div>
                        <div className="text-xs opacity-75">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Não tem uma conta?{' '}
                    <Link 
                      to="/register" 
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                    >
                      Cadastre-se aqui
                    </Link>
                  </p>
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