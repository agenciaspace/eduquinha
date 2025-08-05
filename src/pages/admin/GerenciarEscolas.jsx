import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ExternalLink, Copy, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getSchoolUrl } from '../../utils/subdomain'
import InputField from '../../components/InputField'

export default function GerenciarEscolas() {
  const [escolas, setEscolas] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('create') // 'create' or 'edit'
  const [selectedEscola, setSelectedEscola] = useState(null)
  const [copiedUrl, setCopiedUrl] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    endereco: '',
    telefone: '',
    email: '',
    cnpj: '',
    responsavel_nome: '',
    responsavel_email: '',
    mensagem_login: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEscolas()
  }, [])

  const fetchEscolas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEscolas(data || [])
    } catch (error) {
      console.error('Error fetching escolas:', error)
      setError('Erro ao carregar escolas')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (nome) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const slugToUse = formData.slug || generateSlug(formData.nome)
      
      // Check if slug already exists (for create or different school)
      const { data: existingSchool } = await supabase
        .from('escolas')
        .select('id')
        .eq('slug', slugToUse)
        .neq('id', selectedEscola?.id || 0)
        .single()

      if (existingSchool) {
        setError('Este nome de escola já está em uso. Tente outro.')
        setLoading(false)
        return
      }

      const schoolData = {
        ...formData,
        slug: slugToUse
      }

      if (modalType === 'create') {
        const { error } = await supabase
          .from('escolas')
          .insert([schoolData])

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('escolas')
          .update(schoolData)
          .eq('id', selectedEscola.id)

        if (error) throw error
      }

      await fetchEscolas()
      closeModal()
    } catch (error) {
      console.error('Error saving escola:', error)
      setError('Erro ao salvar escola: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (escola) => {
    if (!confirm(`Tem certeza que deseja excluir a escola "${escola.nome}"?`)) {
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('escolas')
        .update({ ativo: false })
        .eq('id', escola.id)

      if (error) throw error
      await fetchEscolas()
    } catch (error) {
      console.error('Error deleting escola:', error)
      setError('Erro ao excluir escola')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (type, escola = null) => {
    setModalType(type)
    setSelectedEscola(escola)
    
    if (type === 'create') {
      setFormData({
        nome: '',
        slug: '',
        endereco: '',
        telefone: '',
        email: '',
        cnpj: '',
        responsavel_nome: '',
        responsavel_email: '',
        mensagem_login: ''
      })
    } else if (type === 'edit' && escola) {
      setFormData({
        nome: escola.nome || '',
        slug: escola.slug || '',
        endereco: escola.endereco || '',
        telefone: escola.telefone || '',
        email: escola.email || '',
        cnpj: escola.cnpj || '',
        responsavel_nome: escola.responsavel_nome || '',
        responsavel_email: escola.responsavel_email || '',
        mensagem_login: escola.mensagem_login || ''
      })
    }
    
    setShowModal(true)
    setError('')
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEscola(null)
    setModalType('create')
    setError('')
  }

  const copyUrl = async (slug) => {
    const url = getSchoolUrl(slug)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(slug)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Error copying URL:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Escolas</h1>
            <p className="text-lg text-gray-600 mt-2">Cadastre e gerencie todas as escolas do sistema</p>
          </div>
          <button 
            onClick={() => openModal('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Escola
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Schools List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {escolas.map((escola) => (
            <div key={escola.id} className="bg-white shadow-md ring-1 ring-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{escola.nome}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Endereço:</strong> {escola.endereco}</p>
                    <p><strong>Email:</strong> {escola.email}</p>
                    <p><strong>Telefone:</strong> {escola.telefone}</p>
                    <p><strong>Responsável:</strong> {escola.responsavel_nome}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  escola.ativo 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {escola.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              {/* School URL */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      URL da Escola
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {getSchoolUrl(escola.slug)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyUrl(escola.slug)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Copiar URL"
                    >
                      {copiedUrl === escola.slug ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={getSchoolUrl(escola.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Abrir escola"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openModal('edit', escola)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(escola)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {escolas.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma escola cadastrada</h3>
            <p className="text-gray-600 mb-4">Comece cadastrando a primeira escola</p>
            <button 
              onClick={() => openModal('create')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Cadastrar Escola
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {modalType === 'create' ? 'Nova Escola' : 'Editar Escola'}
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputField
                    label="Nome da Escola *"
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => {
                      const nome = e.target.value
                      setFormData(prev => ({ 
                        ...prev, 
                        nome,
                        slug: generateSlug(nome)
                      }))
                    }}
                    placeholder="Ex: Escola Alegria"
                  />
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label="URL da Escola (slug) *"
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Ex: escola-alegria"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL será: {getSchoolUrl(formData.slug || 'exemplo')}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label="Endereço"
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Endereço completo"
                  />
                </div>

                <InputField
                  label="Telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />

                <InputField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@escola.com.br"
                />

                <InputField
                  label="CNPJ"
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />

                <InputField
                  label="Nome do Responsável"
                  type="text"
                  value={formData.responsavel_nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsavel_nome: e.target.value }))}
                  placeholder="Nome do diretor/responsável"
                />

                <InputField
                  label="Email do Responsável"
                  type="email"
                  value={formData.responsavel_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsavel_email: e.target.value }))}
                  placeholder="diretor@escola.com.br"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem na Tela de Login
                  </label>
                  <textarea
                    value={formData.mensagem_login}
                    onChange={(e) => setFormData(prev => ({ ...prev, mensagem_login: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Mensagem opcional para aparecer na tela de login"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-medium"
                >
                  {loading ? 'Salvando...' : (modalType === 'create' ? 'Criar Escola' : 'Salvar Alterações')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}