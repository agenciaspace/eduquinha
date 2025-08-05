import { useEffect, useState } from 'react'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MegaphoneIcon as SpeakerphoneIcon,
  CalendarIcon,
  ArrowUpIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { dashboardApi, handleSupabaseError } from '../../lib/api'

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalProfessores: 0,
    totalTurmas: 0,
    presencaHoje: 0,
    comunicadosRecentes: [],
    eventosProximos: [],
    financeiroMes: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await dashboardApi.getAdminStats()
      setStats(data)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(handleSupabaseError(err))
      // Fallback to mock data if database is not set up
      setStats({
        totalAlunos: 0,
        totalProfessores: 0,
        totalTurmas: 0,
        presencaHoje: 0,
        comunicadosRecentes: [],
        financeiroMes: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Total de Alunos',
      value: stats.totalAlunos,
      icon: UserGroupIcon,
      color: 'primary'
    },
    {
      title: 'Professores',
      value: stats.totalProfessores,
      icon: AcademicCapIcon,
      color: 'mint'
    },
    {
      title: 'Turmas Ativas',
      value: stats.totalTurmas,
      icon: BookOpenIcon,
      color: 'yellow'
    },
    {
      title: 'Presença Hoje',
      value: `${stats.presencaHoje}%`,
      icon: ChartBarIcon,
      color: 'primary'
    }
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const getPriorityLevel = (prioridade) => {
    switch (prioridade) {
      case 'alta': return 'high'
      case 'media': return 'medium'
      case 'baixa': return 'low'
      default: return 'low'
    }
  }

  // Dados para o sparkline
  const sparklineData = [23, 25, 28, 30, 32, 35, 38, 42, 45]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header Premium */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Visão geral do sistema escolar</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 shadow-md ring-1 ring-red-200 rounded-xl p-5 flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-red-800">
              Erro ao carregar dados
            </h3>
            <div className="text-sm text-red-700">
              <p>{error}</p>
              <p className="mt-2 text-xs">
                Verifique se o banco de dados foi configurado corretamente.
              </p>
            </div>
          </div>
        )}

        {/* Premium Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Enhanced Financial Card */}
          <div className="lg:col-span-2 bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100">
                {loading ? (
                  <div className="edu-skeleton w-6 h-6" />
                ) : (
                  <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {loading ? <div className="edu-skeleton w-32 h-6" /> : 'Receita do Mês'}
                </h3>
                <p className="text-sm text-gray-600">
                  {loading ? <div className="edu-skeleton w-24 h-4 mt-1" /> : 'Faturamento mensal'}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {loading ? <div className="edu-skeleton w-48 h-10" /> : formatCurrency(stats.financeiroMes)}
              </p>
              
              <div className="flex items-center gap-4">
                {loading ? (
                  <div className="edu-skeleton w-20 h-7" />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                    <ArrowUpIcon className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">+12% 📈</span>
                  </div>
                )}
                
                {!loading && (
                  <div className="flex-1 h-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-1">
                    <Sparklines data={sparklineData} width="100%" height={24}>
                      <SparklinesLine color="#059669" style={{ strokeWidth: 3, fill: "none" }} />
                    </Sparklines>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-400 font-medium">
                {loading ? <div className="edu-skeleton w-24 h-3" /> : 'vs. mês anterior'}
              </p>
            </div>
          </div>

          {/* Premium Stat Cards */}
          {statsCards.map((card, index) => {
            const IconComponent = card.icon
            const getIconClasses = (color) => {
              switch (color) {
                case 'primary':
                  return { bg: 'bg-blue-100', iconColor: 'text-blue-600' }
                case 'mint':
                  return { bg: 'bg-emerald-100', iconColor: 'text-emerald-600' }
                case 'yellow':
                  return { bg: 'bg-amber-100', iconColor: 'text-amber-600' }
                default:
                  return { bg: 'bg-purple-100', iconColor: 'text-purple-600' }
              }
            }
            const iconClasses = getIconClasses(card.color)
            
            return (
              <div key={index} className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconClasses.bg}`}>
                    {loading ? (
                      <div className="edu-skeleton w-6 h-6" />
                    ) : (
                      <IconComponent className={`h-6 w-6 ${iconClasses.iconColor}`} aria-hidden="true" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">
                    {loading ? <div className="edu-skeleton w-20 h-4" /> : card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? <div className="edu-skeleton w-16 h-8" /> : card.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comunicados Recentes - Premium Design */}
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                <SpeakerphoneIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Comunicados Recentes</h3>
                <p className="text-sm text-gray-600">Últimas atualizações da coordenação</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-gray-50 shadow-sm ring-1 ring-gray-100 rounded-lg p-4 flex flex-col gap-2">
                    <div className="edu-skeleton w-40 h-4" />
                    <div className="edu-skeleton w-full h-4" />
                    <div className="edu-skeleton w-20 h-3" />
                  </div>
                ))
              ) : stats.comunicadosRecentes?.length === 0 ? (
                <div className="text-center py-8">
                  <SpeakerphoneIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Nenhum comunicado recente</p>
                </div>
              ) : (
                (stats.comunicadosRecentes || []).map((comunicado) => (
                  <div key={comunicado.id} className="bg-gray-50 shadow-sm ring-1 ring-gray-100 rounded-lg p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                      <SpeakerphoneIcon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {comunicado.titulo}
                        </h4>
                        <Badge level={getPriorityLevel(comunicado.prioridade)} size="sm">
                          {comunicado.prioridade}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {comunicado.mensagem}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {new Date(comunicado.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Ver Todos os Comunicados
            </button>
          </div>

          {/* Eventos Próximos - Premium Design */}
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100">
                <CalendarIcon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Eventos Próximos</h3>
                <p className="text-sm text-gray-600">Agenda escolar</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-gray-50 shadow-sm ring-1 ring-gray-100 rounded-lg p-4 flex flex-col gap-2">
                    <div className="edu-skeleton w-32 h-4" />
                    <div className="edu-skeleton w-full h-4" />
                    <div className="edu-skeleton w-2/3 h-3" />
                  </div>
                ))
              ) : (stats.eventosProximos || []).length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Nenhum evento próximo</p>
                  <p className="text-xs text-gray-400 mt-1">Agenda vazia</p>
                </div>
              ) : (
                (stats.eventosProximos || []).map((evento) => (
                  <div key={evento.id} className="bg-gray-50 shadow-sm ring-1 ring-gray-100 rounded-lg p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100">
                      <CalendarIcon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {evento.titulo}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {evento.descricao}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Ver Calendário Completo
            </button>
          </div>
        </div>

        {/* Ações Rápidas - Premium Design */}
        <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
              <PlusIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">Ações Rápidas</h3>
              <p className="text-sm text-gray-600">Acesso rápido às funções principais</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 min-h-[140px] justify-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                <UserGroupIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Novo Aluno</p>
                <p className="text-xs text-gray-600">Gerenciar estudantes</p>
              </div>
              <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Adicionar
              </button>
            </div>
            
            <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 min-h-[140px] justify-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100">
                <AcademicCapIcon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Novo Professor</p>
                <p className="text-xs text-gray-600">Adicionar educador</p>
              </div>
              <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                Adicionar
              </button>
            </div>
            
            <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 min-h-[140px] justify-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100">
                <SpeakerphoneIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Comunicado</p>
                <p className="text-xs text-gray-600">Enviar mensagem</p>
              </div>
              <button className="px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg font-medium hover:bg-orange-700 transition-colors">
                Criar
              </button>
            </div>
            
            <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 min-h-[140px] justify-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
                <BookOpenIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Nova Turma</p>
                <p className="text-xs text-gray-600">Criar classe</p>
              </div>
              <button className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Criar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}