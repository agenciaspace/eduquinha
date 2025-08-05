import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit2, Trash2, Eye, Filter, TrendingUp, TrendingDown, CreditCard, Calendar } from 'lucide-react'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import InputField from '../../components/InputField'

export default function Financeiro() {
  const navigate = useNavigate()
  const [pagamentos, setPagamentos] = useState([])
  const [filteredPagamentos, setFilteredPagamentos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('todos')
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth())

  // Status de pagamento
  const statusOptions = [
    { id: 'todos', nome: 'Todos os Status' },
    { id: 'pago', nome: 'Pagos' },
    { id: 'pendente', nome: 'Pendentes' },
    { id: 'vencido', nome: 'Vencidos' }
  ]

  // Meses
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  useEffect(() => {
    fetchPagamentos()
  }, [])

  useEffect(() => {
    let filtered = pagamentos
    // Filtro por status
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(pagamento => pagamento.status === selectedStatus)
    }
    // Filtro por mês de vencimento
    filtered = filtered.filter(pagamento => {
      const vencimentoMes = new Date(pagamento.vencimento).getMonth()
      return vencimentoMes === selectedMes
    })
    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(pagamento =>
        pagamento.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pagamento.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pagamento.turma.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredPagamentos(filtered)
  }, [searchTerm, selectedStatus, selectedMes, pagamentos])

  const fetchPagamentos = async () => {
    try {
      // Buscar alunos para gerar dados financeiros
      const { data: alunosData, error } = await supabase
        .from('alunos')
        .select(`
          *,
          turma:turmas(nome),
          responsaveis:aluno_responsavel(
            profiles(nome, telefone)
          )
        `)
        .limit(20)

      if (error) throw error

      // Gerar dados financeiros fictícios baseados nos alunos reais
      if (!alunosData || alunosData.length === 0) {
        // Criar dados de exemplo se não houver alunos
        const exemploAlunos = [
          { nome: 'João Silva', turma: 'Maternal I', responsavel: 'Maria Silva', telefone: '(11) 98765-4321' },
          { nome: 'Ana Costa', turma: 'Jardim II', responsavel: 'Pedro Costa', telefone: '(11) 98765-1234' },
          { nome: 'Lucas Santos', turma: 'Berçário', responsavel: 'Paula Santos', telefone: '(11) 98765-5678' }
        ]
        
        const pagamentosExemplo = exemploAlunos.flatMap((aluno, index) => {
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          
          // Gerar pagamentos para os últimos 3 meses
          const pagamentos = []
          for (let monthOffset = -2; monthOffset <= 0; monthOffset++) {
            const targetMonth = currentMonth + monthOffset
            const targetYear = currentYear
            const valorMensalidade = Math.floor(Math.random() * 300) + 400
            
            pagamentos.push({
              id: `mensalidade-exemplo-${index}-${targetMonth}`,
              aluno: aluno.nome,
              responsavel: aluno.responsavel,
              telefone: aluno.telefone,
              turma: aluno.turma,
              tipo: 'mensalidade',
              valor: valorMensalidade,
              vencimento: new Date(targetYear, targetMonth, 10).toISOString().split('T')[0],
              status: monthOffset < 0 ? 'pago' : (Math.random() > 0.3 ? 'pago' : 'pendente'),
              metodoPagamento: ['PIX', 'Cartão', 'Boleto', 'Dinheiro'][Math.floor(Math.random() * 4)],
              dataPagamento: monthOffset < 0 || Math.random() > 0.3 ? new Date(targetYear, targetMonth, Math.floor(Math.random() * 15) + 1).toISOString().split('T')[0] : null,
              observacoes: ''
            })
          }
          
          return pagamentos
        })
        
        setPagamentos(pagamentosExemplo)
        return
      }
      
      const pagamentosFormatados = alunosData.flatMap(aluno => {
        const responsavel = aluno.responsaveis[0]?.profiles || { nome: 'Responsável não informado', telefone: '' }
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        // Gerar pagamentos para os últimos 3 meses
        const pagamentos = []
        for (let monthOffset = -2; monthOffset <= 0; monthOffset++) {
          const targetMonth = currentMonth + monthOffset
          const targetYear = currentYear
          const valorMensalidade = Math.floor(Math.random() * 300) + 400
          
          pagamentos.push({
            id: `mensalidade-${aluno.id}-${targetMonth}`,
            aluno: aluno.nome,
            responsavel: responsavel.nome,
            telefone: responsavel.telefone,
            turma: aluno.turma?.nome || 'Sem turma',
            tipo: 'mensalidade',
            valor: valorMensalidade,
            vencimento: new Date(targetYear, targetMonth, 10).toISOString().split('T')[0],
            status: monthOffset < 0 ? 'pago' : (Math.random() > 0.3 ? 'pago' : (Math.random() > 0.5 ? 'pendente' : 'vencido')),
            metodoPagamento: ['PIX', 'Cartão', 'Boleto', 'Dinheiro'][Math.floor(Math.random() * 4)],
            dataPagamento: monthOffset < 0 || Math.random() > 0.3 ? new Date(targetYear, targetMonth, Math.floor(Math.random() * 15) + 1).toISOString().split('T')[0] : null,
            observacoes: ''
          })
          
          // Material escolar (apenas no mês atual para alguns alunos)
          if (monthOffset === 0 && Math.random() > 0.7) {
            pagamentos.push({
              id: `material-${aluno.id}`,
              aluno: aluno.nome,
              responsavel: responsavel.nome,
              telefone: responsavel.telefone,
              turma: aluno.turma?.nome || 'Sem turma',
              tipo: 'material',
              valor: Math.floor(Math.random() * 100) + 50,
              vencimento: new Date(targetYear, targetMonth, 15).toISOString().split('T')[0],
              status: Math.random() > 0.5 ? 'pago' : 'pendente',
              metodoPagamento: ['PIX', 'Cartão', 'Boleto'][Math.floor(Math.random() * 3)],
              dataPagamento: Math.random() > 0.5 ? new Date(targetYear, targetMonth, Math.floor(Math.random() * 15) + 1).toISOString().split('T')[0] : null,
              observacoes: 'Material escolar anual'
            })
          }
        }
        
        return pagamentos
      })

      setPagamentos(pagamentosFormatados)
    } catch (error) {
      console.error('Error:', error)
      setPagamentos([])
    }
  }

  const handleViewPagamento = (pagamento) => {
    navigate(`/financeiro/${pagamento.id}`)
  }

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const obterStatusInfo = (status, vencimento) => {
    const hoje = new Date()
    const dataVencimento = new Date(vencimento)
    
    if (status === 'pago') {
      return { text: 'Pago', color: 'text-green-600', bg: 'bg-green-100' }
    } else if (status === 'vencido' || dataVencimento < hoje) {
      return { text: 'Vencido', color: 'text-red-600', bg: 'bg-red-100' }
    } else {
      return { text: 'Pendente', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    }
  }

  const obterIconeTipo = (tipo) => {
    switch (tipo) {
      case 'mensalidade': return '📚'
      case 'material': return '✏️'
      case 'evento': return '🎉'
      case 'uniforme': return '👕'
      default: return '💰'
    }
  }

  // Calcular estatísticas
  const totalReceitas = filteredPagamentos
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0)
    
  const totalPendente = filteredPagamentos
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0)
    
  const totalVencido = filteredPagamentos
    .filter(p => p.status === 'vencido')
    .reduce((sum, p) => sum + p.valor, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-lg text-gray-600 mt-2">Gerencie pagamentos e cobranças</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Cobrança
          </button>
        </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recebido</p>
              <p className="text-2xl font-bold text-emerald-600">{formatarValor(totalReceitas)}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendente</p>
              <p className="text-2xl font-bold text-yellow-600">{formatarValor(totalPendente)}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100">
              <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vencido</p>
              <p className="text-2xl font-bold text-red-600">{formatarValor(totalVencido)}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
              <TrendingDown className="w-5 h-5 text-red-600" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Cobranças</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPagamentos.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
              <CreditCard className="w-5 h-5 text-blue-600" aria-hidden="true" />
            </div>
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
                placeholder="Buscar por aluno, responsável ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              
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
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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

      {/* Lista de Pagamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPagamentos.map((pagamento) => {
          const statusInfo = obterStatusInfo(pagamento.status, pagamento.vencimento)

          return (
            <div key={pagamento.id} className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{obterIconeTipo(pagamento.tipo)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{pagamento.aluno}</h3>
                    <p className="text-sm text-gray-600">{pagamento.turma}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valor:</span>
                  <span className="font-bold text-lg">{formatarValor(pagamento.valor)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vencimento:</span>
                  <span className="text-sm font-medium">{formatarData(pagamento.vencimento)}</span>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Responsável</p>
                  <p className="text-sm font-medium">{pagamento.responsavel}</p>
                </div>

                {pagamento.dataPagamento && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pagamento:</span>
                    <span className="text-sm text-green-600">{formatarData(pagamento.dataPagamento)}</span>
                  </div>
                )}

                {pagamento.metodoPagamento && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Método:</span>
                    <span className="text-sm font-medium">{pagamento.metodoPagamento}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-600 capitalize">
                    <strong>{pagamento.tipo}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {pagamento.telefone || 'Sem telefone'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewPagamento(pagamento)}
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

      {filteredPagamentos.length === 0 && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou adicione uma nova cobrança</p>
        </div>
      )}
      </div>
    </div>
  )
}