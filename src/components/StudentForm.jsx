import { useState, useEffect } from 'react'
import { X, Calendar, Users, MapPin, AlertTriangle, FileText } from 'lucide-react'
import { alunosApi, turmasApi, profilesApi, handleSupabaseError } from '../lib/api'

export default function StudentForm({ isOpen, onClose, onSave, student = null }) {
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    genero: '',
    endereco: '',
    turma_id: '',
    observacoes_medicas: '',
    alergias: '',
    medicamentos: '',
    contato_emergencia: '',
    telefone_emergencia: ''
  })
  
  const [turmas, setTurmas] = useState([])
  const [responsaveis, setResponsaveis] = useState([])
  const [selectedResponsaveis, setSelectedResponsaveis] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchTurmas()
      fetchResponsaveis()
      
      if (student) {
        setFormData({
          nome: student.nome || '',
          data_nascimento: student.data_nascimento || '',
          genero: student.genero || '',
          endereco: student.endereco || '',
          turma_id: student.turma_id || '',
          observacoes_medicas: student.observacoes_medicas || '',
          alergias: student.alergias || '',
          medicamentos: student.medicamentos || '',
          contato_emergencia: student.contato_emergencia || '',
          telefone_emergencia: student.telefone_emergencia || ''
        })
        
        // Se editando, carregar responsáveis atuais
        if (student.responsaveis) {
          setSelectedResponsaveis(student.responsaveis.map(r => ({
            id: r.profiles.id,
            nome: r.profiles.nome,
            parentesco: r.parentesco,
            responsavel_financeiro: r.responsavel_financeiro
          })))
        }
      }
    }
  }, [isOpen, student])

  const fetchTurmas = async () => {
    try {
      const data = await turmasApi.getAll()
      setTurmas(data)
    } catch (error) {
      console.error('Error fetching turmas:', error)
    }
  }

  const fetchResponsaveis = async () => {
    try {
      const data = await profilesApi.getByRole('responsavel')
      setResponsaveis(data)
    } catch (error) {
      console.error('Error fetching responsaveis:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addResponsavel = () => {
    setSelectedResponsaveis(prev => [...prev, {
      id: '',
      nome: '',
      parentesco: '',
      responsavel_financeiro: false
    }])
  }

  const updateResponsavel = (index, field, value) => {
    setSelectedResponsaveis(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      
      // If selecting a responsavel, update the nome
      if (field === 'id') {
        const responsavel = responsaveis.find(r => r.id === value)
        if (responsavel) {
          updated[index].nome = responsavel.nome
        }
      }
      
      return updated
    })
  }

  const removeResponsavel = (index) => {
    setSelectedResponsaveis(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validações básicas
      if (!formData.nome || !formData.data_nascimento) {
        throw new Error('Nome e data de nascimento são obrigatórios')
      }

      if (selectedResponsaveis.length === 0) {
        throw new Error('Pelo menos um responsável deve ser selecionado')
      }

      // Verificar se pelo menos um responsável é financeiro
      const hasFinancialResponsible = selectedResponsaveis.some(r => r.responsavel_financeiro)
      if (!hasFinancialResponsible) {
        throw new Error('Pelo menos um responsável deve ser o responsável financeiro')
      }

      let savedStudent
      
      if (student?.id) {
        // Atualizar aluno existente
        savedStudent = await alunosApi.update(student.id, formData)
      } else {
        // Criar novo aluno
        savedStudent = await alunosApi.create(formData)
      }

      // TODO: Implementar relacionamento responsável-aluno
      // Isso requer uma função na API para gerenciar a tabela aluno_responsavel

      onSave(savedStudent)
      onClose()
      resetForm()
      
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      data_nascimento: '',
      genero: '',
      endereco: '',
      turma_id: '',
      observacoes_medicas: '',
      alergias: '',
      medicamentos: '',
      contato_emergencia: '',
      telefone_emergencia: ''
    })
    setSelectedResponsaveis([])
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {student ? 'Editar Aluno' : 'Adicionar Novo Aluno'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gênero
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turma
                </label>
                <select
                  name="turma_id"
                  value={formData.turma_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma turma...</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Endereço
              </label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
          </div>

          {/* Responsáveis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Responsáveis</h3>
              <button
                type="button"
                onClick={addResponsavel}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Adicionar Responsável
              </button>
            </div>

            {selectedResponsaveis.map((resp, index) => (
              <div key={index} className="bg-gray-100 rounded-md p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsável
                    </label>
                    <select
                      value={resp.id}
                      onChange={(e) => updateResponsavel(index, 'id', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {responsaveis.map(responsavel => (
                        <option key={responsavel.id} value={responsavel.id}>
                          {responsavel.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parentesco
                    </label>
                    <select
                      value={resp.parentesco}
                      onChange={(e) => updateResponsavel(index, 'parentesco', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="pai">Pai</option>
                      <option value="mãe">Mãe</option>
                      <option value="avô">Avô</option>
                      <option value="avó">Avó</option>
                      <option value="tio">Tio</option>
                      <option value="tia">Tia</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={resp.responsavel_financeiro}
                        onChange={(e) => updateResponsavel(index, 'responsavel_financeiro', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Resp. Financeiro</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeResponsavel(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Informações Médicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Informações Médicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias
                </label>
                <textarea
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva alergias conhecidas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicamentos
                </label>
                <textarea
                  name="medicamentos"
                  value={formData.medicamentos}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Medicamentos em uso..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Observações Médicas
              </label>
              <textarea
                name="observacoes_medicas"
                value={formData.observacoes_medicas}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Outras observações médicas importantes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contato de Emergência
                </label>
                <input
                  type="text"
                  name="contato_emergencia"
                  value={formData.contato_emergencia}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do contato"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone de Emergência
                </label>
                <input
                  type="tel"
                  name="telefone_emergencia"
                  value={formData.telefone_emergencia}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (student ? 'Atualizar' : 'Adicionar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}