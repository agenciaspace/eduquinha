import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  console.log('PrivateRoute - User:', user?.id)
  console.log('PrivateRoute - Profile:', profile)
  console.log('PrivateRoute - Loading:', loading)
  console.log('PrivateRoute - AllowedRoles:', allowedRoles)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue"></div>
          <p className="mt-4 text-gray-600">Carregando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('PrivateRoute - No user, redirecting to login')
    return <Navigate to={`/login${location.search}`} />
  }

  // Verificar se precisa trocar senha (exceto na própria página de mudar senha)
  if (profile?.primeiro_login && location.pathname !== '/mudar-senha') {
    console.log('PrivateRoute - First login, redirecting to change password')
    return <Navigate to="/mudar-senha" />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.role)) {
    console.log('PrivateRoute - Role not allowed, redirecting to unauthorized')
    return <Navigate to={`/unauthorized${location.search}`} />
  }

  console.log('PrivateRoute - Access granted')
  return children
}