import { useState, useEffect } from 'react'
import { Search, Download, Filter, BarChart3, PieChart, TrendingUp, Calendar, Users, Baby, BookOpen } from 'lucide-react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import InputField from '../../components/InputField'

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([])
  const [filteredRelatorios, setFilteredRelatorios] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('todos')
  const [selectedPeriodo, setSelectedPeriodo] = useState('mes_atual')
  const [estatisticas, setEstatisticas] = useState({})

  // Tipos de relatórios
  const tiposRelatorios = [
    { id: 'todos', nome: 'Todos os Relatórios' },
    { id: 'frequencia', nome: 'Frequência' },
    { id: 'financeiro', nome: 'Financeiro' },
    { id: 'pedagogico', nome: 'Pedagógico' },
    { id: 'operacional', nome: 'Operacional' }
  ]

  // Períodos
  const periodosOptions = [
    { id: 'mes_atual', nome: 'Mês Atual' },
    { id: 'mes_anterior', nome: 'Mês Anterior' },
    { id: 'trimestre', nome: 'Último Trimestre' },
    { id: 'semestre', nome: 'Último Semestre' },
    { id: 'ano', nome: 'Ano Letivo' }
  ]

  useEffect(() => {
    fetchEstatisticas()
    generateRelatorios()
  }, [])

  useEffect(() => {
    let filtered = relatorios

    // Filtro por tipo
    if (selectedTipo !== 'todos') {
      filtered = filtered.filter(relatorio => relatorio.tipo === selectedTipo)
    }

    // Filtro por período
    if (selectedPeriodo !== 'todos') {
      const hoje = new Date()
      let dataLimite
      
      switch (selectedPeriodo) {
        case 'mes_atual':
          dataLimite = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
          break
        case 'mes_anterior':
          dataLimite = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
          break
        case 'trimestre':
          dataLimite = new Date(hoje.setMonth(hoje.getMonth() - 3))
          break
        case 'semestre':
          dataLimite = new Date(hoje.setMonth(hoje.getMonth() - 6))
          break
        case 'ano':
          dataLimite = new Date(hoje.getFullYear(), 0, 1)
          break
        default:
          dataLimite = null
      }
      
      if (dataLimite) {
        filtered = filtered.filter(relatorio => new Date(relatorio.dataGeracao) >= dataLimite)
      }
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(relatorio =>
        relatorio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        relatorio.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRelatorios(filtered)
  }, [searchTerm, selectedTipo, selectedPeriodo, relatorios])

  const fetchEstatisticas = async () => {
    try {
      // Buscar dados para estatísticas
      const [alunosRes, professoresRes, turmasRes, presencasRes] = await Promise.all([
        supabase.from('alunos').select('id').limit(1000),
        supabase.from('profiles').select('id').eq('role', 'professor'),
        supabase.from('turmas').select('id, capacidade'),
        supabase.from('presencas').select('presente').eq('data', new Date().toISOString().split('T')[0])
      ])

      const totalAlunos = alunosRes.data?.length || 0
      const totalProfessores = professoresRes.data?.length || 0
      const totalTurmas = turmasRes.data?.length || 0
      const presencasHoje = presencasRes.data?.filter(p => p.presente).length || 0
      const totalPresencasHoje = presencasRes.data?.length || 0

      setEstatisticas({
        totalAlunos,
        totalProfessores,
        totalTurmas,
        presencaHoje: totalPresencasHoje > 0 ? Math.round((presencasHoje / totalPresencasHoje) * 100) : 0,
        ocupacaoTurmas: turmasRes.data?.length > 0 ? 
          Math.round((totalAlunos / turmasRes.data.reduce((sum, t) => sum + (t.capacidade || 20), 0)) * 100) : 0
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const generateRelatorios = () => {
    const relatoriosDisponiveis = [
      {
        id: 'rel-freq-001',
        titulo: 'Relatório de Frequência Mensal',
        descricao: 'Análise detalhada da frequência dos alunos por turma no último mês',
        tipo: 'frequencia',
        periodo: 'mes_atual',
        dataGeracao: new Date().toISOString(),
        tamanho: '245 KB',
        formato: 'PDF',
        status: 'disponivel',
        icone: '📊',
        dados: {
          frequenciaMedia: '94%',
          totalAlunos: 127,
          diasLetivos: 22,
          ausenciasJustificadas: 45
        }
      },
      {
        id: 'rel-fin-002',
        titulo: 'Relatório Financeiro - Janeiro 2025',
        descricao: 'Resumo de receitas, despesas e inadimplência do mês',
        tipo: 'financeiro',
        periodo: 'mes_atual',
        dataGeracao: new Date().toISOString(),
        tamanho: '156 KB',
        formato: 'PDF',
        status: 'disponivel',
        icone: '💰',
        dados: {
          receitaTotal: 'R$ 45.230,00',
          inadimplencia: '8%',
          totalCobrancas: 89,
          pagamentosRecebidos: 82
        }
      },
      {
        id: 'rel-ped-003',
        titulo: 'Relatório Pedagógico - Desenvolvimento Infantil',
        descricao: 'Avaliação do desenvolvimento das crianças por faixa etária',
        tipo: 'pedagogico',
        periodo: 'trimestre',
        dataGeracao: new Date(Date.now() - 86400000).toISOString(),
        tamanho: '512 KB',
        formato: 'PDF',
        status: 'processando',
        icone: '📚',
        dados: {
          avaliacoesRealizadas: 45,
          metasAlcancadas: '78%',
          atividadesDesenvolvidas: 156,
          reunioesPedagogicas: 8
        }
      },
      {
        id: 'rel-op-004',
        titulo: 'Relatório Operacional - Recursos e Infraestrutura',
        descricao: 'Análise da utilização de recursos e estado da infraestrutura',
        tipo: 'operacional',
        periodo: 'semestre',
        dataGeracao: new Date(Date.now() - 172800000).toISOString(),
        tamanho: '389 KB',
        formato: 'Excel',
        status: 'disponivel',
        icone: '🏢',
        dados: {
          utilizacaoSalas: '95%',
          manutencoesPrevistas: 12,
          manutencaesRealizadas: 10,
          satisfacaoEquipe: '92%'
        }
      },
      {
        id: 'rel-freq-005',
        titulo: 'Relatório de Presença por Turma',
        descricao: 'Detalhamento da presença de alunos organizados por turma',
        tipo: 'frequencia',
        periodo: 'mes_anterior',
        dataGeracao: new Date(Date.now() - 259200000).toISOString(),
        tamanho: '198 KB',
        formato: 'PDF',
        status: 'disponivel',
        icone: '✅',
        dados: {
          turmasAnalisadas: 6,
          presencaMedia: '91%',
          melhorTurma: 'Jardim II',
          diasAnalisados: 20
        }
      },
      {
        id: 'rel-fin-006',
        titulo: 'Análise de Inadimplência',
        descricao: 'Relatório detalhado sobre contas em atraso e ações de cobrança',
        tipo: 'financeiro',
        periodo: 'trimestre',
        dataGeracao: new Date(Date.now() - 345600000).toISOString(),
        tamanho: '167 KB',
        formato: 'PDF',
        status: 'disponivel',
        icone: '⚠️',
        dados: {
          contasVencidas: 15,
          valorTotal: 'R$ 8.450,00',
          taxaInadimplencia: '12%',
          acoesRealizadas: 28
        }
      }
    ]

    setRelatorios(relatoriosDisponiveis)
  }

  const formatarData = (data) => {
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
      case 'disponivel':
        return { text: 'Disponível', color: 'text-green-600', bg: 'bg-green-100' }
      case 'processando':
        return { text: 'Processando', color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'erro':
        return { text: 'Erro', color: 'text-red-600', bg: 'bg-red-100' }
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const obterCorTipo = (tipo) => {
    switch (tipo) {
      case 'frequencia': return 'bg-blue-100 text-blue-600'
      case 'financeiro': return 'bg-green-100 text-green-600'
      case 'pedagogico': return 'bg-purple-100 text-purple-600'
      case 'operacional': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-lg text-gray-600 mt-2">Análises e estatísticas da escola</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Gerar Relatório
          </button>
        </div>

      {/* Cards de Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold">{estatisticas.totalAlunos}</p>
            </div>
            <Baby className="w-8 h-8 text-edu-blue" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Professores</p>
              <p className="text-2xl font-bold text-edu-green">{estatisticas.totalProfessores}</p>
            </div>
            <Users className="w-8 h-8 text-edu-green" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turmas Ativas</p>
              <p className="text-2xl font-bold">{estatisticas.totalTurmas}</p>
            </div>
            <BookOpen className="w-8 h-8 text-edu-purple" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Presença Hoje</p>
              <p className="text-2xl font-bold">{estatisticas.presencaHoje}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-edu-orange" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ocupação</p>
              <p className="text-2xl font-bold">{estatisticas.ocupacaoTurmas}%</p>
            </div>
            <PieChart className="w-8 h-8 text-edu-yellow" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pl-12 pr-8 appearance-none cursor-pointer"
              >
                {tiposRelatorios.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pl-12 pr-8 appearance-none cursor-pointer"
              >
                {periodosOptions.map(periodo => (
                  <option key={periodo.id} value={periodo.id}>
                    {periodo.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRelatorios.map((relatorio) => {
          const statusInfo = obterStatusInfo(relatorio.status)

          return (
            <div key={relatorio.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{relatorio.icone}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{relatorio.titulo}</h3>
                    <p className="text-sm text-gray-600">{formatarData(relatorio.dataGeracao)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-600 line-clamp-2">{relatorio.descricao}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${obterCorTipo(relatorio.tipo)}`}>
                    {relatorio.tipo}
                  </span>
                  <div className="text-xs text-gray-500">
                    {relatorio.formato} • {relatorio.tamanho}
                  </div>
                </div>

                {/* Dados específicos do relatório */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Dados do Relatório</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(relatorio.dados).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <div className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={relatorio.status !== 'disponivel'}
                  className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg ${
                    relatorio.status === 'disponivel' 
                      ? 'btn-primary' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {relatorio.status === 'disponivel' ? 'Download' : 'Processando...'}
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredRelatorios.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou gere um novo relatório</p>
        </div>
      )}
      </div>
    </div>
  )
}