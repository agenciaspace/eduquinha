import { useState, useEffect } from 'react'
import { X, Baby, Moon, Utensils, Heart, Thermometer, Droplets, Clock } from 'lucide-react'
import { rotinasApi, handleSupabaseError } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function RoutineForm({ isOpen, onClose, onSave, student, date = new Date().toISOString().split('T')[0] }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    // Alimentação
    mamadeira_qtd: 0,
    mamadeira_obs: '',
    almoco_comeu: false,
    almoco_obs: '',
    lanche_comeu: false,
    lanche_obs: '',
    jantar_comeu: false,
    jantar_obs: '',
    
    // Sono
    sono_manha_inicio: '',
    sono_manha_fim: '',
    sono_tarde_inicio: '',
    sono_tarde_fim: '',
    sono_obs: '',
    
    // Humor e comportamento
    humor: '',
    comportamento: '',
    
    // Higiene
    fraldas_trocadas: 0,
    evacuacao: false,
    evacuacao_obs: '',
    banho: false,
    
    // Saúde
    febre: false,
    temperatura: '',
    medicamento_dado: false,
    medicamento_obs: '',
    
    // Observações gerais
    observacoes_gerais: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingRoutine, setExistingRoutine] = useState(null)

  useEffect(() => {
    if (isOpen && student) {
      fetchExistingRoutine()
    }
  }, [isOpen, student, date])

  const fetchExistingRoutine = async () => {
    try {
      const routine = await rotinasApi.getByStudentAndDate(student.id, date)
      if (routine) {
        setExistingRoutine(routine)
        setFormData({
          mamadeira_qtd: routine.mamadeira_qtd || 0,
          mamadeira_obs: routine.mamadeira_obs || '',
          almoco_comeu: routine.almoco_comeu || false,
          almoco_obs: routine.almoco_obs || '',
          lanche_comeu: routine.lanche_comeu || false,
          lanche_obs: routine.lanche_obs || '',
          jantar_comeu: routine.jantar_comeu || false,
          jantar_obs: routine.jantar_obs || '',
          sono_manha_inicio: routine.sono_manha_inicio || '',
          sono_manha_fim: routine.sono_manha_fim || '',
          sono_tarde_inicio: routine.sono_tarde_inicio || '',
          sono_tarde_fim: routine.sono_tarde_fim || '',
          sono_obs: routine.sono_obs || '',
          humor: routine.humor || '',
          comportamento: routine.comportamento || '',
          fraldas_trocadas: routine.fraldas_trocadas || 0,
          evacuacao: routine.evacuacao || false,
          evacuacao_obs: routine.evacuacao_obs || '',
          banho: routine.banho || false,
          febre: routine.febre || false,
          temperatura: routine.temperatura?.toString() || '',
          medicamento_dado: routine.medicamento_dado || false,
          medicamento_obs: routine.medicamento_obs || '',
          observacoes_gerais: routine.observacoes_gerais || ''
        })
      }
    } catch (error) {
      console.error('Error fetching existing routine:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNumberChange = (name, increment) => {
    setFormData(prev => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + increment)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const dataToSave = {
        aluno_id: student.id,
        professor_id: user.id,
        data: date,
        ...formData,
        temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null
      }

      const savedRoutine = await rotinasApi.upsert(dataToSave)
      onSave(savedRoutine)
      onClose()
      
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !student) return null

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Rotina de {student.nome}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(date)}
            </p>
          </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Alimentação */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Utensils className="h-5 w-5 mr-2 text-green-600" />
                Alimentação
              </h3>
              
              <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Baby className="h-4 w-4 inline mr-1" />
                    Mamadeiras
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleNumberChange('mamadeira_qtd', -1)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center">
                      {formData.mamadeira_qtd}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNumberChange('mamadeira_qtd', 1)}
                      className="w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <textarea
                    name="mamadeira_obs"
                    value={formData.mamadeira_obs}
                    onChange={handleInputChange}
                    rows={2}
                    className="mt-2 w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="Observações sobre as mamadeiras..."
                  />
                </div>

                {['almoco', 'lanche', 'jantar'].map((refeicao) => (
                  <div key={refeicao}>
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        name={`${refeicao}_comeu`}
                        checked={formData[`${refeicao}_comeu`]}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {refeicao === 'almoco' ? 'Almoço' : refeicao}
                      </label>
                    </div>
                    <textarea
                      name={`${refeicao}_obs`}
                      value={formData[`${refeicao}_obs`]}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder={`Observações sobre o ${refeicao}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sono */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Moon className="h-5 w-5 mr-2 text-blue-600" />
                Sono
              </h3>
              
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sono da Manhã
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Início</label>
                      <input
                        type="time"
                        name="sono_manha_inicio"
                        value={formData.sono_manha_inicio}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Fim</label>
                      <input
                        type="time"
                        name="sono_manha_fim"
                        value={formData.sono_manha_fim}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sono da Tarde
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Início</label>
                      <input
                        type="time"
                        name="sono_tarde_inicio"
                        value={formData.sono_tarde_inicio}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Fim</label>
                      <input
                        type="time"
                        name="sono_tarde_fim"
                        value={formData.sono_tarde_fim}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <textarea
                  name="sono_obs"
                  value={formData.sono_obs}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Observações sobre o sono..."
                />
              </div>
            </div>

            {/* Humor e Comportamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-pink-600" />
                Humor e Comportamento
              </h3>
              
              <div className="space-y-4 bg-pink-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Humor
                  </label>
                  <select
                    name="humor"
                    value={formData.humor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="feliz">😊 Feliz</option>
                    <option value="triste">😢 Triste</option>
                    <option value="irritado">😠 Irritado</option>
                    <option value="calmo">😌 Calmo</option>
                    <option value="agitado">😤 Agitado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comportamento
                  </label>
                  <textarea
                    name="comportamento"
                    value={formData.comportamento}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    placeholder="Como a criança se comportou hoje..."
                  />
                </div>
              </div>
            </div>

            {/* Higiene */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-cyan-600" />
                Higiene
              </h3>
              
              <div className="space-y-4 bg-cyan-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fraldas Trocadas
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleNumberChange('fraldas_trocadas', -1)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center">
                      {formData.fraldas_trocadas}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNumberChange('fraldas_trocadas', 1)}
                      className="w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="evacuacao"
                      checked={formData.evacuacao}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Evacuação
                    </label>
                  </div>
                  <textarea
                    name="evacuacao_obs"
                    value={formData.evacuacao_obs}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="Observações sobre evacuação..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="banho"
                    checked={formData.banho}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Banho
                  </label>
                </div>
              </div>
            </div>

            {/* Saúde */}
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-red-600" />
                Saúde
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="febre"
                      checked={formData.febre}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Febre
                    </label>
                  </div>
                  
                  {formData.febre && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperatura (°C)
                      </label>
                      <input
                        type="number"
                        name="temperatura"
                        value={formData.temperatura}
                        onChange={handleInputChange}
                        step="0.1"
                        min="35"
                        max="42"
                        className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="37.5"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="medicamento_dado"
                      checked={formData.medicamento_dado}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Medicamento Administrado
                    </label>
                  </div>
                  
                  {formData.medicamento_dado && (
                    <textarea
                      name="medicamento_obs"
                      value={formData.medicamento_obs}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="Qual medicamento, dosagem e horário..."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Observações Gerais */}
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Observações Gerais
              </h3>
              
              <textarea
                name="observacoes_gerais"
                value={formData.observacoes_gerais}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Outras observações importantes sobre o dia da criança..."
              />
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
              {loading ? 'Salvando...' : (existingRoutine ? 'Atualizar Rotina' : 'Salvar Rotina')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}