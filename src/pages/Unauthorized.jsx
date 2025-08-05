import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-edu-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-edu-blue/90 transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}