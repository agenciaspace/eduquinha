import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar, 
  Camera, 
  MessageSquare, 
  DollarSign, 
  Heart,
  Moon,
  Utensils,
  Baby,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function DashboardResponsavel() {
  const { user } = useAuth()
  const [alunos, setAlunos] = useState([])
  const [selectedAluno, setSelectedAluno] = useState(null)
  const [rotinaHoje, setRotinaHoje] = useState(null)
  const [comunicadosRecentes, setComunicadosRecentes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAlunosData = async () => {
    try {
      // Buscar alunos vinculados ao responsável
      const { data: alunosData } = await supabase
        .from('aluno_responsavel')
        .select('*, alunos(*)')
        .eq('responsavel_id', user.id)

      if (alunosData && alunosData.length > 0) {
        const alunosList = alunosData.map(item => item.alunos)
        setAlunos(alunosList)
        setSelectedAluno(alunosList[0])
      }

      // Buscar comunicados recentes
      const { data: comunicados } = await supabase
        .from('comunicados')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      setComunicadosRecentes(comunicados || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }


  useEffect(() => {
    if (user) {
      fetchAlunosData()
    }
  }, [user])

  useEffect(() => {
    const fetchRotinaHoje = async () => {
      try {
        const hoje = new Date().toISOString().split('T')[0]
        const { data } = await supabase
          .from('rotinas')
          .select('*')
          .eq('aluno_id', selectedAluno.id)
          .eq('data', hoje)
          .single()

        setRotinaHoje(data)
      } catch (error) {
        console.error('Error fetching rotina:', error)
      }
    }

    if (selectedAluno) {
      fetchRotinaHoje()
    }
  }, [selectedAluno])

  const quickLinks = [
    {
      title: 'Agenda',
      icon: Calendar,
      color: 'bg-edu-blue',
      lightColor: 'bg-edu-blue/20',
      path: '/agenda'
    },
    {
      title: 'Fotos',
      icon: Camera,
      color: 'bg-edu-purple',
      lightColor: 'bg-edu-purple/20',
      path: '/fotos'
    },
    {
      title: 'Mensagens',
      icon: MessageSquare,
      color: 'bg-edu-green',
      lightColor: 'bg-edu-green/20',
      path: '/mensagens'
    },
    {
      title: 'Financeiro',
      icon: DollarSign,
      color: 'bg-edu-orange',
      lightColor: 'bg-edu-orange/20',
      path: '/financeiro'
    }
  ]

  const getHumorIcon = (humor) => {
    const moods = {
      feliz: { icon: '😊', color: 'text-green-500' },
      tranquilo: { icon: '😌', color: 'text-blue-500' },
      sonolento: { icon: '😴', color: 'text-purple-500' },
      irritado: { icon: '😠', color: 'text-red-500' },
      choroso: { icon: '😢', color: 'text-gray-500' }
    }
    return moods[humor] || { icon: '😐', color: 'text-gray-400' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-orange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Student Selector */}
        {alunos.length > 1 && (
          <div className="mb-6">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {alunos.map((aluno) => (
                <button
                  key={aluno.id}
                  onClick={() => setSelectedAluno(aluno)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                    selectedAluno?.id === aluno.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {aluno.foto_url ? (
                      <img
                        src={aluno.foto_url}
                        alt={aluno.nome}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-bold text-sm">
                        {aluno.nome.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{aluno.nome}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Welcome Message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá! Como está {selectedAluno?.nome}?
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Acompanhe o dia do seu pequeno na escola
          </p>
        </div>

      {/* Today's Routine */}
      {rotinaHoje && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-edu-pink" />
            Rotina de Hoje
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mood */}
            {rotinaHoje.humor && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">Humor</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getHumorIcon(rotinaHoje.humor).icon}</span>
                  <span className="font-medium capitalize">{rotinaHoje.humor}</span>
                </div>
              </div>
            )}

            {/* Sleep */}
            {(rotinaHoje.sono_inicio || rotinaHoje.sono_fim) && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                  <Moon className="w-4 h-4" />
                  Soninho
                </p>
                <p className="font-medium">
                  {rotinaHoje.sono_inicio} - {rotinaHoje.sono_fim || 'acordado'}
                </p>
              </div>
            )}

            {/* Meals */}
            {rotinaHoje.alimentacao && rotinaHoje.alimentacao.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                  <Utensils className="w-4 h-4" />
                  Alimentação
                </p>
                <p className="font-medium">
                  {rotinaHoje.alimentacao.length} refeições
                </p>
              </div>
            )}

            {/* Diapers */}
            {rotinaHoje.fraldas && rotinaHoje.fraldas.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                  <Baby className="w-4 h-4" />
                  Fraldas
                </p>
                <p className="font-medium">
                  {rotinaHoje.fraldas.length} trocas
                </p>
              </div>
            )}
          </div>

          {rotinaHoje.observacoes && (
            <div className="mt-4 p-4 bg-edu-yellow/10 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {rotinaHoje.observacoes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => window.location.href = link.path}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow text-center"
          >
            <div className={`${link.lightColor} p-4 rounded-xl inline-flex mb-3`}>
              <link.icon className={`w-8 h-8 ${link.color.replace('bg-', 'text-')}`} />
            </div>
            <p className="font-semibold text-gray-800">{link.title}</p>
          </button>
        ))}
      </div>

      {/* Recent Communications */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-edu-yellow/20 p-2 rounded-xl">
            <AlertCircle className="w-5 h-5 text-edu-yellow" />
          </div>
          <h2 className="text-xl font-bold">Comunicados Recentes</h2>
        </div>
        
        <div className="space-y-4">
          {comunicadosRecentes.length > 0 ? (
            comunicadosRecentes.map((comunicado) => (
              <div key={comunicado.id} className="border-b pb-3 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{comunicado.titulo}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {comunicado.mensagem}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {new Date(comunicado.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum comunicado recente
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}