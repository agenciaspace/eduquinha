import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePreserveParams } from '../hooks/usePreserveParams'
import {
  BookOpen,
  Home,
  Users,
  Calendar,
  Camera,
  MessageSquare,
  ClipboardList,
  LogOut,
  UserCheck
} from 'lucide-react'

export default function SidebarProfessor() {
  const { signOut, profile } = useAuth()
  const { preserveParams } = usePreserveParams()

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Minha Turma', path: '/minha-turma' },
    { icon: ClipboardList, label: 'Rotinas', path: '/rotinas' },
    { icon: UserCheck, label: 'Presença', path: '/presenca' },
    { icon: Calendar, label: 'Atividades', path: '/atividades' },
    { icon: Camera, label: 'Fotos', path: '/fotos' },
    { icon: MessageSquare, label: 'Mensagens', path: '/mensagens' },
  ]

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-edu-orange p-2 rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Eduquinha</h2>
            <p className="text-xs text-gray-600">Professor</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={preserveParams(item.path)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-edu-orange/20 text-edu-green font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-10 h-10 bg-edu-orange/20 rounded-full flex items-center justify-center">
            <span className="text-edu-green font-semibold">
              {profile?.nome?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{profile?.nome}</p>
            <p className="text-xs text-gray-600">Professor(a)</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  )
}