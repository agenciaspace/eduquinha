import { useState } from 'react'
import { Save, Settings, Users, Bell, Shield, Database, Mail, Phone, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Configuracoes() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('escola')
  const [loading, setSaving] = useState(false)
  
  // Estados para diferentes seções
  const [escolaConfig, setEscolaConfig] = useState({
    nome: 'Eduquinha - Escola Infantil',
    cnpj: '12.345.678/0001-00',
    endereco: 'Rua das Crianças, 123 - Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    telefone: '(11) 99999-9999',
    email: 'contato@eduquinha.com.br',
    site: 'www.eduquinha.com.br',
    diretor: 'Ana Silva'
  })

  const [sistemaConfig, setSistemaConfig] = useState({
    horarioFuncionamento: {
      entrada: '07:00',
      saida: '18:00'
    },
    anoLetivo: '2025',
    capacidadeMaximaTurma: 20,
    toleranciaAtraso: 15,
    diasLetivos: 200,
    backupAutomatico: true,
    notificacoesPush: true,
    relatóriosAutomaticos: true
  })

  const [notificacoesConfig, setNotificacoesConfig] = useState({
    emailNovoAluno: true,
    emailPagamento: true,
    emailFalta: true,
    emailEvento: true,
    smsLembrete: true,
    smsUrgencia: true,
    whatsappComunicados: true,
    whatsappCobranca: false
  })

  const [privacidadeConfig, setPrivacidadeConfig] = useState({
    compartilharFotos: true,
    permitirDownload: false,
    logAtividades: true,
    retencaoDados: '5 anos',
    consentimentoPais: true,
    anonimizarRelatorios: false
  })

  const tabs = [
    { id: 'escola', label: 'Dados da Escola', icon: Settings },
    { id: 'sistema', label: 'Sistema', icon: Database },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'privacidade', label: 'Privacidade', icon: Shield },
    { id: 'usuario', label: 'Meu Perfil', icon: Users }
  ]

  const handleSave = async (section) => {
    setSaving(true)
    try {
      // Simular salvamento no banco
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Aqui seria a integração real com Supabase
      console.log(`Salvando configurações de ${section}`)
      
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-lg text-gray-600 mt-2">Gerencie as configurações do sistema</p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Lateral */}
        <div className="lg:col-span-1">
          <div className="card p-0">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-edu-blue-light text-edu-blue border-r-2 border-edu-blue' 
                        : 'text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Conteúdo das Configurações */}
        <div className="lg:col-span-3">
          <div className="card">
            {/* Dados da Escola */}
            {activeTab === 'escola' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Dados da Escola</h2>
                  <p className="text-gray-600">Informações básicas da instituição</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Escola
                    </label>
                    <input
                      type="text"
                      value={escolaConfig.nome}
                      onChange={(e) => setEscolaConfig({...escolaConfig, nome: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={escolaConfig.cnpj}
                      onChange={(e) => setEscolaConfig({...escolaConfig, cnpj: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={escolaConfig.endereco}
                      onChange={(e) => setEscolaConfig({...escolaConfig, endereco: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={escolaConfig.telefone}
                      onChange={(e) => setEscolaConfig({...escolaConfig, telefone: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={escolaConfig.email}
                      onChange={(e) => setEscolaConfig({...escolaConfig, email: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handleSave('escola')}
                    disabled={loading}
                    className="btn-primary px-6 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            )}

            {/* Configurações do Sistema */}
            {activeTab === 'sistema' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Configurações do Sistema</h2>
                  <p className="text-gray-600">Parâmetros de funcionamento da escola</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Entrada
                      </label>
                      <input
                        type="time"
                        value={sistemaConfig.horarioFuncionamento.entrada}
                        onChange={(e) => setSistemaConfig({
                          ...sistemaConfig, 
                          horarioFuncionamento: {...sistemaConfig.horarioFuncionamento, entrada: e.target.value}
                        })}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Saída
                      </label>
                      <input
                        type="time"
                        value={sistemaConfig.horarioFuncionamento.saida}
                        onChange={(e) => setSistemaConfig({
                          ...sistemaConfig, 
                          horarioFuncionamento: {...sistemaConfig.horarioFuncionamento, saida: e.target.value}
                        })}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ano Letivo
                      </label>
                      <input
                        type="number"
                        value={sistemaConfig.anoLetivo}
                        onChange={(e) => setSistemaConfig({...sistemaConfig, anoLetivo: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidade Máxima por Turma
                      </label>
                      <input
                        type="number"
                        value={sistemaConfig.capacidadeMaximaTurma}
                        onChange={(e) => setSistemaConfig({...sistemaConfig, capacidadeMaximaTurma: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Automatizações</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sistemaConfig.backupAutomatico}
                          onChange={(e) => setSistemaConfig({...sistemaConfig, backupAutomatico: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                        />
                        <span className="ml-2 text-sm text-gray-700">Backup automático diário</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sistemaConfig.notificacoesPush}
                          onChange={(e) => setSistemaConfig({...sistemaConfig, notificacoesPush: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                        />
                        <span className="ml-2 text-sm text-gray-700">Notificações push ativas</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sistemaConfig.relatóriosAutomaticos}
                          onChange={(e) => setSistemaConfig({...sistemaConfig, relatóriosAutomaticos: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                        />
                        <span className="ml-2 text-sm text-gray-700">Geração automática de relatórios</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handleSave('sistema')}
                    disabled={loading}
                    className="btn-primary px-6 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            )}

            {/* Notificações */}
            {activeTab === 'notificacoes' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Configurações de Notificações</h2>
                  <p className="text-gray-600">Gerencie como e quando enviar notificações</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Email</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Notificar novo aluno matriculado</span>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.emailNovoAluno}
                          onChange={(e) => setNotificacoesConfig({...notificacoesConfig, emailNovoAluno: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Lembrete de pagamento</span>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.emailPagamento}
                          onChange={(e) => setNotificacoesConfig({...notificacoesConfig, emailPagamento: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Notificar faltas</span>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.emailFalta}
                          onChange={(e) => setNotificacoesConfig({...notificacoesConfig, emailFalta: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">WhatsApp</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Comunicados gerais</span>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.whatsappComunicados}
                          onChange={(e) => setNotificacoesConfig({...notificacoesConfig, whatsappComunicados: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Cobranças e lembretes</span>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.whatsappCobranca}
                          onChange={(e) => setNotificacoesConfig({...notificacoesConfig, whatsappCobranca: e.target.checked})}
                          className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handleSave('notificacoes')}
                    disabled={loading}
                    className="btn-primary px-6 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            )}

            {/* Privacidade */}
            {activeTab === 'privacidade' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Configurações de Privacidade</h2>
                  <p className="text-gray-600">Controle o uso e compartilhamento de dados</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Compartilhar fotos das atividades</span>
                        <p className="text-xs text-gray-500">Permite envio de fotos para os pais</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacidadeConfig.compartilharFotos}
                        onChange={(e) => setPrivacidadeConfig({...privacidadeConfig, compartilharFotos: e.target.checked})}
                        className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Permitir download de relatórios</span>
                        <p className="text-xs text-gray-500">Pais podem baixar relatórios dos filhos</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacidadeConfig.permitirDownload}
                        onChange={(e) => setPrivacidadeConfig({...privacidadeConfig, permitirDownload: e.target.checked})}
                        className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Registrar log de atividades</span>
                        <p className="text-xs text-gray-500">Mantém histórico de ações no sistema</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacidadeConfig.logAtividades}
                        onChange={(e) => setPrivacidadeConfig({...privacidadeConfig, logAtividades: e.target.checked})}
                        className="rounded border-gray-300 text-edu-blue focus:ring-edu-blue"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo de retenção dos dados
                    </label>
                    <select
                      value={privacidadeConfig.retencaoDados}
                      onChange={(e) => setPrivacidadeConfig({...privacidadeConfig, retencaoDados: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    >
                      <option value="1 ano">1 ano</option>
                      <option value="3 anos">3 anos</option>
                      <option value="5 anos">5 anos</option>
                      <option value="10 anos">10 anos</option>
                      <option value="indefinido">Indefinido</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handleSave('privacidade')}
                    disabled={loading}
                    className="btn-primary px-6 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            )}

            {/* Perfil do Usuário */}
            {activeTab === 'usuario' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Meu Perfil</h2>
                  <p className="text-gray-600">Suas informações pessoais</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.user_metadata?.nome || user?.email}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      defaultValue="Administrador"
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Alterar Senha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Senha
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-edu-blue focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handleSave('usuario')}
                    disabled={loading}
                    className="btn-primary px-6 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}