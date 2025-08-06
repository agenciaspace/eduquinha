import { useSchool } from '../contexts/SchoolContext'
import { getSubdomain } from '../utils/subdomain'

export default function SchoolUrlIndicator() {
  const { school } = useSchool()
  const subdomain = getSubdomain()
  
  // Only show in development
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  
  if (!school || !subdomain || !isDevelopment) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
      🏫 {school.nome} ({subdomain})
    </div>
  )
}