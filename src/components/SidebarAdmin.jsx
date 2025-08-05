import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePreserveParams } from '../hooks/usePreserveParams'
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  DocumentChartBarIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon as LogoutIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function SidebarAdmin() {
  const { signOut, profile } = useAuth()
  const { preserveParams } = usePreserveParams()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { 
      icon: HomeIcon, 
      label: 'Dashboard', 
      path: '/dashboard'
    },
    { 
      icon: UserGroupIcon, 
      label: 'Alunos', 
      path: '/alunos'
    },
    { 
      icon: AcademicCapIcon, 
      label: 'Professores', 
      path: '/professores'
    },
    { 
      icon: BookOpenIcon, 
      label: 'Turmas', 
      path: '/turmas'
    },
    { 
      icon: MegaphoneIcon, 
      label: 'Comunicados', 
      path: '/comunicados'
    },
    { 
      icon: CalendarIcon, 
      label: 'Calendário', 
      path: '/calendario'
    },
    { 
      icon: CurrencyDollarIcon, 
      label: 'Financeiro', 
      path: '/financeiro'
    },
    { 
      icon: DocumentChartBarIcon, 
      label: 'Relatórios', 
      path: '/relatorios'
    },
    { 
      icon: CogIcon, 
      label: 'Configurações', 
      path: '/configuracoes'
    }
  ]

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen flex flex-col`}>
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Eduquinha</h1>
                <p className="text-xs text-gray-500 mt-1">Sistema Escolar</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? (
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

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
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : ''}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span>{item.label}</span>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-100 px-4 py-4">
        {/* User Info */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 text-white font-semibold text-sm w-10 h-10 flex items-center justify-center rounded-full">
              {profile?.nome?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-medium text-sm truncate">
                {profile?.nome || 'Admin'}
              </p>
              <p className="text-gray-500 text-xs">
                Administrador
              </p>
            </div>
          </div>
        )}
        
        {/* Logout Button */}
        <button
          onClick={signOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Sair' : ''}
        >
          <LogoutIcon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span>Sair</span>
          )}
        </button>
      </div>
    </div>
  )
}