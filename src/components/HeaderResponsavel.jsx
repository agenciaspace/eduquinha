import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Pencil, Menu, X, LogOut } from 'lucide-react'

export default function HeaderResponsavel() {
  const { signOut, profile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { label: 'Início', path: '/dashboard' },
    { label: 'Agenda', path: '/agenda' },
    { label: 'Fotos', path: '/fotos' },
    { label: 'Mensagens', path: '/mensagens' },
    { label: 'Financeiro', path: '/financeiro' },
  ]

  return (
    <header className="bg-edu-blue-light shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-edu-orange p-2 rounded-xl">
              <Pencil className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-xl">Eduquinha</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `font-medium transition-colors ${
                    isActive
                      ? 'text-edu-orange'
                      : 'text-gray-700 hover:text-edu-orange'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-edu-orange/20 rounded-full flex items-center justify-center">
                <span className="text-edu-orange font-semibold text-sm">
                  {profile?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium">{profile?.nome}</span>
            </div>
            <button
              onClick={signOut}
              className="text-gray-600 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="px-4 py-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-lg my-1 ${
                    isActive
                      ? 'bg-edu-orange/20 text-edu-orange font-medium'
                      : 'text-gray-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="border-t mt-2 pt-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-8 h-8 bg-edu-orange/20 rounded-full flex items-center justify-center">
                  <span className="text-edu-orange font-semibold text-sm">
                    {profile?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium flex-1">{profile?.nome}</span>
                <button
                  onClick={signOut}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}