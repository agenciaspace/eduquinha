import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Filter, Users, BookOpen, Baby, GraduationCap, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import InputField from '../../components/InputField'
import { useAuth } from '../../contexts/AuthContext'

export default function Turmas() {
  const { profile } = useAuth()
  const [turmas, setTurmas] = useState([])
  const [filteredTurmas, setFilteredTurmas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaixaEtaria, setSelectedFaixaEtaria] = useState('todas')
  const [showModal, setShowModal] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false)
  const [professores, setProfessores] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [availableStudents, setAvailableStudents] = useState([])
  const [turmaStudents, setTurmaStudents] = useState([])
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('')
  const [selectedNewTurma, setSelectedNewTurma] = useState('')
  const [selectedStudentToTransfer, setSelectedStudentToTransfer] = useState('')
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    faixa_etaria: '',
    professor_id: '',
    periodo: '',
    capacidade_maxima: ''
  })
  const [editFormData, setEditFormData] = useState({
    nome: '',
    faixa_etaria: '',
    professor_id: '',
    periodo: '',
    capacidade_maxima: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Faixa etária options
  const faixaEtariaOptions = [
    { id: 'todas', nome: 'Todas as Faixas' },
    { id: 'bercario', nome: 'Berçário' },
    { id: 'maternal', nome: 'Maternal' },
    { id: 'jardim', nome: 'Jardim' },
    { id: 'pre', nome: 'Pré-escola' }
  ]

  useEffect(() => {
    if (profile?.escola_id) {
      fetchTurmas()
      fetchProfessores()
    }
  }, [profile?.escola_id])

  useEffect(() => {
    let filtered = turmas

    // Filtro por faixa etária
    if (selectedFaixaEtaria !== 'todas') {
      filtered = filtered.filter(turma => turma.tipo === selectedFaixaEtaria)
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(turma =>
        turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turma.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turma.faixaEtaria.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTurmas(filtered)
  }, [searchTerm, selectedFaixaEtaria, turmas])

  const fetchTurmas = async () => {
    try {
      console.log('🔍 Buscando turmas para escola_id:', profile?.escola_id)
      
      // Buscar turmas com professor e alunos
      const { data: turmasData, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('escola_id', profile?.escola_id)
        .order('nome')

      if (error) {
        console.error('❌ Error fetching turmas:', error)
        return
      }

      console.log('✅ Turmas encontradas:', turmasData?.length || 0, turmasData)

      if (!turmasData || turmasData.length === 0) {
        setTurmas([])
        return
      }

      // Get student counts for each turma
      const turmasWithCounts = await Promise.all(
        turmasData.map(async (turma) => {
          const { count } = await supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true })
            .eq('turma_id', turma.id)
          
          return { ...turma, studentCount: count || 0 }
        })
      )

      const turmasFormatadas = turmasWithCounts.map(turma => {
        // Determinar tipo baseado no nome
        let tipo = 'jardim'
        if (turma.nome.toLowerCase().includes('berçário') || turma.nome.toLowerCase().includes('bercario')) {
          tipo = 'bercario'
        } else if (turma.nome.toLowerCase().includes('maternal')) {
          tipo = 'maternal'
        } else if (turma.nome.toLowerCase().includes('pré') || turma.nome.toLowerCase().includes('pre')) {
          tipo = 'pre'
        }

        // Determinar ícone baseado no tipo
        let icone = '👶'
        if (tipo === 'maternal') icone = '🧸'
        else if (tipo === 'jardim') icone = '🌱'
        else if (tipo === 'pre') icone = '🎓'

        return {
          id: turma.id,
          nome: turma.nome,
          faixaEtaria: turma.faixa_etaria || 'Não informado',
          professor: 'Sem professor', // Simplified for now
          professorId: turma.professor_id,
          escola: 'Escola Principal',
          capacidade: turma.capacidade || 20,
          totalAlunos: turma.studentCount || 0,
          alunos: [],
          tipo,
          icone,
          status: turma.status || 'ativa',
          periodo: turma.periodo || 'integral',
          created_at: turma.created_at
        }
      })

      setTurmas(turmasFormatadas)
    } catch (error) {
      console.error('Error:', error)
      setTurmas([])
    }
  }

  const handleViewTurma = async (turma) => {
    // Try to fetch professor name if we have a professor_id
    let turmaWithProfessor = { ...turma }
    
    if (turma.professorId) {
      try {
        const { data: professorData } = await supabase
          .from('profiles')
          .select('nome')
          .eq('id', turma.professorId)
          .single()
          
        if (professorData) {
          turmaWithProfessor.professor = professorData.nome
        }
      } catch (error) {
        console.log('Could not fetch professor name:', error)
      }
    }
    
    setSelectedTurma(turmaWithProfessor)
    setShowModal(true)
  }

  const calcularOcupacao = (totalAlunos, capacidade) => {
    return Math.round((totalAlunos / capacidade) * 100)
  }

  const getStatusOcupacao = (ocupacao) => {
    if (ocupacao >= 90) return { text: 'Lotada', color: 'text-red-600', bg: 'bg-red-100' }
    if (ocupacao >= 70) return { text: 'Quase cheia', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { text: 'Disponível', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const calcularTempoFuncionamento = (dataCriacao) => {
    const hoje = new Date()
    const criacao = new Date(dataCriacao)
    const diffTime = Math.abs(hoje - criacao)
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

  const fetchStudentsForTurma = async (turmaId) => {
    try {
      setIsLoadingStudents(true)
      
      // Fetch students in this turma
      const { data: studentsInTurma, error: turmaError } = await supabase
        .from('alunos')
        .select('*')
        .eq('turma_id', turmaId)
        .order('nome')
      
      if (turmaError) throw turmaError
      
      // Fetch all students without a turma from the same school
      // First get all turmas from this school to filter students
      const { data: schoolTurmas } = await supabase
        .from('turmas')
        .select('id')
        .eq('escola_id', profile?.escola_id)
      
      const schoolTurmaIds = schoolTurmas?.map(t => t.id) || []
      
      // Get all students that belong to this school (via turmas) or have no turma
      const { data: allSchoolStudents, error: studentsError } = await supabase
        .from('alunos')
        .select('*')
        .order('nome')
      
      if (studentsError) throw studentsError
      
      // Filter to only show students without turma or in this school's turmas
      const availableStudents = allSchoolStudents?.filter(student => 
        !student.turma_id || schoolTurmaIds.includes(student.turma_id)
      ).filter(student => !student.turma_id) || []
      
      setTurmaStudents(studentsInTurma || [])
      setAvailableStudents(availableStudents)
      
    } catch (error) {
      console.error('Error fetching students:', error)
      alert('Erro ao buscar alunos: ' + error.message)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleAddStudentToTurma = async () => {
    if (!selectedStudentToAdd) {
      alert('Por favor, selecione um aluno')
      return
    }

    try {
      const { error } = await supabase
        .from('alunos')
        .update({ turma_id: selectedTurma.id })
        .eq('id', selectedStudentToAdd)

      if (error) throw error

      alert('Aluno adicionado à turma com sucesso!')
      setSelectedStudentToAdd('')
      fetchStudentsForTurma(selectedTurma.id)
      fetchTurmas() // Refresh turmas to update counts
    } catch (error) {
      console.error('Error adding student to turma:', error)
      alert('Erro ao adicionar aluno: ' + error.message)
    }
  }

  const handleRemoveStudentFromTurma = async (studentId) => {
    if (!confirm('Tem certeza que deseja remover este aluno da turma?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('alunos')
        .update({ turma_id: null })
        .eq('id', studentId)

      if (error) throw error

      alert('Aluno removido da turma com sucesso!')
      fetchStudentsForTurma(selectedTurma.id)
      fetchTurmas() // Refresh turmas to update counts
    } catch (error) {
      console.error('Error removing student from turma:', error)
      alert('Erro ao remover aluno: ' + error.message)
    }
  }

  const handleMoveStudentToAnotherTurma = async () => {
    if (!selectedNewTurma || !selectedStudentToTransfer) {
      alert('Por favor, selecione o aluno e a nova turma')
      return
    }

    try {
      const { error } = await supabase
        .from('alunos')
        .update({ turma_id: selectedNewTurma })
        .eq('id', selectedStudentToTransfer)

      if (error) throw error

      alert('Aluno transferido com sucesso!')
      setSelectedNewTurma('')
      setSelectedStudentToTransfer('')
      fetchStudentsForTurma(selectedTurma.id)
      fetchTurmas() // Refresh turmas to update counts
    } catch (error) {
      console.error('Error moving student to another turma:', error)
      alert('Erro ao transferir aluno: ' + error.message)
    }
  }

  const fetchProfessores = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('role', 'professor')
        .eq('escola_id', profile?.escola_id)
        .order('nome')

      if (error) throw error
      setProfessores(data || [])
    } catch (error) {
      console.error('Erro ao buscar professores:', error)
    }
  }

  const handleUpdateTurma = async (e) => {
    e.preventDefault()
    setIsEditing(true)

    try {
      console.log('🔄 Atualizando turma:', selectedTurma.id)
      
      const updateData = {
        nome: editFormData.nome,
        faixa_etaria: editFormData.faixa_etaria,
        professor_id: editFormData.professor_id || null,
        periodo: editFormData.periodo,
        capacidade: parseInt(editFormData.capacidade_maxima)
      }
      
      console.log('📋 Dados da atualização:', updateData)
      
      const { error } = await supabase
        .from('turmas')
        .update(updateData)
        .eq('id', selectedTurma.id)

      if (error) throw error

      // Fechar modal e recarregar lista
      setShowEditModal(false)
      setEditFormData({
        nome: '',
        faixa_etaria: '',
        professor_id: '',
        periodo: '',
        capacidade_maxima: ''
      })
      fetchTurmas()
      
      alert('Turma atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar turma:', error)
      alert('Erro ao atualizar turma: ' + error.message)
    } finally {
      setIsEditing(false)
    }
  }

  const handleCreateTurma = async (e) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      console.log('🚀 Criando turma com escola_id:', profile?.escola_id)
      
      const turmaData = {
        nome: formData.nome,
        faixa_etaria: formData.faixa_etaria,
        professor_id: formData.professor_id || null,
        periodo: formData.periodo,
        capacidade: parseInt(formData.capacidade_maxima),
        escola_id: profile?.escola_id,
        ativo: true
      }
      
      console.log('📋 Dados da turma:', turmaData)
      
      const { error } = await supabase
        .from('turmas')
        .insert(turmaData)

      if (error) throw error

      // Fechar modal e recarregar lista
      setShowCreateModal(false)
      setFormData({
        nome: '',
        faixa_etaria: '',
        professor_id: '',
        periodo: '',
        capacidade_maxima: ''
      })
      fetchTurmas()
      
      alert('Turma criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      alert('Erro ao criar turma: ' + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
            <p className="text-lg text-gray-600 mt-2">Gerencie todas as turmas da escola</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Turma
          </button>
        </div>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-3 sm:p-4 lg:p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total de Turmas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{turmas.length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-blue-100">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {turmas.reduce((sum, turma) => sum + turma.totalAlunos, 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100">
                <Baby className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Professor</p>
                <p className="text-2xl font-bold text-gray-900">
                  {turmas.filter(t => t.professorId).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                <GraduationCap className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ocupação Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    turmas.reduce((sum, turma) => sum + calcularOcupacao(turma.totalAlunos, turma.capacidade), 0) / 
                    (turmas.length || 1)
                  )}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                <Users className="w-5 h-5 text-orange-600" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Premium */}
        <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <InputField
                type="text"
                placeholder="Buscar por nome, professor ou faixa etária..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={selectedFaixaEtaria}
                onChange={(e) => setSelectedFaixaEtaria(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pr-8 appearance-none cursor-pointer"
              >
                {faixaEtariaOptions.map(faixa => (
                  <option key={faixa.id} value={faixa.id}>
                    {faixa.nome}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>
        </div>

        {/* Lista Premium de Turmas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTurmas.map((turma) => {
            const ocupacao = calcularOcupacao(turma.totalAlunos, turma.capacidade)
            const statusOcupacao = getStatusOcupacao(ocupacao)

            return (
              <div key={turma.id} className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{turma.icone}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{turma.nome}</h3>
                    <p className="text-sm text-gray-600">{turma.faixaEtaria}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusOcupacao.bg} ${statusOcupacao.color}`}>
                  {statusOcupacao.text}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4" />
                  <span className="truncate">{turma.professor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{turma.totalAlunos} / {turma.capacidade} alunos</span>
                </div>
                
                {/* Barra de ocupação */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Ocupação</span>
                    <span>{ocupacao}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        ocupacao >= 90 ? 'bg-red-500' : 
                        ocupacao >= 70 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(ocupacao, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-600">
                    <strong>{turma.escola}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Há {calcularTempoFuncionamento(turma.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewTurma(turma)}
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
          )
          })}
        </div>

      {/* Modal de Detalhes */}
      {showModal && selectedTurma && (
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
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Detalhes da Turma</h2>
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
                    <div className="text-6xl mb-2">{selectedTurma.icone}</div>
                    <h3 className="text-xl font-semibold">{selectedTurma.nome}</h3>
                    <p className="text-gray-600">{selectedTurma.faixaEtaria}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-gray-700">Informações Gerais</h4>
                    <div className="space-y-2">
                      <p><strong>Professor:</strong> {selectedTurma.professor}</p>
                      <p><strong>Escola:</strong> {selectedTurma.escola}</p>
                      <p><strong>Período:</strong> {selectedTurma.periodo?.charAt(0).toUpperCase() + selectedTurma.periodo?.slice(1) || 'Integral'}</p>
                      <p><strong>Capacidade:</strong> {selectedTurma.capacidade} alunos</p>
                      <p><strong>Ocupação:</strong> {calcularOcupacao(selectedTurma.totalAlunos, selectedTurma.capacidade)}%</p>
                      <p><strong>Status:</strong> {selectedTurma.status}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Lista de Alunos ({selectedTurma.totalAlunos})</h4>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      {selectedTurma.alunos.length > 0 ? (
                        <div className="space-y-2">
                          {selectedTurma.alunos.map((aluno, index) => (
                            <div key={aluno.id} className="flex items-center justify-between p-2 bg-white rounded">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <span className="font-medium">{aluno.nome}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">Nenhum aluno matriculado</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Estatísticas</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Vagas disponíveis:</span>
                        <span className="font-medium">{selectedTurma.capacidade - selectedTurma.totalAlunos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de ocupação:</span>
                        <span className="font-medium">{calcularOcupacao(selectedTurma.totalAlunos, selectedTurma.capacidade)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo de funcionamento:</span>
                        <span className="font-medium">{calcularTempoFuncionamento(selectedTurma.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setEditFormData({
                      nome: selectedTurma.nome,
                      faixa_etaria: selectedTurma.faixaEtaria,
                      professor_id: selectedTurma.professorId || '',
                      periodo: selectedTurma.periodo || 'integral',
                      capacidade_maxima: selectedTurma.capacidade.toString()
                    })
                    setShowModal(false)
                    setShowEditModal(true)
                  }}
                >
                  Editar Turma
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  onClick={() => {
                    setShowModal(false)
                    setShowManageStudentsModal(true)
                    fetchStudentsForTurma(selectedTurma.id)
                  }}
                >
                  Gerenciar Alunos
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

      {/* Modal de Criação de Turma */}
      {showCreateModal && (
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
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Nova Turma</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      nome: '',
                      faixa_etaria: '',
                      professor_id: '',
                      periodo: '',
                      capacidade_maxima: ''
                    })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTurma} className="space-y-4">
                <InputField
                  label="Nome da Turma"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Maternal I - A"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faixa Etária
                  </label>
                  <select
                    value={formData.faixa_etaria}
                    onChange={(e) => setFormData({ ...formData, faixa_etaria: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="0-1 ano">Berçário (0-1 ano)</option>
                    <option value="1-2 anos">Maternal I (1-2 anos)</option>
                    <option value="2-3 anos">Maternal II (2-3 anos)</option>
                    <option value="3-4 anos">Jardim I (3-4 anos)</option>
                    <option value="4-5 anos">Jardim II (4-5 anos)</option>
                    <option value="5-6 anos">Pré-escola (5-6 anos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professor Responsável
                  </label>
                  <select
                    value={formData.professor_id}
                    onChange={(e) => setFormData({ ...formData, professor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um professor...</option>
                    {professores.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <select
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="manhã">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="integral">Integral</option>
                  </select>
                </div>

                <InputField
                  label="Capacidade Máxima"
                  type="number"
                  value={formData.capacidade_maxima}
                  onChange={(e) => setFormData({ ...formData, capacidade_maxima: e.target.value })}
                  required
                  placeholder="Ex: 20"
                  min="1"
                  max="50"
                />

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 btn-primary py-3 disabled:opacity-50"
                  >
                    {isCreating ? 'Criando...' : 'Criar Turma'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({
                        nome: '',
                        faixa_etaria: '',
                        professor_id: '',
                        periodo: '',
                        capacidade_maxima: ''
                      })
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

      {/* Modal de Edição de Turma */}
      {showEditModal && selectedTurma && (
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
          onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Editar Turma</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditFormData({
                      nome: '',
                      faixa_etaria: '',
                      professor_id: '',
                      periodo: '',
                      capacidade_maxima: ''
                    })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateTurma} className="space-y-4">
                <InputField
                  label="Nome da Turma"
                  type="text"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                  required
                  placeholder="Ex: Maternal I - A"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faixa Etária
                  </label>
                  <select
                    value={editFormData.faixa_etaria}
                    onChange={(e) => setEditFormData({ ...editFormData, faixa_etaria: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="0-1 ano">Berçário (0-1 ano)</option>
                    <option value="1-2 anos">Maternal I (1-2 anos)</option>
                    <option value="2-3 anos">Maternal II (2-3 anos)</option>
                    <option value="3-4 anos">Jardim I (3-4 anos)</option>
                    <option value="4-5 anos">Jardim II (4-5 anos)</option>
                    <option value="5-6 anos">Pré-escola (5-6 anos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professor Responsável
                  </label>
                  <select
                    value={editFormData.professor_id}
                    onChange={(e) => setEditFormData({ ...editFormData, professor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um professor...</option>
                    {professores.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <select
                    value={editFormData.periodo}
                    onChange={(e) => setEditFormData({ ...editFormData, periodo: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="manhã">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="integral">Integral</option>
                  </select>
                </div>

                <InputField
                  label="Capacidade Máxima"
                  type="number"
                  value={editFormData.capacidade_maxima}
                  onChange={(e) => setEditFormData({ ...editFormData, capacidade_maxima: e.target.value })}
                  required
                  placeholder="Ex: 20"
                  min="1"
                  max="50"
                />

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isEditing ? 'Atualizando...' : 'Salvar Alterações'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditFormData({
                        nome: '',
                        faixa_etaria: '',
                        professor_id: '',
                        periodo: '',
                        capacidade_maxima: ''
                      })
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciar Alunos */}
      {showManageStudentsModal && selectedTurma && (
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
          onClick={(e) => e.target === e.currentTarget && setShowManageStudentsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Gerenciar Alunos</h2>
                  <p className="text-gray-600 mt-1">{selectedTurma.nome} - {turmaStudents.length} alunos</p>
                </div>
                <button
                  onClick={() => {
                    setShowManageStudentsModal(false)
                    setSelectedStudentToAdd('')
                    setSelectedNewTurma('')
                    setSelectedStudentToTransfer('')
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {isLoadingStudents ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Alunos na Turma */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Alunos na Turma</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {turmaStudents.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">Nenhum aluno nesta turma</p>
                      ) : (
                        <div className="space-y-2">
                          {turmaStudents.map((student) => (
                            <div key={student.id} className="bg-white p-3 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                                  {student.nome?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">{student.nome}</p>
                                  <p className="text-sm text-gray-600">{student.idade || 'Idade não informada'}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRemoveStudentFromTurma(student.id)}
                                  className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Transferir Aluno */}
                    {turmaStudents.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2">Transferir Aluno para Outra Turma</h4>
                        <div className="space-y-3">
                          <select
                            value={selectedStudentToTransfer}
                            onChange={(e) => setSelectedStudentToTransfer(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Selecione o aluno...</option>
                            {turmaStudents.map(student => (
                              <option key={student.id} value={student.id}>
                                {student.nome}
                              </option>
                            ))}
                          </select>
                          
                          <select
                            value={selectedNewTurma}
                            onChange={(e) => setSelectedNewTurma(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Selecione a nova turma...</option>
                            {turmas
                              .filter(t => t.id !== selectedTurma.id)
                              .map(turma => (
                                <option key={turma.id} value={turma.id}>
                                  {turma.nome} ({turma.totalAlunos}/{turma.capacidade})
                                </option>
                              ))}
                          </select>
                          
                          <button
                            onClick={handleMoveStudentToAnotherTurma}
                            disabled={!selectedNewTurma || !selectedStudentToTransfer}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            Transferir Aluno
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Adicionar Alunos */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Adicionar Alunos</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {availableStudents.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">Nenhum aluno disponível para adicionar</p>
                      ) : (
                        <>
                          <div className="mb-4">
                            <select
                              value={selectedStudentToAdd}
                              onChange={(e) => setSelectedStudentToAdd(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Selecione um aluno...</option>
                              {availableStudents.map(student => (
                                <option key={student.id} value={student.id}>
                                  {student.nome} - {student.idade || 'Idade não informada'}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={handleAddStudentToTurma}
                            disabled={!selectedStudentToAdd}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            Adicionar à Turma
                          </button>
                        </>
                      )}
                    </div>

                    {/* Estatísticas */}
                    <div className="mt-4 bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Estatísticas da Turma</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Capacidade:</span>
                          <span className="font-medium">{selectedTurma.capacidade} alunos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ocupação atual:</span>
                          <span className="font-medium">{turmaStudents.length} alunos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vagas disponíveis:</span>
                          <span className="font-medium text-green-600">
                            {selectedTurma.capacidade - turmaStudents.length} vagas
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de ocupação:</span>
                          <span className="font-medium">
                            {Math.round((turmaStudents.length / selectedTurma.capacidade) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowManageStudentsModal(false)
                    setSelectedStudentToAdd('')
                    setSelectedNewTurma('')
                    setSelectedStudentToTransfer('')
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}