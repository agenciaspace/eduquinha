import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePreserveParams } from '../hooks/usePreserveParams'
import {
  Server,
  Database,
  Shield,
  Activity,
  Users,
  Building,
  FileText,
  Settings,
  BarChart3,
  HardDrive,
  Wifi,
  AlertTriangle,
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function SidebarSysAdmin() {
  const { signOut, profile } = useAuth()
  const { preserveParams } = usePreserveParams()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { 
      icon: Activity, 
      label: 'Monitor Sistema', 
      path: '/sistema/monitor',
      description: 'Status geral do sistema'
    },
    { 
      icon: Building, 
      label: 'Escolas', 
      path: '/sistema/escolas',
      description: 'Gestão de instituições'
    },
    { 
      icon: Users, 
      label: 'Usuários Globais', 
      path: '/sistema/usuarios',
      description: 'Todos os usuários do sistema'
    },
    { 
      icon: Database, 
      label: 'Base de Dados', 
      path: '/sistema/database',
      description: 'Gestão do banco de dados'
    },
    { 
      icon: HardDrive, 
      label: 'Backups', 
      path: '/sistema/backups',
      description: 'Backup e restore'
    },
    { 
      icon: FileText, 
      label: 'Logs do Sistema', 
      path: '/sistema/logs',
      description: 'Auditoria e logs'
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/sistema/analytics',
      description: 'Métricas de uso'
    },
    { 
      icon: Shield, 
      label: 'Segurança', 
      path: '/sistema/seguranca',
      description: 'Configurações de segurança'
    },
    { 
      icon: Wifi, 
      label: 'Integrações', 
      path: '/sistema/integracoes',
      description: 'APIs e webhooks'
    },
    { 
      icon: Settings, 
      label: 'Config. Sistema', 
      path: '/sistema/configuracoes',
      description: 'Configurações globais'
    }
  ]

  return (
    <div className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-72'
    } h-screen flex flex-col`}>
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Server className="w-6 h-6 text-blue-400" />
                  <h1 className="text-xl font-bold text-white">Eduquinha</h1>
                </div>
                <p className="text-xs text-gray-400">Sistema - Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5 text-gray-400" />
            ) : (
              <X className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* System Status */}
      {!isCollapsed && (
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Sistema Online</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>Uptime: 99.9%</span>
            <span>Load: 1.2</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            
            return (
              <NavLink
                key={item.path}
                to={preserveParams(item.path)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : ''}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300 truncate">
                      {item.description}
                    </div>
                  </div>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Alerts Section */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-gray-700">
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-medium">Alertas</span>
            </div>
            <div className="text-xs text-gray-300">
              <div>• 2 backups pendentes</div>
              <div>• Uso de disco: 85%</div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile & Logout */}
      <div className="border-t border-gray-700 px-4 py-4">
        {/* User Info */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600 text-white font-semibold text-sm w-10 h-10 flex items-center justify-center rounded-full">
              {profile?.nome?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {profile?.nome || 'SysAdmin'}
              </p>
              <p className="text-gray-400 text-xs">
                Sistema Admin
              </p>
            </div>
          </div>
        )}
        
        {/* Logout Button */}
        <button
          onClick={signOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Sair' : ''}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span>Sair</span>
          )}
        </button>
      </div>
    </div>
  )
}