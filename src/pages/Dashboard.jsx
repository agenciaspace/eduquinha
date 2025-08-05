import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import DashboardAdmin from './admin/DashboardAdmin'
import DashboardProfessor from './professor/DashboardProfessor'
import DashboardResponsavel from './responsavel/DashboardResponsavel'

export default function Dashboard() {
  const { profile, loading, user } = useAuth()

  console.log('Dashboard - Loading:', loading)
  console.log('Dashboard - User:', user)
  console.log('Dashboard - Profile:', profile)

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Show user info for debugging
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Debug Info</h2>
          <p className="mb-2"><strong>User:</strong> {user ? 'Exists' : 'null'}</p>
          <p className="mb-2"><strong>Profile:</strong> {profile ? 'Exists' : 'null'}</p>
          <p className="mb-4"><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (profile?.role === 'admin') {
    return <DashboardAdmin />
  }

  if (profile?.role === 'professor') {
    return <DashboardProfessor />
  }

  if (profile?.role === 'responsavel') {
    return <DashboardResponsavel />
  }

  if (profile?.role === 'aluno') {
    return <Navigate to="/meu-dia" replace />
  }

  if (profile?.role === 'sysadmin') {
    return <Navigate to="/sistema/monitor" replace />
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Role not found</h2>
        <p className="mb-2"><strong>User ID:</strong> {user?.id}</p>
        <p className="mb-2"><strong>Profile Role:</strong> {profile?.role || 'undefined'}</p>
        <p className="mb-4"><strong>Profile:</strong> {JSON.stringify(profile, null, 2)}</p>
      </div>
    </div>
  )
}