import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Calendar, Camera, ClipboardList, Clock, Smile } from 'lucide-react'

export default function DashboardProfessor() {
  const { user } = useAuth()
  const [turma, setTurma] = useState(null)
  const [stats, setStats] = useState({
    totalAlunos: 0,
    presentesHoje: 0,
    atividadesHoje: 0,
    fotosEnviadas: 0
  })
  const [alunosPresentes, setAlunosPresentes] = useState([])

  useEffect(() => {
    const fetchTurmaData = async () => {
      try {
        // Buscar turma do professor
        const { data: turmaData } = await supabase
          .from('turmas')
          .select('*, alunos(id, nome, foto_url)')
          .eq('professor_id', user.id)
          .single()

        if (turmaData) {
          setTurma(turmaData)
          setStats(prev => ({ ...prev, totalAlunos: turmaData.alunos?.length || 0 }))

          // Buscar presenças de hoje
          const hoje = new Date().toISOString().split('T')[0]
          const { data: presencas } = await supabase
            .from('presencas')
            .select('*, alunos(nome, foto_url)')
            .eq('data', hoje)
            .eq('presente', true)
            .in('aluno_id', turmaData.alunos.map(a => a.id))

          setAlunosPresentes(presencas || [])
          setStats(prev => ({ ...prev, presentesHoje: presencas?.length || 0 }))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    if (user) {
      fetchTurmaData()
    }
  }, [user])

  const quickActions = [
    {
      title: 'Registrar Rotinas',
      icon: ClipboardList,
      color: 'bg-edu-green',
      lightColor: 'bg-edu-green/20',
      path: '/rotinas'
    },
    {
      title: 'Marcar Presença',
      icon: Users,
      color: 'bg-edu-blue',
      lightColor: 'bg-edu-blue/20',
      path: '/presenca'
    },
    {
      title: 'Enviar Fotos',
      icon: Camera,
      color: 'bg-edu-purple',
      lightColor: 'bg-edu-purple/20',
      path: '/fotos'
    },
    {
      title: 'Atividades do Dia',
      icon: Calendar,
      color: 'bg-edu-orange',
      lightColor: 'bg-edu-orange/20',
      path: '/atividades'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, Professor(a)!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {turma ? `Turma: ${turma.nome}` : 'Carregando informações da turma...'}
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total de Alunos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalAlunos}</p>
            </div>
            <div className="bg-edu-blue/20 p-3 rounded-xl">
              <Users className="w-6 h-6 text-edu-blue" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Presentes Hoje</p>
              <p className="text-2xl font-bold text-gray-800">{stats.presentesHoje}</p>
            </div>
            <div className="bg-edu-green/20 p-3 rounded-xl">
              <Smile className="w-6 h-6 text-edu-green" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Atividades Hoje</p>
              <p className="text-2xl font-bold text-gray-800">{stats.atividadesHoje}</p>
            </div>
            <div className="bg-edu-purple/20 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-edu-purple" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Fotos Enviadas</p>
              <p className="text-2xl font-bold text-gray-800">{stats.fotosEnviadas}</p>
            </div>
            <div className="bg-edu-orange/20 p-3 rounded-xl">
              <Camera className="w-6 h-6 text-edu-orange" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => window.location.href = action.path}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className={`${action.lightColor} p-4 rounded-xl inline-flex mb-3`}>
                <action.icon className={`w-8 h-8 ${action.color.replace('bg-', 'text-')}`} />
              </div>
              <p className="font-semibold text-gray-800">{action.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-edu-green/20 p-2 rounded-xl">
            <Clock className="w-5 h-5 text-edu-green" />
          </div>
          <h2 className="text-xl font-bold">Alunos Presentes Hoje</h2>
        </div>
        
        {alunosPresentes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {alunosPresentes.map((presenca) => (
              <div key={presenca.id} className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-edu-blue/20 rounded-full flex items-center justify-center">
                  {presenca.alunos?.foto_url ? (
                    <img
                      src={presenca.alunos.foto_url}
                      alt={presenca.alunos.nome}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-edu-blue font-bold text-xl">
                      {presenca.alunos?.nome?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800">{presenca.alunos?.nome}</p>
                <p className="text-xs text-gray-500">
                  {presenca.horario_entrada ? `Entrada: ${presenca.horario_entrada}` : 'Presente'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Nenhuma presença registrada hoje
          </p>
        )}
      </div>
      </div>
    </div>
  )
}