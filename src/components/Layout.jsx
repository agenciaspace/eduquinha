import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useEnsureSchoolParam } from '../hooks/useSchoolRedirect'
import SidebarAdmin from './SidebarAdmin'
import SidebarProfessor from './SidebarProfessor'
import SidebarAluno from './SidebarAluno'
import SidebarSysAdmin from './SidebarSysAdmin'
import HeaderResponsavel from './HeaderResponsavel'
import TopBar from './TopBar'
import SchoolUrlIndicator from './SchoolUrlIndicator'
import { Menu, X } from 'lucide-react'

export default function Layout({ children }) {
  const { profile, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Ensure escola parameter is in URL for development
  useEnsureSchoolParam()
  
  console.log('Layout - Profile:', profile)
  console.log('Layout - Loading:', loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (profile?.role === 'admin') {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <SidebarAdmin />
        </div>
        
        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarAdmin />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <SchoolUrlIndicator />
      </div>
    )
  }

  if (profile?.role === 'professor') {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <SidebarProfessor />
        </div>
        
        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarProfessor />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="lg:hidden p-4 bg-white shadow-sm flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Painel do Professor</h1>
          </div>
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
        <SchoolUrlIndicator />
      </div>
    )
  }

  if (profile?.role === 'responsavel') {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderResponsavel />
        <main className="px-4 py-8 max-w-7xl mx-auto">
          {children}
        </main>
        <SchoolUrlIndicator />
      </div>
    )
  }

  if (profile?.role === 'aluno') {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <SidebarAluno />
        </div>
        
        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarAluno />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="lg:hidden p-4 bg-white shadow-sm flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Meu Painel</h1>
          </div>
          {children}
        </main>
        <SchoolUrlIndicator />
      </div>
    )
  }

  if (profile?.role === 'sysadmin') {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <SidebarSysAdmin />
        </div>
        
        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarSysAdmin />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="lg:hidden p-4 bg-white shadow-sm flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Admin Sistema</h1>
          </div>
          {children}
        </main>
        <SchoolUrlIndicator />
      </div>
    )
  }

  // Fallback for when profile doesn't have a role or is null
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Perfil não encontrado</h2>
        <p className="text-gray-600 mb-4">
          Não foi possível carregar as informações do seu perfil.<br/>
          Profile: {JSON.stringify(profile)}
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="btn-primary px-6 py-2"
        >
          Fazer login novamente
        </button>
      </div>
      <SchoolUrlIndicator />
    </div>
  )
}