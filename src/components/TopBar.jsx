import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  BellIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function TopBar() {
  const { profile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications] = useState([
    { id: 1, text: "Nova mensagem da coordenação", unread: true },
    { id: 2, text: "Relatório mensal disponível", unread: true },
    { id: 3, text: "Backup realizado com sucesso", unread: false },
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Área esquerda - pode ser usada para breadcrumbs futuramente */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">Dashboard</span>
            <span className="mx-1">•</span>
            <span>Visão Geral</span>
          </div>
        </div>

        {/* Área direita - controles do usuário */}
        <div className="flex items-center space-x-4">
          
          {/* Notificações */}
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors duration-150">
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Configurações */}
          <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors duration-150">
            <Cog6ToothIcon className="h-5 w-5" />
          </button>

          {/* Separador */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Menu do usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
            >
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {profile?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{profile?.nome}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg bg-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{profile?.nome}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <UserIcon className="h-4 w-4 mr-3" />
                  Meu Perfil
                </button>
                
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <Cog6ToothIcon className="h-4 w-4 mr-3" />
                  Configurações
                </button>
                
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={signOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}