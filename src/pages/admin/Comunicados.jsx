import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Filter, MessageSquare, Send, Users, AlertCircle, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import InputField from '../../components/InputField'
import { useAuth } from '../../contexts/AuthContext'

export default function Comunicados() {
  const { profile } = useAuth()
  const [comunicados, setComunicados] = useState([])
  const [filteredComunicados, setFilteredComunicados] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('todos')
  const [selectedStatus, setSelectedStatus] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [selectedComunicado, setSelectedComunicado] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'geral',
    destinatarios: 'todos',
    prioridade: 'normal'
  })
  const [isCreating, setIsCreating] = useState(false)

  // Tipos de comunicados
  const tiposOptions = [
    { id: 'todos', nome: 'Todos os Tipos' },
    { id: 'geral', nome: 'Comunicado Geral' },
    { id: 'urgente', nome: 'Urgente' },
    { id: 'evento', nome: 'Evento' },
    { id: 'reuniao', nome: 'Reunião' },
    { id: 'aviso', nome: 'Aviso' }
  ]

  // Status
  const statusOptions = [
    { id: 'todos', nome: 'Todos os Status' },
    { id: 'rascunho', nome: 'Rascunho' },
    { id: 'enviado', nome: 'Enviado' },
    { id: 'programado', nome: 'Programado' }
  ]

  useEffect(() => {
    fetchComunicados()
  }, [])

  useEffect(() => {
    let filtered = comunicados

    // Filtro por tipo
    if (selectedTipo !== 'todos') {
      filtered = filtered.filter(comunicado => comunicado.tipo === selectedTipo)
    }

    // Filtro por status
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(comunicado => comunicado.status === selectedStatus)
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(comunicado =>
        comunicado.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comunicado.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comunicado.autor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredComunicados(filtered)
  }, [searchTerm, selectedTipo, selectedStatus, comunicados])

  const fetchComunicados = async () => {
    try {
      // Buscar comunicados do banco
      const { data: comunicadosData, error } = await supabase
        .from('comunicados')
        .select(`
          *,
          autor:profiles(nome)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Buscar turmas para adicionar dados de exemplo
      const { data: turmasData } = await supabase
        .from('turmas')
        .select('id, nome')
      
      console.log('Turmas disponíveis:', turmasData)

      // Formatar comunicados com dados fictícios adicionais
      const comunicadosFormatados = [
        // Comunicados reais do banco
        ...comunicadosData.map(comunicado => ({
          id: comunicado.id,
          titulo: comunicado.titulo,
          mensagem: comunicado.mensagem,
          tipo: 'geral',
          status: 'enviado',
          autor: comunicado.autor?.nome || 'Sistema',
          dataEnvio: comunicado.created_at,
          destinatarios: Math.floor(Math.random() * 50) + 20,
          visualizacoes: Math.floor(Math.random() * 40) + 10,
          turmasDestino: ['Todas as turmas'],
          prioridade: 'normal',
          icone: '📢'
        })),
        // Comunicados fictícios para demonstração
        {
          id: 'comunicado-1',
          titulo: 'Reunião de Pais - Maternal I',
          mensagem: 'Prezados pais e responsáveis do Maternal I, informamos que será realizada reunião no dia 20/01/2025 às 19h30 para apresentação do projeto pedagógico do primeiro semestre.',
          tipo: 'reuniao',
          status: 'programado',
          autor: 'Maria Santos - Professora',
          dataEnvio: '2025-01-18T10:00:00',
          destinatarios: 15,
          visualizacoes: 0,
          turmasDestino: ['Maternal I'],
          prioridade: 'alta',
          icone: '👥'
        },
        {
          id: 'comunicado-2',
          titulo: 'URGENTE: Mudança no horário de saída',
          mensagem: 'Devido às condições climáticas, o horário de saída de hoje será antecipado para 16h. Por favor, organizem-se para buscar as crianças no novo horário.',
          tipo: 'urgente',
          status: 'enviado',
          autor: 'Ana Silva - Diretora',
          dataEnvio: '2025-01-13T13:30:00',
          destinatarios: 80,
          visualizacoes: 75,
          turmasDestino: ['Todas as turmas'],
          prioridade: 'urgente',
          icone: '🚨'
        },
        {
          id: 'comunicado-3',
          titulo: 'Festa Junina 2025 - Participação das famílias',
          mensagem: 'Queridas famílias, nossa tradicional Festa Junina acontecerá no dia 21 de junho. Contamos com a participação de todos! Em breve enviaremos mais detalhes sobre as apresentações e como cada turma pode participar.',
          tipo: 'evento',
          status: 'rascunho',
          autor: 'Coordenação Pedagógica',
          dataEnvio: null,
          destinatarios: 0,
          visualizacoes: 0,
          turmasDestino: ['Todas as turmas'],
          prioridade: 'normal',
          icone: '🎪'
        },
        {
          id: 'comunicado-4',
          titulo: 'Lista de material escolar - Jardim II',
          mensagem: 'Segue em anexo a lista de materiais escolares para o segundo semestre do Jardim II. Os materiais devem ser entregues até o dia 30 de julho.',
          tipo: 'aviso',
          status: 'enviado',
          autor: 'Secretaria',
          dataEnvio: '2025-01-10T09:00:00',
          destinatarios: 18,
          visualizacoes: 16,
          turmasDestino: ['Jardim II'],
          prioridade: 'normal',
          icone: '📝'
        }
      ]

      setComunicados(comunicadosFormatados)
    } catch (error) {
      console.error('Error:', error)
      setComunicados([])
    }
  }

  const handleViewComunicado = (comunicado) => {
    setSelectedComunicado(comunicado)
    setShowModal(true)
  }

  const handleCreateComunicado = async (e) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const { error } = await supabase
        .from('comunicados')
        .insert({
          titulo: formData.titulo,
          conteudo: formData.mensagem,
          tipo: formData.tipo,
          prioridade: formData.prioridade,
          target_audience: formData.destinatarios,
          autor_id: profile?.id,
          escola_id: profile?.escola_id,
          status: 'enviado'
        })

      if (error) throw error

      // Fechar modal e recarregar lista
      setShowCreateModal(false)
      setFormData({
        titulo: '',
        mensagem: '',
        tipo: 'geral',
        destinatarios: 'todos',
        prioridade: 'normal'
      })
      fetchComunicados()
      
      alert('Comunicado enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar comunicado:', error)
      alert('Erro ao criar comunicado: ' + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const formatarData = (data) => {
    if (!data) return 'Não enviado'
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obterStatusInfo = (status) => {
    switch (status) {
      case 'enviado':
        return { text: 'Enviado', color: 'text-green-600', bg: 'bg-green-100' }
      case 'programado':
        return { text: 'Programado', color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'rascunho':
        return { text: 'Rascunho', color: 'text-gray-600', bg: 'bg-gray-100' }
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const obterPrioridadeInfo = (prioridade) => {
    switch (prioridade) {
      case 'urgente':
        return { text: 'Urgente', color: 'text-red-600', bg: 'bg-red-100' }
      case 'alta':
        return { text: 'Alta', color: 'text-orange-600', bg: 'bg-orange-100' }
      case 'normal':
        return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-100' }
      default:
        return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-100' }
    }
  }

  const calcularTaxaVisualizacao = (visualizacoes, destinatarios) => {
    if (destinatarios === 0) return 0
    return Math.round((visualizacoes / destinatarios) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comunicados</h1>
            <p className="text-lg text-gray-600 mt-2">Gerencie comunicações com pais e responsáveis</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Comunicado
          </button>
        </div>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Comunicados</p>
                <p className="text-2xl font-bold text-gray-900">{comunicados.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <MessageSquare className="w-5 h-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {comunicados.filter(c => c.status === 'enviado').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100">
                <Send className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comunicados.filter(c => c.status === 'rascunho').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                <Edit2 className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Visualização</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    comunicados
                      .filter(c => c.status === 'enviado')
                      .reduce((sum, c) => sum + calcularTaxaVisualizacao(c.visualizacoes, c.destinatarios), 0) /
                    (comunicados.filter(c => c.status === 'enviado').length || 1)
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
                placeholder="Buscar por título, conteúdo ou autor..."
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
                {tiposOptions.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pl-12 pr-8 appearance-none cursor-pointer"
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

        {/* Lista Premium de Comunicados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComunicados.map((comunicado) => {
            const statusInfo = obterStatusInfo(comunicado.status)
            const prioridadeInfo = obterPrioridadeInfo(comunicado.prioridade)

            return (
              <div key={comunicado.id} className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{comunicado.icone}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{comunicado.titulo}</h3>
                    <p className="text-sm text-gray-600">{comunicado.autor}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  {comunicado.prioridade !== 'normal' && (
                    <span className={`text-xs px-2 py-1 rounded-full ${prioridadeInfo.bg} ${prioridadeInfo.color}`}>
                      {prioridadeInfo.text}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">{comunicado.mensagem}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{comunicado.destinatarios} destinatários</span>
                </div>

                {comunicado.status === 'enviado' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{comunicado.visualizacoes} visualizações ({calcularTaxaVisualizacao(comunicado.visualizacoes, comunicado.destinatarios)}%)</span>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500">Turmas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {comunicado.turmasDestino.map((turma, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-edu-blue-light text-edu-blue rounded-full">
                        {turma}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-600 capitalize">
                    <strong>{comunicado.tipo}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatarData(comunicado.dataEnvio)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewComunicado(comunicado)}
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

      {filteredComunicados.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum comunicado encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou crie um novo comunicado</p>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showModal && selectedComunicado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Detalhes do Comunicado</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-2">{selectedComunicado.icone}</div>
                  <h3 className="text-xl font-semibold">{selectedComunicado.titulo}</h3>
                  <p className="text-gray-600">Por {selectedComunicado.autor}</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${obterStatusInfo(selectedComunicado.status).bg} ${obterStatusInfo(selectedComunicado.status).color}`}>
                      {obterStatusInfo(selectedComunicado.status).text}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${obterPrioridadeInfo(selectedComunicado.prioridade).bg} ${obterPrioridadeInfo(selectedComunicado.prioridade).color}`}>
                      {obterPrioridadeInfo(selectedComunicado.prioridade).text}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3">Mensagem</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedComunicado.mensagem}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Informações de Envio</h4>
                    <div className="space-y-2">
                      <p><strong>Data/Hora:</strong> {formatarData(selectedComunicado.dataEnvio)}</p>
                      <p><strong>Tipo:</strong> {selectedComunicado.tipo}</p>
                      <p><strong>Destinatários:</strong> {selectedComunicado.destinatarios}</p>
                      {selectedComunicado.status === 'enviado' && (
                        <>
                          <p><strong>Visualizações:</strong> {selectedComunicado.visualizacoes}</p>
                          <p><strong>Taxa de abertura:</strong> {calcularTaxaVisualizacao(selectedComunicado.visualizacoes, selectedComunicado.destinatarios)}%</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Turmas Destinatárias</h4>
                    <div className="space-y-1">
                      {selectedComunicado.turmasDestino.map((turma, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{turma}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {selectedComunicado.status === 'rascunho' && (
                  <button className="flex-1 btn-primary py-2">
                    Enviar Comunicado
                  </button>
                )}
                {selectedComunicado.status === 'enviado' && (
                  <button className="flex-1 btn-secondary py-2">
                    Reenviar
                  </button>
                )}
                <button className="flex-1 btn-secondary py-2">
                  Editar
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary py-2"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Comunicado */}
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
                <h2 className="text-2xl font-bold">Novo Comunicado</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      titulo: '',
                      mensagem: '',
                      tipo: 'geral',
                      destinatarios: 'todos',
                      prioridade: 'normal'
                    })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateComunicado} className="space-y-4">
                <InputField
                  label="Título do Comunicado"
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  placeholder="Digite o título do comunicado"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Digite a mensagem completa do comunicado..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Comunicado
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="geral">Comunicado Geral</option>
                      <option value="urgente">Urgente</option>
                      <option value="evento">Evento</option>
                      <option value="reuniao">Reunião</option>
                      <option value="aviso">Aviso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinatários
                  </label>
                  <select
                    value={formData.destinatarios}
                    onChange={(e) => setFormData({ ...formData, destinatarios: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos os Pais</option>
                    <option value="bercario">Pais do Berçário</option>
                    <option value="maternal">Pais do Maternal</option>
                    <option value="jardim">Pais do Jardim</option>
                    <option value="pre">Pais da Pré-escola</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isCreating ? 'Enviando...' : 'Enviar Comunicado'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({
                        titulo: '',
                        mensagem: '',
                        tipo: 'geral',
                        destinatarios: 'todos',
                        prioridade: 'normal'
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