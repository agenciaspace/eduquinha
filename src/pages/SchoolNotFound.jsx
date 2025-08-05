import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Home, Mail } from 'lucide-react'
import { getSubdomain } from '../utils/subdomain'

export default function SchoolNotFound() {
  const subdomain = getSubdomain()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Escola não encontrada
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          Não conseguimos encontrar a escola "{subdomain}"
        </p>
        
        <p className="text-gray-500 mb-8">
          Verifique se a URL está correta ou entre em contato com a administração da escola.
        </p>
        
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Possíveis soluções:</h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>• Verifique se digitou o nome da escola corretamente</li>
              <li>• A escola pode ter alterado seu link de acesso</li>
              <li>• Entre em contato com a secretaria da escola</li>
              <li>• Acesse diretamente pelo site principal do Eduquinha</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Ir para Eduquinha
            </Link>
            
            <a
              href="mailto:suporte@eduquinha.com.br"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contatar Suporte
            </a>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Para administradores:</strong> Se você é responsável por esta escola, 
            verifique se ela foi cadastrada corretamente no sistema ou entre em contato 
            com o suporte técnico.
          </p>
        </div>
      </div>
    </div>
  )
}