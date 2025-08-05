import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Heart, Sun, Moon, Camera } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardAluno() {
  const { profile } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return { text: 'Bom dia', emoji: '🌅', color: 'from-yellow-400 to-orange-400' }
    if (hour < 18) return { text: 'Boa tarde', emoji: '☀️', color: 'from-blue-400 to-cyan-400' }
    return { text: 'Boa noite', emoji: '🌙', color: 'from-purple-400 to-pink-400' }
  }

  const greeting = getGreeting()

  const todayActivities = [
    { time: '08:00', activity: 'Entrada e Bom Dia', emoji: '👋', done: true },
    { time: '08:30', activity: 'Café da Manhã', emoji: '🥐', done: true },
    { time: '09:00', activity: 'Atividade de Arte', emoji: '🎨', done: true },
    { time: '10:00', activity: 'Lanche', emoji: '🍌', done: false },
    { time: '10:30', activity: 'Brincadeira no Pátio', emoji: '⚽', done: false },
    { time: '11:30', activity: 'História', emoji: '📚', done: false },
    { time: '12:00', activity: 'Almoço', emoji: '🍽️', done: false }
  ]

  const recentPhotos = [
    { id: 1, title: 'Arte com Tinta', emoji: '🎨' },
    { id: 2, title: 'Brincadeira no Pátio', emoji: '⚽' },
    { id: 3, title: 'Hora do Lanche', emoji: '🍎' },
    { id: 4, title: 'Atividade de Música', emoji: '🎵' }
  ]

  const messages = [
    { id: 1, from: 'Tia Maria', message: 'Parabéns pelo desenho lindo hoje!', emoji: '🌟' },
    { id: 2, from: 'Mamãe', message: 'Não esqueça de beber água!', emoji: '💧' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Welcome Header */}
        <div className={`bg-gradient-to-r ${greeting.color} rounded-3xl p-8 text-white shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{greeting.emoji}</span>
                <h1 className="text-3xl font-bold">{greeting.text}, {profile?.nome?.split(' ')[0] || 'Amiguinho'}!</h1>
              </div>
              <p className="text-lg opacity-90">Hoje é um dia especial para aprender e brincar! ✨</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatTime()}</div>
              <div className="text-sm opacity-90">{currentTime.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Activities */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Meu Dia de Hoje</h2>
              <span className="text-2xl">📅</span>
            </div>
            
            <div className="space-y-3">
              {todayActivities.map((activity, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activity.done 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-gray-50 hover:bg-blue-50 border-2 border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    activity.done ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <span className="text-xl">{activity.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">{activity.time}</span>
                    </div>
                    <div className={`text-lg font-medium ${
                      activity.done ? 'text-green-700 line-through' : 'text-gray-800'
                    }`}>
                      {activity.activity}
                    </div>
                  </div>
                  {activity.done && (
                    <div className="bg-green-500 text-white p-2 rounded-full">
                      <span className="text-sm">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            
            {/* Messages */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Recadinhos</h3>
                <span className="text-xl">💌</span>
              </div>
              
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-2xl border border-pink-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{message.emoji}</span>
                      <span className="font-medium text-purple-700">{message.from}</span>
                    </div>
                    <p className="text-gray-700">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Photos */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Camera className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Minhas Fotos</h3>
                <span className="text-xl">📸</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {recentPhotos.map((photo) => (
                  <div key={photo.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-200 hover:scale-105 transition-transform cursor-pointer">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{photo.emoji}</div>
                      <div className="text-xs font-medium text-gray-700">{photo.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl mb-2">🌟</div>
            <div className="text-2xl font-bold">15</div>
            <div className="text-sm opacity-90">Estrelinhas</div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm opacity-90">Histórias</div>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl mb-2">🎨</div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm opacity-90">Desenhos</div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm opacity-90">Conquistas</div>
          </div>
        </div>
      </div>
    </div>
  )
}