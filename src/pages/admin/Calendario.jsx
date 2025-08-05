import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Filter, Clock, Users, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import InputField from '../../components/InputField'
import { useAuth } from '../../contexts/AuthContext'

export default function Calendario() {
  const { profile } = useAuth()
  const [eventos, setEventos] = useState([])
  const [filteredEventos, setFilteredEventos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('todos')
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth())
  const [showModal, setShowModal] = useState(false)
  const [selectedEvento, setSelectedEvento] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    horario: '',
    tipo: 'evento',
    local: ''
  })
  const [isCreating, setIsCreating] = useState(false)

  // Tipos de eventos
  const tiposEventos = [
    { id: 'todos', nome: 'Todos os Tipos' },
    { id: 'reuniao', nome: 'Reuniões' },
    { id: 'atividade', nome: 'Atividades' },
    { id: 'evento', nome: 'Eventos Especiais' },
    { id: 'feriado', nome: 'Feriados' }
  ]

  // Meses
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  useEffect(() => {
    fetchEventos()
  }, [])

  useEffect(() => {
    if (eventos.length > 0) {
      filterEventos()
    } else {
      setFilteredEventos([])
    }
  }, [searchTerm, selectedTipo, selectedMes, eventos])

  const fetchEventos = async () => {
    try {
      // Buscar atividades do banco como base para eventos
      const { data: atividadesData, error } = await supabase
        .from('atividades')
        .select(`
          *,
          turma:turmas(nome),
          criador:profiles(nome)
        `)
        .order('data')

      if (error) throw error

      // Converter atividades em eventos e adicionar eventos fictícios
      const eventosFormatados = [
        // Eventos reais do banco
        ...atividadesData.map(atividade => ({
          id: atividade.id,
          titulo: atividade.titulo,
          descricao: atividade.descricao,
          data: atividade.data,
          hora: '09:00',
          tipo: 'atividade',
          turma: atividade.turma?.nome || 'Todas as turmas',
          responsavel: atividade.criador?.nome || 'Sistema',
          participantes: Math.floor(Math.random() * 30) + 10,
          local: 'Sala de atividades',
          icone: '🎨'
        })),
        // Eventos fictícios para demonstração
        {
          id: 'evento-1',
          titulo: 'Reunião de Pais e Mestres',
          descricao: 'Reunião trimestral para apresentação do desenvolvimento dos alunos',
          data: '2025-01-15',
          hora: '19:30',
          tipo: 'reuniao',
          turma: 'Todas as turmas',
          responsavel: 'Direção',
          participantes: 45,
          local: 'Auditório principal',
          icone: '👥'
        },
        {
          id: 'evento-2',
          titulo: 'Festa Junina',
          descricao: 'Festa tradicional com quadrilha, comidas típicas e brincadeiras',
          data: '2025-06-21',
          hora: '14:00',
          tipo: 'evento',
          turma: 'Todas as turmas',
          responsavel: 'Coordenação Pedagógica',
          participantes: 120,
          local: 'Pátio da escola',
          icone: '🎪'
        },
        {
          id: 'evento-3',
          titulo: 'Dia das Crianças',
          descricao: 'Atividades especiais e recreação para celebrar o Dia das Crianças',
          data: '2025-10-12',
          hora: '08:00',
          tipo: 'evento',
          turma: 'Todas as turmas',
          responsavel: 'Professores',
          participantes: 80,
          local: 'Toda a escola',
          icone: '🎈'
        },
        {
          id: 'evento-4',
          titulo: 'Formatura do Jardim II',
          descricao: 'Cerimônia de formatura dos alunos que seguirão para o ensino fundamental',
          data: '2025-12-15',
          hora: '18:00',
          tipo: 'evento',
          turma: 'Jardim II',
          responsavel: 'Direção',
          participantes: 25,
          local: 'Auditório principal',
          icone: '🎓'
        }
      ]

      setEventos(eventosFormatados)
    } catch (error) {
      console.error('Error:', error)
      setEventos([])
    }
  }

  const filterEventos = () => {
    let filtered = eventos

    // Filtro por tipo
    if (selectedTipo !== 'todos') {
      filtered = filtered.filter(evento => evento.tipo === selectedTipo)
    }

    // Filtro por mês
    filtered = filtered.filter(evento => {
      const eventoMes = new Date(evento.data).getMonth()
      return eventoMes === selectedMes
    })

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(evento =>
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEventos(filtered)
  }

  const handleViewEvento = (evento) => {
    setSelectedEvento(evento)
    setShowModal(true)
  }

  const handleCreateEvento = async (e) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const { error } = await supabase
        .from('eventos')
        .insert({
          titulo: formData.titulo,
          descricao: formData.descricao,
          data: formData.data,
          horario: formData.horario,
          tipo: formData.tipo,
          local: formData.local,
          criador_id: profile?.id,
          escola_id: profile?.escola_id,
          status: 'agendado'
        })

      if (error) throw error

      // Fechar modal e recarregar lista
      setShowCreateModal(false)
      setFormData({
        titulo: '',
        descricao: '',
        data: '',
        horario: '',
        tipo: 'evento',
        local: ''
      })
      fetchEventos()
      
      alert('Evento criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      alert('Erro ao criar evento: ' + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const obterStatusEvento = (data) => {
    const hoje = new Date()
    const dataEvento = new Date(data)
    
    if (dataEvento < hoje) {
      return { text: 'Realizado', color: 'text-gray-600', bg: 'bg-gray-100' }
    } else if (dataEvento.toDateString() === hoje.toDateString()) {
      return { text: 'Hoje', color: 'text-blue-600', bg: 'bg-blue-100' }
    } else {
      return { text: 'Agendado', color: 'text-green-600', bg: 'bg-green-100' }
    }
  }

  const calcularDiasRestantes = (data) => {
    const hoje = new Date()
    const dataEvento = new Date(data)
    const diffTime = dataEvento - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Finalizado'
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Amanhã'
    return `Em ${diffDays} dias`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
            <p className="text-lg text-gray-600 mt-2">Gerencie eventos, atividades e compromissos</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos este Mês</p>
                <p className="text-2xl font-bold text-gray-900">{filteredEventos.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <CalendarIcon className="w-5 h-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos Eventos</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {eventos.filter(e => new Date(e.data) > new Date()).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100">
                <Clock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participantes Esperados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredEventos.reduce((sum, evento) => sum + evento.participantes, 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                <Users className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Realizados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {eventos.filter(e => new Date(e.data) < new Date()).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                <CalendarIcon className="w-5 h-5 text-orange-600" aria-hidden="true" />
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
                placeholder="Buscar por título, descrição ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
          <div className="flex gap-4">
            <div className="relative">
              
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pl-12 pr-8 appearance-none cursor-pointer"
              >
                {tiposEventos.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(parseInt(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pl-12 pr-8 appearance-none cursor-pointer"
              >
                {meses.map((mes, index) => (
                  <option key={index} value={index}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>
        </div>

        {/* Lista Premium de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventos.map((evento) => {
            const status = obterStatusEvento(evento.data)

            return (
              <div key={evento.id} className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{evento.icone}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{evento.titulo}</h3>
                      <p className="text-sm text-gray-600">{formatarData(evento.data)}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                    {status.text}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{evento.hora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{evento.local}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{evento.participantes} participantes</span>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Responsável</p>
                    <p className="text-sm font-medium">{evento.responsavel}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-gray-600">
                      <strong>{evento.turma}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      {calcularDiasRestantes(evento.data)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewEvento(evento)}
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

      {filteredEventos.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou crie um novo evento</p>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showModal && selectedEvento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Detalhes do Evento</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-2">{selectedEvento.icone}</div>
                  <h3 className="text-xl font-semibold">{selectedEvento.titulo}</h3>
                  <p className="text-gray-600">{formatarData(selectedEvento.data)} às {selectedEvento.hora}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3">Descrição</h4>
                  <p className="text-gray-600">{selectedEvento.descricao}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Informações</h4>
                    <div className="space-y-2">
                      <p><strong>Local:</strong> {selectedEvento.local}</p>
                      <p><strong>Responsável:</strong> {selectedEvento.responsavel}</p>
                      <p><strong>Turma:</strong> {selectedEvento.turma}</p>
                      <p><strong>Participantes:</strong> {selectedEvento.participantes}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${obterStatusEvento(selectedEvento.data).bg} ${obterStatusEvento(selectedEvento.data).color}`}>
                          {obterStatusEvento(selectedEvento.data).text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{calcularDiasRestantes(selectedEvento.data)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Editar Evento
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

      {/* Modal de Criação de Evento */}
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
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Novo Evento</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      titulo: '',
                      descricao: '',
                      data: '',
                      horario: '',
                      tipo: 'evento',
                      local: ''
                    })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEvento} className="space-y-4">
                <InputField
                  label="Título do Evento"
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  placeholder="Digite o título do evento"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Descreva o evento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                    icon={Calendar}
                  />

                  <InputField
                    label="Horário"
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    required
                    icon={Clock}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="evento">Evento Especial</option>
                      <option value="reuniao">Reunião</option>
                      <option value="atividade">Atividade</option>
                      <option value="feriado">Feriado</option>
                    </select>
                  </div>

                  <InputField
                    label="Local"
                    type="text"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    placeholder="Local do evento"
                    icon={MapPin}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 btn-primary py-3 disabled:opacity-50"
                  >
                    {isCreating ? 'Criando...' : 'Criar Evento'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({
                        titulo: '',
                        descricao: '',
                        data: '',
                        horario: '',
                        tipo: 'evento',
                        local: ''
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
      </div>
    </div>
  )
}