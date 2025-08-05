import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Filter, Users, Phone, Mail, BookOpen, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import InputField from '../../components/InputField'
import { useAuth } from '../../contexts/AuthContext'

export default function Professores() {
  const { profile } = useAuth()
  const [professores, setProfessores] = useState([])
  const [filteredProfessores, setFilteredProfessores] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: 'Mudar123'
  })
  const [isCreating, setIsCreating] = useState(false)

  // Status options
  const statusOptions = [
    { id: 'todos', nome: 'Todos os Status' },
    { id: 'ativo', nome: 'Ativos' },
    { id: 'inativo', nome: 'Inativos' }
  ]

  useEffect(() => {
    fetchProfessores()
  }, [])

  useEffect(() => {
    let filtered = professores

    // Filtro por status
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(professor => professor.status === selectedStatus)
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(professor =>
        professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professor.telefone.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProfessores(filtered)
  }, [searchTerm, selectedStatus, professores])

  const fetchProfessores = async () => {
    try {
      // Buscar professores
      const { data: professoresData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professor')
        .order('nome')

      if (error) {
        console.error('Error fetching professores:', error)
        return
      }

      // Buscar turmas para cada professor
      const professoresComTurmas = await Promise.all(
        professoresData.map(async (professor) => {
          const { data: turmasData } = await supabase
            .from('turmas')
            .select(`
              id,
              nome,
              faixa_etaria,
              alunos (id)
            `)
            .eq('professor_id', professor.id)

          const turmas = turmasData || []
          const totalAlunos = turmas.reduce((sum, turma) => sum + (turma.alunos?.length || 0), 0)
          
          return {
            id: professor.id,
            nome: professor.nome || 'Professor',
            email: professor.email,
            telefone: professor.telefone || 'Não informado',
            turmas,
            totalAlunos,
            status: 'ativo', // Assumindo que todos estão ativos
            foto: professor.nome ? professor.nome.charAt(0).toUpperCase() : 'P',
            created_at: professor.created_at
          }
        })
      )

      setProfessores(professoresComTurmas)
    } catch (error) {
      console.error('Error:', error)
      setProfessores([])
    }
  }

  const handleViewProfessor = (professor) => {
    setSelectedProfessor(professor)
    setShowModal(true)
  }

  const calcularTempoCadastro = (dataCadastro) => {
    const hoje = new Date()
    const cadastro = new Date(dataCadastro)
    const diffTime = Math.abs(hoje - cadastro)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} dias`
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30)
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
    } else {
      const anos = Math.floor(diffDays / 365)
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
    }
  }

  const handleCreateProfessor = async (e) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      console.log('🚀 Iniciando criação de professor:', formData.email)

      let finalUserId = null
      let authCreated = false

      // 1. Primeiro tentar criar usuário no Auth
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.senha,
          email_confirm: true,
          user_metadata: {
            nome: formData.nome,
            role: 'professor'
          }
        })

        if (authError) {
          console.warn('⚠️ Erro no Auth admin, tentando método alternativo:', authError.message)
          
          // Método alternativo: auth.signUp
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.senha,
            options: {
              data: {
                nome: formData.nome,
                role: 'professor'
              }
            }
          })

          if (signUpError) {
            console.warn('⚠️ SignUp também falhou:', signUpError.message)
            // Usar UUID temporário se Auth falhar completamente
            finalUserId = crypto.randomUUID()
          } else {
            console.log('✅ Auth criado via signUp')
            finalUserId = signUpData.user.id
            authCreated = true
          }
        } else {
          console.log('✅ Auth criado via admin')
          finalUserId = authData.user.id
          authCreated = true
        }
      } catch (authCreateError) {
        console.warn('⚠️ Erro ao criar usuário no Auth (usando UUID temporário):', authCreateError.message)
        finalUserId = crypto.randomUUID()
      }

      // 2. Criar perfil com o ID final (seja do Auth ou UUID temporário)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: finalUserId,
          email: formData.email,
          nome: formData.nome,
          telefone: formData.telefone,
          role: 'professor',
          escola_id: profile?.escola_id,
          ativo: true,
          senha_temporaria: true,
          primeiro_login: true,
          auth_criado: authCreated
        })

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError)
        throw new Error(`Erro ao criar perfil: ${profileError.message}`)
      }

      console.log('✅ Perfil criado com sucesso')

      // Fechar modal e recarregar lista
      setShowCreateModal(false)
      setFormData({ nome: '', email: '', telefone: '', senha: 'Mudar123' })
      fetchProfessores()
      
      const authStatus = authCreated 
        ? 'Professor pode fazer login imediatamente.'
        : 'Professor precisará se registrar no primeiro acesso.'
      
      alert(`Professor criado com sucesso!\n\nCredenciais de acesso:\nEmail: ${formData.email}\nSenha: ${formData.senha}\n\n⚠️ O professor deve alterar a senha no primeiro login.\n\n*Nota: ${authStatus}`)
      
    } catch (error) {
      console.error('❌ Erro geral ao criar professor:', error)
      alert('Erro ao criar professor: ' + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Professores</h1>
            <p className="text-lg text-gray-600 mt-2">Gerencie todos os professores da escola</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Professor
          </button>
        </div>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Professores</p>
                <p className="text-2xl font-bold text-gray-900">{professores.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Professores Ativos</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {professores.filter(p => p.status === 'ativo').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100">
                <Users className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Turma</p>
                <p className="text-2xl font-bold text-gray-900">
                  {professores.filter(p => p.turmas.length > 0).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                <BookOpen className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sem Turma</p>
                <p className="text-2xl font-bold text-gray-900">
                  {professores.filter(p => p.turmas.length === 0).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                <Users className="w-5 h-5 text-orange-600" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Premium */}
        <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <InputField
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pr-8 appearance-none cursor-pointer"
              >
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.nome}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>
        </div>

        {/* Lista Premium de Professores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProfessores.map((professor) => (
            <div key={professor.id} className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg sm:text-xl font-bold">
                  {professor.foto}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{professor.nome}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Professor(a)</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                professor.status === 'ativo' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {professor.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{professor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{professor.telefone}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Turmas</p>
                {professor.turmas.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {professor.turmas.map(turma => (
                      <span key={turma.id} className="text-xs px-2 py-1 bg-edu-blue-light text-edu-blue rounded-full">
                        {turma.nome}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Nenhuma turma atribuída</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-600">
                  <strong>{professor.totalAlunos}</strong> alunos
                </p>
                <p className="text-xs text-gray-500">
                  Há {calcularTempoCadastro(professor.created_at)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewProfessor(professor)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
              >
                <Eye className="w-4 h-4" />
                Ver Detalhes
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-red-50">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
          ))}
        </div>

      {/* Modal de Detalhes */}
      {showModal && selectedProfessor && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 999999 
          }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Detalhes do Professor</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                      {selectedProfessor.foto}
                    </div>
                    <h3 className="text-xl font-semibold">{selectedProfessor.nome}</h3>
                    <p className="text-gray-600">Professor(a)</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-gray-700">Contato</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedProfessor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedProfessor.telefone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Turmas Atribuídas</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedProfessor.turmas && selectedProfessor.turmas.length > 0 ? (
                        <div className="space-y-2">
                          {selectedProfessor.turmas.map(turma => (
                            <div key={turma.id} className="flex justify-between items-center p-2 bg-white rounded">
                              <div>
                                <p className="font-medium">{turma.nome}</p>
                                <p className="text-xs text-gray-500">{turma.faixa_etaria}</p>
                              </div>
                              <span className="text-sm font-medium text-blue-600">
                                {turma.alunos?.length || 0} alunos
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">Nenhuma turma atribuída</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Informações Adicionais</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Status:</strong> {selectedProfessor.status}</p>
                      <p><strong>Total de Alunos:</strong> {selectedProfessor.totalAlunos}</p>
                      <p><strong>Cadastrado há:</strong> {calcularTempoCadastro(selectedProfessor.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // TODO: Implement edit functionality
                    alert('Funcionalidade de edição será implementada em breve')
                  }}
                >
                  Editar Informações
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Professor */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 999999 
          }}
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Novo Professor</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ nome: '', email: '', telefone: '', senha: 'Mudar123' })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProfessor} className="space-y-4">
                <InputField
                  label="Nome Completo"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Digite o nome do professor"
                />

                <InputField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="professor@escola.com"
                  icon={Mail}
                />

                <InputField
                  label="Telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  required
                  placeholder="(11) 98765-4321"
                  icon={Phone}
                />

                <div>
                  <InputField
                    label="Senha Inicial (Padrão)"
                    type="text"
                    value={formData.senha}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    icon={Lock}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Senha padrão será enviada por email. O professor deve alterar no primeiro login.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 btn-primary py-3 disabled:opacity-50"
                  >
                    {isCreating ? 'Criando...' : 'Criar Professor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({ nome: '', email: '', telefone: '', senha: 'Mudar123' })
                    }}
                    className="flex-1 btn-secondary py-3"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}