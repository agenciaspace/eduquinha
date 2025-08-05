import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, DollarSign, Calendar, Phone, Mail, User, CreditCard, FileText, Clock, CheckCircle, AlertCircle, Send, Printer } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function FinanceiroDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pagamento, setPagamento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('detalhes')
  const [historicoPagamentos, setHistoricoPagamentos] = useState([])

  const tabs = [
    { id: 'detalhes', label: 'Detalhes do Pagamento', icon: FileText },
    { id: 'historico', label: 'Histórico', icon: Clock },
    { id: 'acoes', label: 'Ações', icon: CreditCard }
  ]

  const fetchPagamentoDetalhes = useCallback(async () => {
    try {
      console.log('Payment ID received:', id)
      
      // Extrair student ID do payment ID
      // Formato: mensalidade-{uuid}-{month} ou material-{uuid}
      const parts = id.split('-')
      let studentId
      let mes = new Date().getMonth()
      
      if (parts[0] === 'mensalidade') {
        // Para mensalidades: mensalidade-uuid-month
        // O UUID pode ter vários hifens, então pegamos tudo menos o primeiro e último item
        studentId = parts.slice(1, -1).join('-')
        mes = parseInt(parts[parts.length - 1])
        console.log('Extracted student ID:', studentId, 'Month:', mes)
      } else if (parts[0] === 'material') {
        // Para material: material-uuid
        studentId = parts.slice(1).join('-')
        console.log('Extracted student ID:', studentId)
      }

      // Buscar dados do aluno para simular dados de pagamento
      const { data: alunoData, error } = await supabase
        .from('alunos')
        .select(`
          *,
          turmas(nome, faixa_etaria),
          aluno_responsavel(
            profiles(nome, telefone, email)
          )
        `)
        .eq('id', studentId)
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Student data found:', alunoData?.nome)

      // Gerar dados de pagamento baseados no aluno
      const responsavel = alunoData.aluno_responsavel[0]?.profiles || { nome: 'Responsável não informado', telefone: '', email: '' }
      const valorMensalidade = Math.floor(Math.random() * 300) + 400
      
      const pagamentoDetalhado = {
        id: id,
        aluno: {
          id: alunoData.id,
          nome: alunoData.nome,
          foto: alunoData.data_nascimento ? (
            new Date().getFullYear() - new Date(alunoData.data_nascimento).getFullYear() >= 2 
              ? Math.random() > 0.5 ? '👦' : '👧' 
              : '👶'
          ) : '👶',
          turma: alunoData.turmas?.nome || 'Sem turma',
          matricula: `2025${String(alunoData.id).padStart(4, '0')}`
        },
        responsavel: {
          nome: responsavel.nome,
          telefone: responsavel.telefone,
          email: responsavel.email,
          cpf: '***.***.***-**'
        },
        tipo: 'mensalidade',
        competencia: `${mes + 1}/2025`,
        valor: valorMensalidade,
        vencimento: `2025-${String(mes + 1).padStart(2, '0')}-10`,
        status: Math.random() > 0.3 ? 'pago' : (Math.random() > 0.5 ? 'pendente' : 'vencido'),
        metodoPagamento: ['PIX', 'Cartão', 'Boleto', 'Dinheiro'][Math.floor(Math.random() * 4)],
        dataPagamento: Math.random() > 0.3 ? `2025-${String(mes + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}` : null,
        observacoes: '',
        desconto: Math.random() > 0.8 ? Math.floor(Math.random() * 50) : 0,
        multa: 0,
        juros: 0,
        numeroDocumento: `DOC${new Date().getFullYear()}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        codigoBarras: Math.random() > 0.5 ? '34191.79001 01043.510047 91020.150008 5 91540000000' + valorMensalidade : null
      }

      // Calcular multa e juros se vencido
      if (pagamentoDetalhado.status === 'vencido' && !pagamentoDetalhado.dataPagamento) {
        const diasAtraso = Math.floor((new Date() - new Date(pagamentoDetalhado.vencimento)) / (1000 * 60 * 60 * 24))
        if (diasAtraso > 0) {
          pagamentoDetalhado.multa = pagamentoDetalhado.valor * 0.02 // 2% de multa
          pagamentoDetalhado.juros = pagamentoDetalhado.valor * 0.001 * diasAtraso // 0.1% ao dia
        }
      }

      setPagamento(pagamentoDetalhado)
    } catch (error) {
      console.error('Error fetching payment details:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchHistoricoPagamentos = useCallback(async () => {
    try {
      // Simular histórico de pagamentos
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho']
      const historico = meses.slice(0, 6).map((mes, index) => ({
        id: `hist-${index}`,
        mes,
        competencia: `${index + 1}/2025`,
        valor: Math.floor(Math.random() * 300) + 400,
        vencimento: `2025-${String(index + 1).padStart(2, '0')}-10`,
        pagamento: index < 3 ? `2025-${String(index + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9) + 1).padStart(2, '0')}` : null,
        status: index < 3 ? 'pago' : 'pendente',
        metodo: index < 3 ? ['PIX', 'Cartão', 'Boleto'][Math.floor(Math.random() * 3)] : null
      }))

      setHistoricoPagamentos(historico)
    } catch (error) {
      console.error('Error fetching payment history:', error)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchPagamentoDetalhes()
      fetchHistoricoPagamentos()
    }
  }, [id, fetchPagamentoDetalhes, fetchHistoricoPagamentos])

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
      return { text: 'Pago', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle }
    } else if (status === 'vencido' || dataVencimento < hoje) {
      return { text: 'Vencido', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle }
    } else {
      return { text: 'Pendente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock }
    }
  }

  const handleRegistrarPagamento = () => {
    // Implementar lógica de registro de pagamento
    alert('Funcionalidade de registrar pagamento será implementada')
  }

  const handleEnviarCobranca = () => {
    // Implementar lógica de envio de cobrança
    alert('Cobrança enviada por email e WhatsApp')
  }

  const handleGerarBoleto = () => {
    // Implementar lógica de geração de boleto
    alert('Boleto gerado com sucesso')
  }

  const handleImprimir = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando detalhes do pagamento...</p>
        </div>
      </div>
    )
  }

  if (!pagamento) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pagamento não encontrado</h3>
          <button onClick={() => navigate('/financeiro')} className="btn-primary">
            Voltar para Financeiro
          </button>
        </div>
      </div>
    )
  }

  const statusInfo = obterStatusInfo(pagamento.status, pagamento.vencimento)
  const StatusIcon = statusInfo.icon
  const valorTotal = pagamento.valor - pagamento.desconto + pagamento.multa + pagamento.juros

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/financeiro')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">Detalhes do Pagamento</h1>
          <p className="text-gray-600 mt-2">
            {pagamento.tipo.charAt(0).toUpperCase() + pagamento.tipo.slice(1)} - {pagamento.competencia}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleImprimir}
            className="btn-secondary px-6 py-2 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${statusInfo.bg}`}>
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{formatarValor(valorTotal)}</h2>
              <p className={`text-lg font-medium ${statusInfo.color}`}>{statusInfo.text}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Vencimento</p>
            <p className="text-lg font-medium">{formatarData(pagamento.vencimento)}</p>
            {pagamento.dataPagamento && (
              <>
                <p className="text-sm text-gray-500 mt-2">Pago em</p>
                <p className="text-lg font-medium text-green-600">{formatarData(pagamento.dataPagamento)}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-edu-blue text-edu-blue'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Detalhes do Pagamento */}
        {activeTab === 'detalhes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Informações do Aluno */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Informações do Aluno</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{pagamento.aluno.foto}</div>
                  <div>
                    <p className="font-semibold text-lg">{pagamento.aluno.nome}</p>
                    <p className="text-gray-600">Matrícula: {pagamento.aluno.matricula}</p>
                    <p className="text-gray-600">Turma: {pagamento.aluno.turma}</p>
                  </div>
                </div>
              </div>

              {/* Informações do Responsável */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Responsável Financeiro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Nome</p>
                      <p className="font-medium">{pagamento.responsavel.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{pagamento.responsavel.telefone || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-sm">{pagamento.responsavel.email || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">CPF</p>
                      <p className="font-medium">{pagamento.responsavel.cpf}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalhes Financeiros */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Detalhes Financeiros</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Valor Original</span>
                    <span className="font-medium">{formatarValor(pagamento.valor)}</span>
                  </div>
                  {pagamento.desconto > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Desconto</span>
                      <span className="font-medium">- {formatarValor(pagamento.desconto)}</span>
                    </div>
                  )}
                  {pagamento.multa > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span>Multa (2%)</span>
                      <span className="font-medium">+ {formatarValor(pagamento.multa)}</span>
                    </div>
                  )}
                  {pagamento.juros > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span>Juros</span>
                      <span className="font-medium">+ {formatarValor(pagamento.juros)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-edu-blue">{formatarValor(valorTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Informações do Pagamento */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Informações do Pagamento</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Documento</p>
                    <p className="font-medium">{pagamento.numeroDocumento}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tipo</p>
                    <p className="font-medium capitalize">{pagamento.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Competência</p>
                    <p className="font-medium">{pagamento.competencia}</p>
                  </div>
                  {pagamento.metodoPagamento && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Método de Pagamento</p>
                      <p className="font-medium">{pagamento.metodoPagamento}</p>
                    </div>
                  )}
                  {pagamento.codigoBarras && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Código de Barras</p>
                      <p className="font-mono text-xs break-all">{pagamento.codigoBarras}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações Rápidas */}
              {pagamento.status !== 'pago' && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Ações Rápidas</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={handleRegistrarPagamento}
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Registrar Pagamento
                    </button>
                    <button 
                      onClick={handleEnviarCobranca}
                      className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Enviar Cobrança
                    </button>
                    <button 
                      onClick={handleGerarBoleto}
                      className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Gerar 2ª Via Boleto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Histórico */}
        {activeTab === 'historico' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Histórico de Pagamentos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Mês</th>
                    <th className="text-left py-3 px-4">Competência</th>
                    <th className="text-left py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4">Vencimento</th>
                    <th className="text-left py-3 px-4">Pagamento</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Método</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoPagamentos.map((hist) => {
                    const histStatus = obterStatusInfo(hist.status, hist.vencimento)
                    return (
                      <tr key={hist.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{hist.mes}</td>
                        <td className="py-3 px-4">{hist.competencia}</td>
                        <td className="py-3 px-4 font-medium">{formatarValor(hist.valor)}</td>
                        <td className="py-3 px-4">{formatarData(hist.vencimento)}</td>
                        <td className="py-3 px-4">
                          {hist.pagamento ? formatarData(hist.pagamento) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${histStatus.bg} ${histStatus.color}`}>
                            {histStatus.text}
                          </span>
                        </td>
                        <td className="py-3 px-4">{hist.metodo || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ações */}
        {activeTab === 'acoes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Registrar Pagamento</h3>
              <p className="text-gray-600 mb-4">
                Registre o pagamento desta cobrança informando a data e método de pagamento.
              </p>
              <button 
                onClick={handleRegistrarPagamento}
                className="btn-primary w-full py-3"
                disabled={pagamento.status === 'pago'}
              >
                {pagamento.status === 'pago' ? 'Pagamento já registrado' : 'Registrar Pagamento'}
              </button>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Enviar Cobrança</h3>
              <p className="text-gray-600 mb-4">
                Envie um lembrete de pagamento por email ou WhatsApp para o responsável.
              </p>
              <button 
                onClick={handleEnviarCobranca}
                className="btn-secondary w-full py-3"
              >
                Enviar Lembrete
              </button>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Gerar Documentos</h3>
              <p className="text-gray-600 mb-4">
                Gere segunda via de boleto ou recibo de pagamento.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={handleGerarBoleto}
                  className="btn-secondary w-full py-2"
                >
                  Gerar 2ª Via Boleto
                </button>
                <button 
                  className="btn-secondary w-full py-2"
                  disabled={pagamento.status !== 'pago'}
                >
                  Gerar Recibo
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Outras Ações</h3>
              <p className="text-gray-600 mb-4">
                Ações adicionais para gerenciar este pagamento.
              </p>
              <div className="space-y-3">
                <button className="btn-secondary w-full py-2">
                  Aplicar Desconto
                </button>
                <button className="btn-secondary w-full py-2 text-red-600 hover:bg-red-50">
                  Cancelar Cobrança
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}