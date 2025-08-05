import { useState } from 'react'
import { BookOpen, Mail, Lock, User } from 'lucide-react'

export default function LoginSimple() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-yellow-300 p-4 rounded-2xl mb-4">
            <BookOpen className="w-12 h-12 text-gray-800" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Eduquinha</h1>
          <p className="text-gray-600 mt-2">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Selecione seu perfil após o login
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs mt-1">Admin</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs mt-1">Professor</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs mt-1">Responsável</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}