import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Baby, X } from 'lucide-react'
import { alunosApi, turmasApi, profilesApi } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import InputField from '../../components/InputField'

export default function Alunos() {
  console.log('🎯 Alunos component loaded')
  
  const { profile } = useAuth()
  const [alunos, setAlunos] = useState([])
  const [filteredAlunos, setFilteredAlunos] = useState([])
  const [turmas, setTurmas] = useState([{ id: 'todas', nome: 'Todas as Turmas' }])
  const [responsaveis, setResponsaveis] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTurma, setSelectedTurma] = useState('todas')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('create')
  const [selectedAluno, setSelectedAluno] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    turma_id: '',
    responsaveis_ids: [],
    alergias: '',
    restricoes: '',
    observacoes: ''
  })

  const fetchAlunos = async () => {
    try {
      const alunosData = await alunosApi.getAll()
      const formattedAlunos = alunosData.map(aluno => ({
        id: aluno.id,
        nome: aluno.nome,
        dataNascimento: aluno.data_nascimento,
        turma: aluno.turmas || { id: '', nome: 'Sem turma' },
        responsaveis: aluno.responsaveis?.map(r => r.profiles?.nome || r.nome) || [],
        foto: Math.random() > 0.5 ? '👦' : '👧',
        status: 'ativo',
        alergias: aluno.alergias,
        restricoes: aluno.restricoes,
        observacoes: aluno.observacoes
      }))
      setAlunos(formattedAlunos)
    } catch (error) {
      console.error('Error fetching alunos:', error)
      setAlunos([
        {
          id: 'aluno-1',
          nome: 'João Silva',
          dataNascimento: '2020-03-15',
          turma: { id: 'turma-1', nome: 'Maternal I' },
          responsaveis: ['Maria Silva'],
          foto: '👦',
          status: 'ativo',
          alergias: 'Nenhuma',
          restricoes: '',
          observacoes: ''
        }
      ])
    }
  }

  const fetchTurmas = async () => {
    try {
      const turmasData = await turmasApi.getAll()
      setTurmas([
        { id: 'todas', nome: 'Todas as Turmas' },
        ...turmasData
      ])
    } catch (error) {
      console.error('Error fetching turmas:', error)
      setTurmas([
        { id: 'todas', nome: 'Todas as Turmas' },
        { id: 'turma-1', nome: 'Berçário I' },
        { id: 'turma-2', nome: 'Maternal I' },
        { id: 'turma-3', nome: 'Jardim I' }
      ])
    }
  }

  const fetchResponsaveis = async () => {
    try {
      const responsaveisData = await profilesApi.getByRole('responsavel')
      setResponsaveis(responsaveisData || [])
    } catch (error) {
      console.error('Error fetching responsaveis:', error)
      setResponsaveis([
        { id: 'resp-1', nome: 'Maria Silva' },
        { id: 'resp-2', nome: 'João Santos' }
      ])
    }
  }

  useEffect(() => {
    fetchTurmas()
    fetchAlunos()
    fetchResponsaveis()
  }, [])

  useEffect(() => {
    let filtered = alunos
    if (selectedTurma !== 'todas') {
      filtered = filtered.filter(aluno => aluno.turma.id === selectedTurma)
    }
    if (searchTerm) {
      filtered = filtered.filter(aluno =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.responsaveis.some(resp => 
          resp.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    setFilteredAlunos(filtered)
  }, [searchTerm, selectedTurma, alunos])

  const calcularIdade = (dataNascimento) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    
    if (idade === 0) {
      const meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + hoje.getMonth() - nascimento.getMonth()
      return `${meses} meses`
    }
    
    return `${idade} ${idade === 1 ? 'ano' : 'anos'}`
  }

  const openModal = (type, aluno = null) => {
    console.log('🚀 Opening modal:', type)
    console.log('📊 Current showModal state:', showModal)
    setModalType(type)
    setSelectedAluno(aluno)
    
    if (type === 'create') {
      setFormData({
        nome: '',
        data_nascimento: '',
        turma_id: '',
        responsaveis_ids: [],
        alergias: '',
        restricoes: '',
        observacoes: ''
      })
    } else if (type === 'edit' && aluno) {
      setFormData({
        nome: aluno.nome,
        data_nascimento: aluno.dataNascimento,
        turma_id: aluno.turma.id || '',
        responsaveis_ids: [],
        alergias: aluno.alergias || '',
        restricoes: aluno.restricoes || '',
        observacoes: aluno.observacoes || ''
      })
    }
    
    setShowModal(true)
    console.log('✅ Modal should be open now, showModal:', true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('🚀 Submitting form data:', formData)
      
      const alunoData = {
        nome: formData.nome,
        data_nascimento: formData.data_nascimento,
        turma_id: formData.turma_id || null,
        alergias: formData.alergias || null,
        restricoes: formData.restricoes || null,
        observacoes: formData.observacoes || null
      }

      if (modalType === 'create') {
        // Create new student
        const { data, error } = await supabase
          .from('alunos')
          .insert(alunoData)
          .select()
          .single()

        if (error) throw error

        console.log('✅ Student created:', data)
        alert('Aluno criado com sucesso!')
        
      } else if (modalType === 'edit') {
        // Update existing student
        const { data, error } = await supabase
          .from('alunos')
          .update(alunoData)
          .eq('id', selectedAluno.id)
          .select()
          .single()

        if (error) throw error

        console.log('✅ Student updated:', data)
        alert('Aluno atualizado com sucesso!')
      }

      // Refresh the list and close modal
      fetchAlunos()
      closeModal()
      
    } catch (error) {
      console.error('❌ Error submitting form:', error)
      alert('Erro ao salvar aluno: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedAluno(null)
    setModalType('create')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
            <p className="text-lg text-gray-600 mt-2">Gerencie todos os alunos da escola</p>
          </div>
          <button 
            onClick={() => {
              console.log('🔥 Button clicked!')
              openModal('create')
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Aluno
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{alunos.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <Baby className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alunos Ativos</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {alunos.filter(a => a.status === 'ativo').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100">
                <Baby className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Berçário</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alunos.filter(a => a.turma.nome.includes('Berçário')).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                <Baby className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jardim</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alunos.filter(a => a.turma.nome.includes('Jardim')).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                <Baby className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <InputField
                type="text"
                placeholder="Buscar por nome ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="relative">
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pr-8 appearance-none cursor-pointer"
              >
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlunos.map((aluno) => (
            <div key={aluno.id} className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{aluno.foto}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{aluno.nome}</h3>
                    <p className="text-sm text-gray-600">{calcularIdade(aluno.dataNascimento)}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                  {aluno.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Turma</p>
                  <p className="text-sm font-medium text-gray-900">{aluno.turma.nome}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Responsáveis</p>
                  <p className="text-sm text-gray-700">{aluno.responsaveis.join(', ') || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openModal('view', aluno)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalhes
                </button>
                <button 
                  onClick={() => openModal('edit', aluno)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAlunos.length === 0 && (
          <div className="text-center py-12">
            <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum aluno encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo aluno</p>
          </div>
        )}
      </div>

      {/* Modal Funcional */}
      {console.log('🤔 Checking modal render - showModal:', showModal, 'modalType:', modalType)}
      {showModal && (console.log('🎆 Modal WILL render now!') || true) && (
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
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {modalType === 'create' && 'Novo Aluno'}
                {modalType === 'edit' && 'Editar Aluno'}
                {modalType === 'view' && 'Detalhes do Aluno'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalType === 'view' && selectedAluno ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{selectedAluno.foto}</div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedAluno.nome}</h3>
                    <p className="text-gray-600">{calcularIdade(selectedAluno.dataNascimento)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Informações Básicas</h4>
                    <p><strong>Data de Nascimento:</strong> {new Date(selectedAluno.dataNascimento).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Turma:</strong> {selectedAluno.turma.nome}</p>
                    <p><strong>Status:</strong> {selectedAluno.status}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Responsáveis</h4>
                    {selectedAluno.responsaveis.map((resp, index) => (
                      <p key={index}>{resp}</p>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Informações Médicas</h4>
                    <p><strong>Alergias:</strong> {selectedAluno.alergias || 'Nenhuma'}</p>
                    <p><strong>Restrições:</strong> {selectedAluno.restricoes || 'Nenhuma'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Observações</h4>
                    <p>{selectedAluno.observacoes || 'Nenhuma observação'}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => openModal('edit', selectedAluno)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    Editar
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o nome do aluno"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Turma
                    </label>
                    <select
                      value={formData.turma_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, turma_id: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma turma</option>
                      {turmas.filter(t => t.id !== 'todas').map(turma => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsáveis
                    </label>
                    <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto">
                      {responsaveis.length > 0 ? (
                        responsaveis.map(resp => (
                          <label key={resp.id} className="flex items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              checked={formData.responsaveis_ids.includes(resp.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    responsaveis_ids: [...prev.responsaveis_ids, resp.id]
                                  }))
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    responsaveis_ids: prev.responsaveis_ids.filter(id => id !== resp.id)
                                  }))
                                }
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-sm">{resp.nome}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum responsável cadastrado</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias
                  </label>
                  <textarea
                    value={formData.alergias}
                    onChange={(e) => setFormData(prev => ({ ...prev, alergias: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Liste as alergias conhecidas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restrições Alimentares
                  </label>
                  <textarea
                    value={formData.restricoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, restricoes: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Restrições alimentares ou médicas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Observações gerais"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-medium"
                  >
                    {loading ? 'Salvando...' : (modalType === 'create' ? 'Criar Aluno' : 'Salvar Alterações')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}