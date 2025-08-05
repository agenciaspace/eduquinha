import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSchool } from '../../contexts/SchoolContext'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, Lock, Phone, Calendar, Users, UserCheck } from 'lucide-react'
import InputField from '../../components/InputField'

export default function SchoolRegister() {
  const { school, loading: schoolLoading } = useSchool()
  const { signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefone: '',
    data_nascimento: '',
    tipo: searchParams.get('tipo') || 'aluno'
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Redirect if no school context
    if (!schoolLoading && !school) {
      navigate('/')
    }
  }, [school, schoolLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const metadata = {
        nome: formData.nome,
        telefone: formData.telefone,
        data_nascimento: formData.data_nascimento,
        role: formData.tipo,
        escola_id: school.id,
        escola_slug: school.slug,
        pending_approval: formData.tipo === 'professor' // Professores precisam de aprovação
      }

      const { data, error } = await signUpWithEmail(
        formData.email,
        formData.password,
        metadata
      )

      if (error) {
        setError(error.message)
      } else {
        // Redirect based on role
        if (formData.tipo === 'aluno') {
          navigate('/meu-dia')
        } else if (formData.tipo === 'professor') {
          navigate('/dashboard?message=Sua conta foi criada e está aguardando aprovação da administração.')
        }
      }
    } catch (error) {
      setError('Erro ao criar conta: ' + error.message)
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

  const getRoleInfo = (tipo) => {
    switch (tipo) {
      case 'aluno':
        return {
          title: 'Cadastro de Aluno',
          subtitle: 'Crie sua conta para acessar suas atividades e acompanhar seu progresso',
          icon: Users,
          color: 'from-blue-400 to-purple-400'
        }
      case 'professor':
        return {
          title: 'Cadastro de Professor',
          subtitle: 'Crie sua conta para gerenciar suas turmas e atividades',
          icon: UserCheck,
          color: 'from-green-400 to-blue-400'
        }
      default:
        return {
          title: 'Cadastro',
          subtitle: 'Crie sua conta',
          icon: User,
          color: 'from-gray-400 to-gray-600'
        }
    }
  }

  const roleInfo = getRoleInfo(formData.tipo)
  const RoleIcon = roleInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* School Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 bg-gradient-to-r ${roleInfo.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <span className="text-3xl text-white font-bold">
                {school.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {school.nome}
            </h1>
            <p className="text-lg text-gray-600">{school.endereco}</p>
          </div>

          {/* Role Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Como você quer se cadastrar?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: 'aluno' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.tipo === 'aluno'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Aluno</div>
                <div className="text-xs opacity-75">Estudante</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: 'professor' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.tipo === 'professor'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <UserCheck className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Professor</div>
                <div className="text-xs opacity-75">Educador</div>
              </button>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 bg-gradient-to-r ${roleInfo.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <RoleIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{roleInfo.title}</h2>
              <p className="text-sm text-gray-600 mt-2">{roleInfo.subtitle}</p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Nome Completo"
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                icon={User}
                placeholder="Digite seu nome completo"
              />

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
                label="Telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                icon={Phone}
                placeholder="(11) 99999-9999"
              />

              {formData.tipo === 'aluno' && (
                <InputField
                  label="Data de Nascimento"
                  type="date"
                  required
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                  icon={Calendar}
                />
              )}

              <InputField
                label="Senha"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                icon={Lock}
                placeholder="Mínimo 6 caracteres"
              />

              <InputField
                label="Confirmar Senha"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                icon={Lock}
                placeholder="Digite a senha novamente"
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r ${roleInfo.color} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Faça login
                </Link>
              </p>
            </div>

            {formData.tipo === 'professor' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Contas de professor precisam ser aprovadas pela administração da escola antes de serem ativadas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}