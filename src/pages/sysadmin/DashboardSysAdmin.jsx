import React, { useState, useEffect } from 'react'
import { 
  Server, 
  Activity, 
  Database, 
  Users, 
  Building, 
  HardDrive, 
  Wifi, 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'

export default function DashboardSysAdmin() {
  const [systemStats, setSystemStats] = useState({
    uptime: '99.98%',
    responseTime: '120ms',
    totalUsers: 1247,
    activeSchools: 15,
    storageUsed: 85,
    memoryUsage: 67,
    cpuUsage: 45
  })

  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, type: 'warning', message: 'Backup automático da Escola Santos falhou', time: '2 min atrás' },
    { id: 2, type: 'info', message: 'Nova escola Pequenos Gênios foi adicionada', time: '15 min atrás' },
    { id: 3, type: 'error', message: 'Uso de disco acima de 85% no servidor DB-02', time: '1h atrás' }
  ])

  const [schoolsData, setSchoolsData] = useState([
    { id: 1, name: 'Escola Alegria', students: 180, teachers: 12, status: 'online', lastSync: '2 min' },
    { id: 2, name: 'Colégio Santos', students: 245, teachers: 18, status: 'online', lastSync: '5 min' },
    { id: 3, name: 'Pequenos Gênios', students: 95, teachers: 8, status: 'warning', lastSync: '15 min' },
    { id: 4, name: 'Jardim Encantado', students: 160, teachers: 11, status: 'online', lastSync: '3 min' }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-600" />
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema - Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitoramento e controle geral do Eduquinha</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">Sistema Operacional</span>
            </div>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime do Sistema</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.uptime}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo de Resposta</p>
                <p className="text-2xl font-bold text-blue-600">{systemStats.responseTime}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-purple-600">{systemStats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Escolas Ativas</p>
                <p className="text-2xl font-bold text-orange-600">{systemStats.activeSchools}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* System Resources */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recursos do Sistema</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Armazenamento</span>
                  <span className="text-sm text-gray-900">{systemStats.storageUsed}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${systemStats.storageUsed > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${systemStats.storageUsed}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Memória RAM</span>
                  <span className="text-sm text-gray-900">{systemStats.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${systemStats.memoryUsage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">CPU</span>
                  <span className="text-sm text-gray-900">{systemStats.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${systemStats.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Alertas Recentes</h2>
            
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schools Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Status das Escolas</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Escola</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Alunos</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Professores</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Última Sync</th>
                </tr>
              </thead>
              <tbody>
                {schoolsData.map((school) => (
                  <tr key={school.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{school.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{school.students}</td>
                    <td className="py-3 px-4 text-gray-600">{school.teachers}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(school.status)}`}>
                        {school.status === 'online' && 'Online'}
                        {school.status === 'warning' && 'Atenção'}
                        {school.status === 'error' && 'Offline'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{school.lastSync} atrás</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Backup Manual</span>
            </button>
            
            <button className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Scan Segurança</span>
            </button>
            
            <button className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Relatório Uso</span>
            </button>
            
            <button className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Wifi className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Test APIs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}