import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePreserveParams } from '../hooks/usePreserveParams'
import {
  Home,
  Calendar,
  Camera,
  MessageCircle,
  Gamepad2,
  UtensilsCrossed,
  Heart,
  LogOut,
  Star
} from 'lucide-react'

export default function SidebarAluno() {
  const { signOut, profile } = useAuth()
  const { preserveParams } = usePreserveParams()

  const menuItems = [
    { 
      icon: Home, 
      label: 'Meu Dia', 
      path: '/meu-dia',
      color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
      emoji: '🌞'
    },
    { 
      icon: Calendar, 
      label: 'Agenda', 
      path: '/agenda',
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      emoji: '📅'
    },
    { 
      icon: Camera, 
      label: 'Minhas Fotos', 
      path: '/fotos',
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      emoji: '📸'
    },
    { 
      icon: MessageCircle, 
      label: 'Recados', 
      path: '/recados',
      color: 'bg-green-100 text-green-600 hover:bg-green-200',
      emoji: '💌'
    },
    { 
      icon: Gamepad2, 
      label: 'Jogos', 
      path: '/jogos',
      color: 'bg-red-100 text-red-600 hover:bg-red-200',
      emoji: '🎮'
    },
    { 
      icon: UtensilsCrossed, 
      label: 'Cardápio', 
      path: '/cardapio',
      color: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      emoji: '🍎'
    }
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-blue-50 to-purple-50 shadow-lg flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-blue-100">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-bold text-xl text-gray-800">Eduquinha</h2>
          <p className="text-sm text-purple-600 font-medium">✨ Meu Cantinho ✨</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={preserveParams(item.path)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? `${item.color} scale-105 shadow-md border-2 border-white`
                    : `hover:${item.color} hover:scale-102`
                }`
              }
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50">
                <span className="text-xl">{item.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg">{item.label}</div>
              </div>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-blue-100 p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {profile?.nome?.charAt(0).toUpperCase() || '😊'}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-sm">
              {profile?.nome || 'Aluno'}
            </p>
            <p className="text-xs text-purple-600 font-medium">
              🌟 Estudante 🌟
            </p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-100 text-red-500 transition-all duration-200 font-medium"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Tchau! 👋</span>
        </button>
      </div>
    </div>
  )
}