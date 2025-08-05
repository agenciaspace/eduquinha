import { useAuth } from '../contexts/AuthContext'
import SidebarAdmin from './SidebarAdmin'
import SidebarProfessor from './SidebarProfessor'
import SidebarAluno from './SidebarAluno'
import SidebarSysAdmin from './SidebarSysAdmin'
import HeaderResponsavel from './HeaderResponsavel'
import TopBar from './TopBar'

export default function Layout({ children }) {
  const { profile, loading } = useAuth()
  
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
        <SidebarAdmin />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    )
  }

  if (profile?.role === 'professor') {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarProfessor />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
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
      </div>
    )
  }

  if (profile?.role === 'aluno') {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarAluno />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    )
  }

  if (profile?.role === 'sysadmin') {
    return (
      <div className="flex h-screen bg-gray-100">
        <SidebarSysAdmin />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
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
    </div>
  )
}