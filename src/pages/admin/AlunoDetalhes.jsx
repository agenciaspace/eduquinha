import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Calendar, Users, Phone, Mail, MapPin, Clock, Heart, Baby, Plus, Save, X, Check, UserPlus, Stethoscope, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AlunoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [aluno, setAluno] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('geral')
  const [editMode, setEditMode] = useState(false)
  const [showAddRotina, setShowAddRotina] = useState(false)
  const [showAddResponsavel, setShowAddResponsavel] = useState(false)
  const [showEditSaude, setShowEditSaude] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({})
  const [novoResponsavel, setNovoResponsavel] = useState({
    nome: '',
    telefone: '',
    email: '',
    parentesco: 'pai',
    endereco: '',
    profissao: '',
    contato_emergencia: false
  })
  const [saudeData, setSaudeData] = useState({
    alergias: '',
    restricoes: '',
    medicamentos: '',
    condicoes_medicas: '',
    pediatra_nome: '',
    pediatra_telefone: '',
    plano_saude: '',
    numero_plano: '',
    observacoes_medicas: ''
  })
  const [novaRotina, setNovaRotina] = useState({
    data: new Date().toISOString().split('T')[0],
    sono_inicio: '',
    sono_fim: '',
    humor: 'feliz',
    observacoes: '',
    atividades: '',
    alimentacao: '',
    // Campos de higiene/fraldas
    trocas_fraldas: 0,
    fraldas_xixi: 0,
    fraldas_coco: 0,
    horarios_fraldas: '',
    idas_banheiro: 0,
    xixi_banheiro: 0,
    coco_banheiro: 0,
    acidentes_xixi: 0,
    acidentes_coco: 0,
    horarios_banheiro: '',
    escovacao_dentes: false,
    lavagem_maos: 0,
    banho_dado: false,
    troca_roupas: false,
    observacoes_higiene: ''
  })

  const tabs = [
    { id: 'geral', label: 'Informações Gerais', icon: Users },
    { id: 'rotina', label: 'Rotina Diária', icon: Clock },
    { id: 'saude', label: 'Saúde', icon: Heart },
    { id: 'responsaveis', label: 'Responsáveis', icon: Phone }
  ]

  const fetchAlunoDetalhes = useCallback(async () => {
    try {
      console.log('Fetching student details for ID:', id)
      
      // Buscar dados completos do aluno com query simplificada
      const { data: alunoData, error } = await supabase
        .from('alunos')
        .select(`
          *,
          turmas(nome, faixa_etaria, professor_id),
          aluno_responsavel(
            parentesco,
            profiles(nome, telefone, email)
          ),
          rotinas(*),
          presencas(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Database query error:', error)
        throw error
      }
      
      console.log('Student data fetched successfully:', alunoData?.nome)

      // Calcular idade
      const hoje = new Date()
      const nascimento = new Date(alunoData.data_nascimento)
      let idadeAnos = hoje.getFullYear() - nascimento.getFullYear()
      const mes = hoje.getMonth() - nascimento.getMonth()
      
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idadeAnos--
      }
      
      let idade
      if (idadeAnos === 0) {
        const meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + hoje.getMonth() - nascimento.getMonth()
        idade = `${meses} meses`
      } else {
        idade = `${idadeAnos} ${idadeAnos === 1 ? 'ano' : 'anos'}`
      }
      
      // Determinar emoji baseado na idade
      let foto = '👶'
      const idadeNumero = calcularIdadeNumero(alunoData.data_nascimento)
      if (idadeNumero >= 2) foto = Math.random() > 0.5 ? '👦' : '👧'

      // Buscar professor se tiver professor_id
      let professorInfo = null
      if (alunoData.turmas?.professor_id) {
        try {
          const { data: professor } = await supabase
            .from('profiles')
            .select('nome')
            .eq('id', alunoData.turmas.professor_id)
            .single()
          
          if (professor) {
            professorInfo = { nome: professor.nome }
          }
        } catch (profError) {
          console.warn('Could not fetch professor info:', profError)
        }
      }

      const alunoFormatado = {
        id: alunoData.id,
        nome: alunoData.nome,
        dataNascimento: alunoData.data_nascimento,
        idade,
        turma: alunoData.turmas ? {
          nome: alunoData.turmas.nome,
          faixa_etaria: alunoData.turmas.faixa_etaria,
          professor: professorInfo
        } : { nome: 'Sem turma', faixa_etaria: '', professor: null },
        responsaveis: alunoData.aluno_responsavel?.map(r => ({
          nome: r.profiles.nome,
          telefone: r.profiles.telefone,
          email: r.profiles.email,
          parentesco: r.parentesco
        })) || [],
        foto,
        alergias: alunoData.alergias || 'Nenhuma alergia conhecida',
        restricoes: alunoData.restricoes || 'Nenhuma restrição',
        observacoes: alunoData.observacoes || 'Nenhuma observação especial',
        rotinas: alunoData.rotinas || [],
        presencas: alunoData.presencas || [],
        status: 'ativo'
      }

      setAluno(alunoFormatado)
      console.log('Student details set successfully')
    } catch (error) {
      console.error('Error fetching aluno:', error)
      console.error('Student ID that failed:', id)
      // Don't set aluno to null, leave it as initial state so the "not found" message shows
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchAlunoDetalhes()
    }
  }, [id, fetchAlunoDetalhes])

  const calcularIdadeNumero = (dataNascimento) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    
    return idade
  }



  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const handleEditToggle = () => {
    if (editMode) {
      setEditData({})
    } else {
      setEditData({
        nome: aluno.nome,
        dataNascimento: aluno.dataNascimento,
        observacoes: aluno.observacoes,
        alergias: aluno.alergias,
        restricoes: aluno.restricoes
      })
    }
    setEditMode(!editMode)
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          nome: editData.nome,
          data_nascimento: editData.dataNascimento,
          observacoes: editData.observacoes,
          alergias: editData.alergias,
          restricoes: editData.restricoes
        })
        .eq('id', id)

      if (error) throw error

      // Atualizar dados locais
      setAluno(prev => ({
        ...prev,
        nome: editData.nome,
        dataNascimento: editData.dataNascimento,
        observacoes: editData.observacoes,
        alergias: editData.alergias,
        restricoes: editData.restricoes
      }))

      setEditMode(false)
      alert('Dados atualizados com sucesso!')
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Erro ao atualizar dados do aluno')
    } finally {
      setSaving(false)
    }
  }

  const handleAddRotina = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('rotinas')
        .insert({
          aluno_id: id,
          data: novaRotina.data,
          sono_inicio: novaRotina.sono_inicio,
          sono_fim: novaRotina.sono_fim,
          humor: novaRotina.humor,
          observacoes: novaRotina.observacoes,
          atividades: novaRotina.atividades,
          alimentacao: novaRotina.alimentacao,
          // Campos de higiene
          trocas_fraldas: novaRotina.trocas_fraldas,
          fraldas_xixi: novaRotina.fraldas_xixi,
          fraldas_coco: novaRotina.fraldas_coco,
          horarios_fraldas: novaRotina.horarios_fraldas,
          idas_banheiro: novaRotina.idas_banheiro,
          xixi_banheiro: novaRotina.xixi_banheiro,
          coco_banheiro: novaRotina.coco_banheiro,
          acidentes_xixi: novaRotina.acidentes_xixi,
          acidentes_coco: novaRotina.acidentes_coco,
          horarios_banheiro: novaRotina.horarios_banheiro,
          escovacao_dentes: novaRotina.escovacao_dentes,
          lavagem_maos: novaRotina.lavagem_maos,
          banho_dado: novaRotina.banho_dado,
          troca_roupas: novaRotina.troca_roupas,
          observacoes_higiene: novaRotina.observacoes_higiene
        })

      if (error) throw error

      // Recarregar dados
      await fetchAlunoDetalhes()
      
      // Reset form
      setNovaRotina({
        data: new Date().toISOString().split('T')[0],
        sono_inicio: '',
        sono_fim: '',
        humor: 'feliz',
        observacoes: '',
        atividades: '',
        alimentacao: '',
        trocas_fraldas: 0,
        fraldas_xixi: 0,
        fraldas_coco: 0,
        horarios_fraldas: '',
        idas_banheiro: 0,
        xixi_banheiro: 0,
        coco_banheiro: 0,
        acidentes_xixi: 0,
        acidentes_coco: 0,
        horarios_banheiro: '',
        escovacao_dentes: false,
        lavagem_maos: 0,
        banho_dado: false,
        troca_roupas: false,
        observacoes_higiene: ''
      })
      
      setShowAddRotina(false)
      alert('Rotina adicionada com sucesso!')
    } catch (error) {
      console.error('Error adding routine:', error)
      alert('Erro ao adicionar rotina')
    } finally {
      setSaving(false)
    }
  }

  const handleAddResponsavel = async () => {
    setSaving(true)
    try {
      // Primeiro, criar o perfil do responsável
      const { data: perfilData, error: perfilError } = await supabase
        .from('profiles')
        .insert({
          nome: novoResponsavel.nome,
          telefone: novoResponsavel.telefone,
          email: novoResponsavel.email,
          role: 'responsavel',
          endereco: novoResponsavel.endereco,
          profissao: novoResponsavel.profissao
        })
        .select()
        .single()

      if (perfilError) throw perfilError

      // Depois, criar a relação aluno-responsável
      const { error: relacaoError } = await supabase
        .from('aluno_responsavel')
        .insert({
          aluno_id: id,
          responsavel_id: perfilData.id,
          parentesco: novoResponsavel.parentesco,
          contato_emergencia: novoResponsavel.contato_emergencia
        })

      if (relacaoError) throw relacaoError

      // Recarregar dados
      await fetchAlunoDetalhes()
      
      // Reset form
      setNovoResponsavel({
        nome: '',
        telefone: '',
        email: '',
        parentesco: 'pai',
        endereco: '',
        profissao: '',
        contato_emergencia: false
      })
      
      setShowAddResponsavel(false)
      alert('Responsável adicionado com sucesso!')
    } catch (error) {
      console.error('Error adding responsavel:', error)
      alert('Erro ao adicionar responsável: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSaude = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          alergias: saudeData.alergias,
          restricoes: saudeData.restricoes,
          medicamentos: saudeData.medicamentos,
          condicoes_medicas: saudeData.condicoes_medicas,
          pediatra_nome: saudeData.pediatra_nome,
          pediatra_telefone: saudeData.pediatra_telefone,
          plano_saude: saudeData.plano_saude,
          numero_plano: saudeData.numero_plano,
          observacoes_medicas: saudeData.observacoes_medicas
        })
        .eq('id', id)

      if (error) throw error

      // Atualizar dados locais
      setAluno(prev => ({
        ...prev,
        alergias: saudeData.alergias,
        restricoes: saudeData.restricoes,
        medicamentos: saudeData.medicamentos,
        condicoes_medicas: saudeData.condicoes_medicas,
        pediatra_nome: saudeData.pediatra_nome,
        pediatra_telefone: saudeData.pediatra_telefone,
        plano_saude: saudeData.plano_saude,
        numero_plano: saudeData.numero_plano,
        observacoes_medicas: saudeData.observacoes_medicas
      }))

      setShowEditSaude(false)
      alert('Dados de saúde atualizados com sucesso!')
    } catch (error) {
      console.error('Error updating health data:', error)
      alert('Erro ao atualizar dados de saúde')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveResponsavel = async (responsavelId) => {
    if (!confirm('Tem certeza que deseja remover este responsável?')) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('aluno_responsavel')
        .delete()
        .eq('aluno_id', id)
        .eq('responsavel_id', responsavelId)

      if (error) throw error

      // Recarregar dados
      await fetchAlunoDetalhes()
      alert('Responsável removido com sucesso!')
    } catch (error) {
      console.error('Error removing responsavel:', error)
      alert('Erro ao remover responsável')
    } finally {
      setSaving(false)
    }
  }

  const initSaudeData = () => {
    setSaudeData({
      alergias: aluno?.alergias || '',
      restricoes: aluno?.restricoes || '',
      medicamentos: aluno?.medicamentos || '',
      condicoes_medicas: aluno?.condicoes_medicas || '',
      pediatra_nome: aluno?.pediatra_nome || '',
      pediatra_telefone: aluno?.pediatra_telefone || '',
      plano_saude: aluno?.plano_saude || '',
      numero_plano: aluno?.numero_plano || '',
      observacoes_medicas: aluno?.observacoes_medicas || ''
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando detalhes do aluno...</p>
        </div>
      </div>
    )
  }

  if (!aluno) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aluno não encontrado</h3>
          <button onClick={() => navigate('/alunos')} className="btn-primary">
            Voltar para Alunos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/alunos')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{aluno.nome}</h1>
          <p className="text-gray-600 mt-2">{aluno.idade} • {aluno.turma.nome}</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button 
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button 
                onClick={handleEditToggle}
                className="btn-secondary px-6 py-2 flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </>
          ) : (
            <button 
              onClick={handleEditToggle}
              className="btn-primary px-6 py-2 flex items-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              Editar Aluno
            </button>
          )}
        </div>
      </div>

      {/* Perfil Overview */}
      <div className="card mb-8">
        <div className="flex items-center gap-6">
          <div className="text-6xl">{aluno.foto}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{aluno.nome}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Idade</p>
                <p className="font-medium">{aluno.idade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Turma</p>
                <p className="font-medium">{aluno.turma.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                  {aluno.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-edu-blue text-edu-blue'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Informações Gerais */}
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Informações Pessoais</h3>
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                      <input
                        type="text"
                        value={editData.nome || ''}
                        onChange={(e) => setEditData({...editData, nome: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                      <input
                        type="date"
                        value={editData.dataNascimento || ''}
                        onChange={(e) => setEditData({...editData, dataNascimento: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Observações Gerais</label>
                      <textarea
                        value={editData.observacoes || ''}
                        onChange={(e) => setEditData({...editData, observacoes: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nome Completo</p>
                      <p className="font-medium">{aluno.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Data de Nascimento</p>
                      <p className="font-medium">{formatarData(aluno.dataNascimento)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Idade</p>
                      <p className="font-medium">{aluno.idade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Turma</p>
                      <p className="font-medium">{aluno.turma.nome}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Observações Gerais</p>
                      <p className="text-gray-600">{aluno.observacoes || 'Nenhuma observação registrada'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Turma</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nome da Turma</p>
                    <p className="font-medium">{aluno.turma.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Faixa Etária</p>
                    <p className="font-medium">{aluno.turma.faixa_etaria || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Professor(a)</p>
                    <p className="font-medium">{aluno.turma.professor?.nome || 'Não atribuído'}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Frequência</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Presenças este mês</p>
                    <p className="font-medium text-edu-green">{aluno.presencas.filter(p => p.presente).length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Faltas este mês</p>
                    <p className="font-medium text-red-600">{aluno.presencas.filter(p => !p.presente).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saúde */}
        {activeTab === 'saude' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Informações de Saúde</h3>
              <button
                onClick={() => {
                  initSaudeData()
                  setShowEditSaude(true)
                }}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                Editar Saúde
              </button>
            </div>

            {/* Form de edição de saúde */}
            {showEditSaude && (
              <div className="card">
                <h4 className="text-lg font-semibold text-gray-800 mb-6">Atualizar Dados de Saúde</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alergias</label>
                    <textarea
                      value={saudeData.alergias}
                      onChange={(e) => setSaudeData({...saudeData, alergias: e.target.value})}
                      rows={3}
                      placeholder="Descreva as alergias conhecidas..."
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Restrições</label>
                    <textarea
                      value={saudeData.restricoes}
                      onChange={(e) => setSaudeData({...saudeData, restricoes: e.target.value})}
                      rows={3}
                      placeholder="Restrições alimentares/médicas..."
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medicamentos</label>
                    <textarea
                      value={saudeData.medicamentos}
                      onChange={(e) => setSaudeData({...saudeData, medicamentos: e.target.value})}
                      rows={3}
                      placeholder="Medicamentos em uso..."
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condições Médicas</label>
                    <textarea
                      value={saudeData.condicoes_medicas}
                      onChange={(e) => setSaudeData({...saudeData, condicoes_medicas: e.target.value})}
                      rows={3}
                      placeholder="Condições médicas relevantes..."
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Pediatra</label>
                    <input
                      type="text"
                      value={saudeData.pediatra_nome}
                      onChange={(e) => setSaudeData({...saudeData, pediatra_nome: e.target.value})}
                      placeholder="Dr(a). Nome do Pediatra"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone do Pediatra</label>
                    <input
                      type="text"
                      value={saudeData.pediatra_telefone}
                      onChange={(e) => setSaudeData({...saudeData, pediatra_telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plano de Saúde</label>
                    <input
                      type="text"
                      value={saudeData.plano_saude}
                      onChange={(e) => setSaudeData({...saudeData, plano_saude: e.target.value})}
                      placeholder="Nome do plano de saúde"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número do Plano</label>
                    <input
                      type="text"
                      value={saudeData.numero_plano}
                      onChange={(e) => setSaudeData({...saudeData, numero_plano: e.target.value})}
                      placeholder="Número da carteirinha"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações Médicas</label>
                    <textarea
                      value={saudeData.observacoes_medicas}
                      onChange={(e) => setSaudeData({...saudeData, observacoes_medicas: e.target.value})}
                      rows={3}
                      placeholder="Outras informações médicas relevantes..."
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateSaude}
                    disabled={saving}
                    className="btn-primary px-4 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setShowEditSaude(false)}
                    className="btn-secondary px-4 py-2 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Exibição dos dados de saúde */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">🚨 Alergias</h4>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800">{aluno.alergias || 'Nenhuma alergia conhecida'}</p>
                </div>
              </div>

              <div className="card">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Restrições</h4>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800">{aluno.restricoes || 'Nenhuma restrição'}</p>
                </div>
              </div>

              <div className="card">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">💊 Medicamentos</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">{aluno.medicamentos || 'Nenhum medicamento em uso'}</p>
                </div>
              </div>

              <div className="card">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">🏥 Condições Médicas</h4>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800">{aluno.condicoes_medicas || 'Nenhuma condição médica'}</p>
                </div>
              </div>

              <div className="card">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">👨‍⚕️ Pediatra</h4>
                <div className="space-y-2">
                  <p><strong>Nome:</strong> {aluno.pediatra_nome || 'Não informado'}</p>
                  <p><strong>Telefone:</strong> {aluno.pediatra_telefone || 'Não informado'}</p>
                </div>
              </div>

              <div className="card">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">🏥 Plano de Saúde</h4>
                <div className="space-y-2">
                  <p><strong>Plano:</strong> {aluno.plano_saude || 'Não informado'}</p>
                  <p><strong>Número:</strong> {aluno.numero_plano || 'Não informado'}</p>
                </div>
              </div>

              {aluno.observacoes_medicas && (
                <div className="card md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Observações Médicas</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{aluno.observacoes_medicas}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Responsáveis */}
        {activeTab === 'responsaveis' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Responsáveis</h3>
              <button
                onClick={() => setShowAddResponsavel(true)}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar Responsável
              </button>
            </div>

            {/* Form para adicionar responsável */}
            {showAddResponsavel && (
              <div className="card">
                <h4 className="text-lg font-semibold text-gray-800 mb-6">Adicionar Novo Responsável</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={novoResponsavel.nome}
                      onChange={(e) => setNovoResponsavel({...novoResponsavel, nome: e.target.value})}
                      placeholder="Nome completo do responsável"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parentesco *</label>
                    <select
                      value={novoResponsavel.parentesco}
                      onChange={(e) => setNovoResponsavel({...novoResponsavel, parentesco: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    >
                      <option value="pai">Pai</option>
                      <option value="mae">Mãe</option>
                      <option value="avo">Avô/Avó</option>
                      <option value="tio">Tio/Tia</option>
                      <option value="responsavel_legal">Responsável Legal</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                    <input
                      type="text"
                      value={novoResponsavel.telefone}
                      onChange={(e) => setNovoResponsavel({...novoResponsavel, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={novoResponsavel.email}
                      onChange={(e) => setNovoResponsavel({...novoResponsavel, email: e.target.value})}
                      placeholder="email@exemplo.com"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profissão</label>
                    <input
                      type="text"
                      value={novoResponsavel.profissao}
                      onChange={(e) => setNovoResponsavel({...novoResponsavel, profissao: e.target.value})}
                      placeholder="Profissão"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={novoResponsavel.endereco}
                      onChange={(e) => setNovoResponsavel({...novoResponsavel, endereco: e.target.value})}
                      placeholder="Endereço completo"
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="contato_emergencia"
                        checked={novoResponsavel.contato_emergencia}
                        onChange={(e) => setNovoResponsavel({...novoResponsavel, contato_emergencia: e.target.checked})}
                        className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue mr-2"
                      />
                      <label htmlFor="contato_emergencia" className="text-sm font-medium text-gray-700">
                        🚨 Contato de emergência
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddResponsavel}
                    disabled={saving || !novoResponsavel.nome || !novoResponsavel.telefone}
                    className="btn-primary px-4 py-2 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? 'Adicionando...' : 'Adicionar'}
                  </button>
                  <button
                    onClick={() => setShowAddResponsavel(false)}
                    className="btn-secondary px-4 py-2 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de responsáveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aluno.responsaveis.map((responsavel, index) => (
                <div key={index} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {responsavel.parentesco ? responsavel.parentesco.charAt(0).toUpperCase() + responsavel.parentesco.slice(1) : 'Responsável'} {index + 1}
                    </h4>
                    <button
                      onClick={() => handleRemoveResponsavel(responsavel.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remover responsável"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{responsavel.nome}</span>
                    </div>
                    {responsavel.telefone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span>{responsavel.telefone}</span>
                      </div>
                    )}
                    {responsavel.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span className="text-sm">{responsavel.email}</span>
                      </div>
                    )}
                    {responsavel.profissao && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span className="text-sm">{responsavel.profissao}</span>
                      </div>
                    )}
                    {responsavel.contato_emergencia && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          🚨 Contato de Emergência
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {aluno.responsaveis.length === 0 && !showAddResponsavel && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Nenhum responsável cadastrado</p>
                  <p>Clique em "Adicionar Responsável" para cadastrar o primeiro responsável</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rotina */}
        {activeTab === 'rotina' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Rotina Diária</h3>
                <button
                  onClick={() => setShowAddRotina(true)}
                  className="btn-primary px-4 py-2 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Rotina
                </button>
              </div>

              {/* Form para adicionar nova rotina */}
              {showAddRotina && (
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Adicionar Nova Rotina</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                      <input
                        type="date"
                        value={novaRotina.data}
                        onChange={(e) => setNovaRotina({...novaRotina, data: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Humor</label>
                      <select
                        value={novaRotina.humor}
                        onChange={(e) => setNovaRotina({...novaRotina, humor: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      >
                        <option value="feliz">😊 Feliz</option>
                        <option value="triste">😢 Triste</option>
                        <option value="irritado">😠 Irritado</option>
                        <option value="sonolento">😴 Sonolento</option>
                        <option value="animado">🤗 Animado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sono - Início</label>
                      <input
                        type="time"
                        value={novaRotina.sono_inicio}
                        onChange={(e) => setNovaRotina({...novaRotina, sono_inicio: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sono - Fim</label>
                      <input
                        type="time"
                        value={novaRotina.sono_fim}
                        onChange={(e) => setNovaRotina({...novaRotina, sono_fim: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alimentação</label>
                      <input
                        type="text"
                        value={novaRotina.alimentacao}
                        onChange={(e) => setNovaRotina({...novaRotina, alimentacao: e.target.value})}
                        placeholder="Ex: Aceitou bem, comeu tudo..."
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Atividades</label>
                      <input
                        type="text"
                        value={novaRotina.atividades}
                        onChange={(e) => setNovaRotina({...novaRotina, atividades: e.target.value})}
                        placeholder="Ex: Brincou no parque, pintou..."
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Seção de Higiene e Fraldas */}
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🧷 Higiene e Fraldas
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trocas de Fraldas</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.trocas_fraldas}
                          onChange={(e) => setNovaRotina({...novaRotina, trocas_fraldas: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fraldas c/ Xixi 💧</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.fraldas_xixi}
                          onChange={(e) => setNovaRotina({...novaRotina, fraldas_xixi: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fraldas c/ Cocô 💩</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.fraldas_coco}
                          onChange={(e) => setNovaRotina({...novaRotina, fraldas_coco: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Horários das Trocas</label>
                        <input
                          type="text"
                          value={novaRotina.horarios_fraldas}
                          onChange={(e) => setNovaRotina({...novaRotina, horarios_fraldas: e.target.value})}
                          placeholder="Ex: 09:30, 12:00, 15:45"
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção de Banheiro */}
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🚽 Uso do Banheiro
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Idas ao Banheiro</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.idas_banheiro}
                          onChange={(e) => setNovaRotina({...novaRotina, idas_banheiro: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sucessos Xixi 💧✅</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.xixi_banheiro}
                          onChange={(e) => setNovaRotina({...novaRotina, xixi_banheiro: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sucessos Cocô 💩✅</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.coco_banheiro}
                          onChange={(e) => setNovaRotina({...novaRotina, coco_banheiro: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Acidentes Xixi ⚠️</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.acidentes_xixi}
                          onChange={(e) => setNovaRotina({...novaRotina, acidentes_xixi: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Acidentes Cocô ⚠️</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.acidentes_coco}
                          onChange={(e) => setNovaRotina({...novaRotina, acidentes_coco: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Horários Banheiro</label>
                        <input
                          type="text"
                          value={novaRotina.horarios_banheiro}
                          onChange={(e) => setNovaRotina({...novaRotina, horarios_banheiro: e.target.value})}
                          placeholder="Ex: 10:00, 14:30"
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção de Cuidados Pessoais */}
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🧼 Cuidados Pessoais
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="escovacao_dentes"
                          checked={novaRotina.escovacao_dentes}
                          onChange={(e) => setNovaRotina({...novaRotina, escovacao_dentes: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue mr-2"
                        />
                        <label htmlFor="escovacao_dentes" className="text-sm font-medium text-gray-700">
                          🪥 Escovação dos Dentes
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🧼 Lavagem das Mãos</label>
                        <input
                          type="number"
                          min="0"
                          value={novaRotina.lavagem_maos}
                          onChange={(e) => setNovaRotina({...novaRotina, lavagem_maos: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="banho_dado"
                          checked={novaRotina.banho_dado}
                          onChange={(e) => setNovaRotina({...novaRotina, banho_dado: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue mr-2"
                        />
                        <label htmlFor="banho_dado" className="text-sm font-medium text-gray-700">
                          🛁 Banho Dado
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="troca_roupas"
                          checked={novaRotina.troca_roupas}
                          onChange={(e) => setNovaRotina({...novaRotina, troca_roupas: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue mr-2"
                        />
                        <label htmlFor="troca_roupas" className="text-sm font-medium text-gray-700">
                          👕 Troca de Roupas
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Observações de Higiene</label>
                        <textarea
                          value={novaRotina.observacoes_higiene}
                          onChange={(e) => setNovaRotina({...novaRotina, observacoes_higiene: e.target.value})}
                          rows={2}
                          placeholder="Ex: Precisou de ajuda para lavar as mãos..."
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações Gerais */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">📝 Observações Gerais</label>
                    <textarea
                      value={novaRotina.observacoes}
                      onChange={(e) => setNovaRotina({...novaRotina, observacoes: e.target.value})}
                      rows={3}
                      placeholder="Observações sobre o dia..."
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAddRotina}
                      disabled={saving}
                      className="btn-primary px-4 py-2 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {saving ? 'Salvando...' : 'Salvar Rotina'}
                    </button>
                    <button
                      onClick={() => setShowAddRotina(false)}
                      className="btn-secondary px-4 py-2 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de rotinas */}
              {aluno.rotinas.length > 0 ? (
                <div className="space-y-4">
                  {aluno.rotinas.slice(0, 10).map((rotina, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-medium text-lg">{formatarData(rotina.data)}</p>
                          <p className="text-sm text-gray-600">Registrado por: Professor</p>
                        </div>
                        <span className="text-2xl">{rotina.humor === 'feliz' ? '😊' : rotina.humor === 'triste' ? '😢' : rotina.humor === 'irritado' ? '😠' : rotina.humor === 'sonolento' ? '😴' : '🤗'}</span>
                      </div>
                      {/* Informações Básicas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">😴 Sono</p>
                          <p className="text-gray-600">{rotina.sono_inicio && rotina.sono_fim ? `${rotina.sono_inicio} - ${rotina.sono_fim}` : 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">😊 Humor</p>
                          <p className="text-gray-600 capitalize">{rotina.humor}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">🍽️ Alimentação</p>
                          <p className="text-gray-600">{rotina.alimentacao || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">🎨 Atividades</p>
                          <p className="text-gray-600">{rotina.atividades || 'Não informado'}</p>
                        </div>
                      </div>

                      {/* Seção de Higiene - só mostra se tem dados */}
                      {(rotina.trocas_fraldas > 0 || rotina.fraldas_xixi > 0 || rotina.fraldas_coco > 0 || 
                        rotina.idas_banheiro > 0 || rotina.xixi_banheiro > 0 || rotina.coco_banheiro > 0 ||
                        rotina.acidentes_xixi > 0 || rotina.acidentes_coco > 0 || rotina.escovacao_dentes ||
                        rotina.lavagem_maos > 0 || rotina.banho_dado || rotina.troca_roupas) && (
                        <div className="border-t pt-4 mb-4">
                          <h6 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            🧷 Higiene e Cuidados
                          </h6>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                            {rotina.trocas_fraldas > 0 && (
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="font-medium text-blue-700">🧷 Fraldas</p>
                                <p className="text-blue-600">{rotina.trocas_fraldas} trocas</p>
                              </div>
                            )}
                            {rotina.fraldas_xixi > 0 && (
                              <div className="bg-cyan-50 p-2 rounded">
                                <p className="font-medium text-cyan-700">💧 Xixi</p>
                                <p className="text-cyan-600">{rotina.fraldas_xixi} fraldas</p>
                              </div>
                            )}
                            {rotina.fraldas_coco > 0 && (
                              <div className="bg-orange-50 p-2 rounded">
                                <p className="font-medium text-orange-700">💩 Cocô</p>
                                <p className="text-orange-600">{rotina.fraldas_coco} fraldas</p>
                              </div>
                            )}
                            {rotina.idas_banheiro > 0 && (
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="font-medium text-purple-700">🚽 Banheiro</p>
                                <p className="text-purple-600">{rotina.idas_banheiro} idas</p>
                              </div>
                            )}
                            {rotina.xixi_banheiro > 0 && (
                              <div className="bg-green-50 p-2 rounded">
                                <p className="font-medium text-green-700">✅ Xixi OK</p>
                                <p className="text-green-600">{rotina.xixi_banheiro}</p>
                              </div>
                            )}
                            {rotina.coco_banheiro > 0 && (
                              <div className="bg-green-50 p-2 rounded">
                                <p className="font-medium text-green-700">✅ Cocô OK</p>
                                <p className="text-green-600">{rotina.coco_banheiro}</p>
                              </div>
                            )}
                            {rotina.acidentes_xixi > 0 && (
                              <div className="bg-red-50 p-2 rounded">
                                <p className="font-medium text-red-700">⚠️ Acidentes</p>
                                <p className="text-red-600">{rotina.acidentes_xixi} xixi</p>
                              </div>
                            )}
                            {rotina.acidentes_coco > 0 && (
                              <div className="bg-red-50 p-2 rounded">
                                <p className="font-medium text-red-700">⚠️ Acidentes</p>
                                <p className="text-red-600">{rotina.acidentes_coco} cocô</p>
                              </div>
                            )}
                            {rotina.escovacao_dentes && (
                              <div className="bg-mint-50 p-2 rounded">
                                <p className="font-medium text-green-700">🪥 Dentes</p>
                                <p className="text-green-600">Escovado</p>
                              </div>
                            )}
                            {rotina.lavagem_maos > 0 && (
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="font-medium text-blue-700">🧼 Mãos</p>
                                <p className="text-blue-600">{rotina.lavagem_maos}x</p>
                              </div>
                            )}
                            {rotina.banho_dado && (
                              <div className="bg-cyan-50 p-2 rounded">
                                <p className="font-medium text-cyan-700">🛁 Banho</p>
                                <p className="text-cyan-600">Dado</p>
                              </div>
                            )}
                            {rotina.troca_roupas && (
                              <div className="bg-yellow-50 p-2 rounded">
                                <p className="font-medium text-yellow-700">👕 Roupas</p>
                                <p className="text-yellow-600">Trocadas</p>
                              </div>
                            )}
                          </div>
                          {/* Horários */}
                          {(rotina.horarios_fraldas || rotina.horarios_banheiro) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {rotina.horarios_fraldas && (
                                <p className="text-xs text-gray-600 mb-1">
                                  <strong>Horários fraldas:</strong> {rotina.horarios_fraldas}
                                </p>
                              )}
                              {rotina.horarios_banheiro && (
                                <p className="text-xs text-gray-600">
                                  <strong>Horários banheiro:</strong> {rotina.horarios_banheiro}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Observações */}
                      <div className="space-y-2">
                        {rotina.observacoes && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">📝 Observações Gerais</p>
                            <p className="text-gray-600">{rotina.observacoes}</p>
                          </div>
                        )}
                        {rotina.observacoes_higiene && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">🧼 Observações de Higiene</p>
                            <p className="text-gray-600">{rotina.observacoes_higiene}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Nenhuma rotina registrada ainda</p>
                  <p>Clique em "Nova Rotina" para registrar a primeira rotina do aluno</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}