import { useState, useEffect } from 'react'
import { X, Users, Calendar, GraduationCap } from 'lucide-react'
import { turmasApi, profilesApi, handleSupabaseError } from '../lib/api'

export default function TurmaForm({ isOpen, onClose, onSave, turma = null }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    idade_minima: '',
    idade_maxima: '',
    capacidade_maxima: '',
    professor_id: ''
  })
  
  const [professores, setProfessores] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchProfessores()
      
      if (turma) {
        setFormData({
          nome: turma.nome || '',
          descricao: turma.descricao || '',
          idade_minima: turma.idade_minima?.toString() || '',
          idade_maxima: turma.idade_maxima?.toString() || '',
          capacidade_maxima: turma.capacidade_maxima?.toString() || '',
          professor_id: turma.professor_id || ''
        })
      }
    }
  }, [isOpen, turma])

  const fetchProfessores = async () => {
    try {
      const data = await profilesApi.getByRole('professor')
      setProfessores(data)
    } catch (error) {
      console.error('Error fetching professores:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validações básicas
      if (!formData.nome) {
        throw new Error('Nome da turma é obrigatório')
      }

      // Converter números
      const dataToSave = {
        ...formData,
        idade_minima: formData.idade_minima ? parseInt(formData.idade_minima) : null,
        idade_maxima: formData.idade_maxima ? parseInt(formData.idade_maxima) : null,
        capacidade_maxima: formData.capacidade_maxima ? parseInt(formData.capacidade_maxima) : null,
        professor_id: formData.professor_id || null
      }

      let savedTurma
      
      if (turma?.id) {
        // Atualizar turma existente
        savedTurma = await turmasApi.update(turma.id, dataToSave)
      } else {
        // Criar nova turma
        savedTurma = await turmasApi.create(dataToSave)
      }

      onSave(savedTurma)
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
      descricao: '',
      idade_minima: '',
      idade_maxima: '',
      capacidade_maxima: '',
      professor_id: ''
    })
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {turma ? 'Editar Turma' : 'Adicionar Nova Turma'}
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
              <GraduationCap className="h-5 w-5 mr-2" />
              Informações da Turma
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Turma *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Berçário I, Maternal II, Jardim I"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição da turma, atividades, objetivos..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idade Mínima (meses)
                </label>
                <input
                  type="number"
                  name="idade_minima"
                  value={formData.idade_minima}
                  onChange={handleInputChange}
                  min="0"
                  max="72"
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 4 (4 meses)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idade Máxima (meses)
                </label>
                <input
                  type="number"
                  name="idade_maxima"
                  value={formData.idade_maxima}
                  onChange={handleInputChange}
                  min="0"
                  max="72"
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 12 (1 ano)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="h-4 w-4 inline mr-1" />
                  Capacidade Máxima
                </label>
                <input
                  type="number"
                  name="capacidade_maxima"
                  value={formData.capacidade_maxima}
                  onChange={handleInputChange}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professor Responsável
                </label>
                <select
                  name="professor_id"
                  value={formData.professor_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um professor...</option>
                  {professores.map(professor => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Referência de Idades
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Berçário I:</strong> 4-12 meses (até 1 ano)</p>
              <p><strong>Berçário II:</strong> 12-24 meses (1-2 anos)</p>
              <p><strong>Maternal I:</strong> 24-36 meses (2-3 anos)</p>
              <p><strong>Maternal II:</strong> 36-48 meses (3-4 anos)</p>
              <p><strong>Jardim I:</strong> 48-60 meses (4-5 anos)</p>
              <p><strong>Jardim II:</strong> 60-72 meses (5-6 anos)</p>
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
              {loading ? 'Salvando...' : (turma ? 'Atualizar' : 'Adicionar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}