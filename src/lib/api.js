import { supabase } from './supabase'

// ===============================================
// PROFILES API
// ===============================================

export const profilesApi = {
  // Get current user profile
  async getCurrent() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  // Create or update profile
  async upsert(profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get profiles by role
  async getByRole(role) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .eq('ativo', true)
      .order('nome')

    if (error) throw error
    return data
  }
}

// ===============================================
// STUDENTS API
// ===============================================

export const alunosApi = {
  // Get all students with their turmas and responsaveis
  async getAll() {
    const { data, error } = await supabase
      .from('alunos')
      .select(`
        *,
        turmas (
          id,
          nome,
          professor_id
        )
      `)
      .eq('ativo', true)
      .order('nome')

    if (error) throw error

    // Get responsaveis for each student using both the relation table and the array field
    const studentsWithParents = await Promise.all(
      data.map(async (student) => {
        // First try to get from aluno_responsavel table
        const { data: parents } = await supabase
          .from('aluno_responsavel')
          .select(`
            parentesco,
            profiles:responsavel_id (
              id,
              nome,
              telefone,
              email
            )
          `)
          .eq('aluno_id', student.id)

        // If no parents from relation table, try to get from responsaveis_ids array
        let responsaveis = parents || []
        
        if (responsaveis.length === 0 && student.responsaveis_ids?.length > 0) {
          const { data: parentProfiles } = await supabase
            .from('profiles')
            .select('id, nome, telefone, email')
            .in('id', student.responsaveis_ids)
          
          responsaveis = parentProfiles?.map(profile => ({
            parentesco: null,
            profiles: profile
          })) || []
        }

        return {
          ...student,
          responsaveis
        }
      })
    )

    return studentsWithParents
  },

  // Get student by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('alunos')
      .select(`
        *,
        turmas (
          id,
          nome,
          profiles:professor_id (nome)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Get responsaveis
    const { data: parents } = await supabase
      .from('aluno_responsavel')
      .select(`
        parentesco,
        responsavel_financeiro,
        profiles:responsavel_id (
          id,
          nome,
          telefone,
          email
        )
      `)
      .eq('aluno_id', id)

    return {
      ...data,
      responsaveis: parents || []
    }
  },

  // Create student
  async create(studentData) {
    const { data, error } = await supabase
      .from('alunos')
      .insert(studentData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update student
  async update(id, studentData) {
    const { data, error } = await supabase
      .from('alunos')
      .update(studentData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete student (soft delete)
  async delete(id) {
    const { data, error } = await supabase
      .from('alunos')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get students by turma
  async getByTurma(turmaId) {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', turmaId)
      .eq('ativo', true)
      .order('nome')

    if (error) throw error
    return data
  }
}

// ===============================================
// TURMAS API
// ===============================================

export const turmasApi = {
  // Get all turmas
  async getAll() {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) throw error

    // Get student count for each turma
    const turmasWithCounts = await Promise.all(
      data.map(async (turma) => {
        const { count } = await supabase
          .from('alunos')
          .select('*', { count: 'exact', head: true })
          .eq('turma_id', turma.id)
          .eq('ativo', true)

        return {
          ...turma,
          total_alunos: count || 0
        }
      })
    )

    return turmasWithCounts
  },

  // Create turma
  async create(turmaData) {
    const { data, error } = await supabase
      .from('turmas')
      .insert(turmaData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update turma
  async update(id, turmaData) {
    const { data, error } = await supabase
      .from('turmas')
      .update(turmaData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ===============================================
// ROTINAS API
// ===============================================

export const rotinasApi = {
  // Get routine by student and date
  async getByStudentAndDate(alunoId, date) {
    const { data, error } = await supabase
      .from('rotinas')
      .select('*')
      .eq('aluno_id', alunoId)
      .eq('data', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  },

  // Create or update routine
  async upsert(rotinaData) {
    // Prepare data for your JSONB structure
    const preparedData = {
      aluno_id: rotinaData.aluno_id,
      data: rotinaData.data,
      criado_por: rotinaData.professor_id || rotinaData.criado_por,
      
      // Handle JSONB fields
      alimentacao: {
        mamadeira_qtd: rotinaData.mamadeira_qtd || 0,
        mamadeira_obs: rotinaData.mamadeira_obs || '',
        almoco: {
          comeu: rotinaData.almoco_comeu || false,
          obs: rotinaData.almoco_obs || ''
        },
        lanche: {
          comeu: rotinaData.lanche_comeu || false,
          obs: rotinaData.lanche_obs || ''
        },
        jantar: {
          comeu: rotinaData.jantar_comeu || false,
          obs: rotinaData.jantar_obs || ''
        }
      },
      
      fraldas: {
        trocadas: rotinaData.fraldas_trocadas || 0,
        evacuacao: rotinaData.evacuacao || false,
        evacuacao_obs: rotinaData.evacuacao_obs || ''
      },
      
      // Direct fields
      sono_inicio: rotinaData.sono_manha_inicio,
      sono_fim: rotinaData.sono_manha_fim,
      sono_manha_inicio: rotinaData.sono_manha_inicio,
      sono_manha_fim: rotinaData.sono_manha_fim,
      sono_tarde_inicio: rotinaData.sono_tarde_inicio,
      sono_tarde_fim: rotinaData.sono_tarde_fim,
      sono_obs: rotinaData.sono_obs,
      humor: rotinaData.humor,
      comportamento: rotinaData.comportamento,
      observacoes: rotinaData.observacoes_gerais || rotinaData.observacoes,
      
      // Individual fields (your table has both JSONB and individual columns)
      mamadeira_qtd: rotinaData.mamadeira_qtd,
      mamadeira_obs: rotinaData.mamadeira_obs,
      almoco_comeu: rotinaData.almoco_comeu,
      almoco_obs: rotinaData.almoco_obs,
      lanche_comeu: rotinaData.lanche_comeu,
      lanche_obs: rotinaData.lanche_obs,
      jantar_comeu: rotinaData.jantar_comeu,
      jantar_obs: rotinaData.jantar_obs,
      fraldas_trocadas: rotinaData.fraldas_trocadas,
      evacuacao: rotinaData.evacuacao,
      evacuacao_obs: rotinaData.evacuacao_obs
    }

    const { data, error } = await supabase
      .from('rotinas')
      .upsert(preparedData, {
        onConflict: 'aluno_id,data'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get routines for date range
  async getByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('rotinas')
      .select(`
        *,
        alunos (
          id,
          nome,
          turmas (nome)
        ),
        profiles:criado_por (nome)
      `)
      .gte('data', startDate)
      .lte('data', endDate)
      .order('data', { ascending: false })

    if (error) throw error
    return data
  }
}

// ===============================================
// COMUNICADOS API
// ===============================================

export const comunicadosApi = {
  // Get recent comunicados
  async getRecent(limit = 10) {
    try {
      // First try with profiles join
      const { data, error } = await supabase
        .from('comunicados')
        .select(`
          *,
          autor:profiles!comunicados_autor_id_fkey (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        // If the join fails, try without it
        console.log('Join failed, trying without profiles join:', error)
        const { data: simpleData, error: simpleError } = await supabase
          .from('comunicados')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (simpleError) throw simpleError

        // Add author names manually if possible
        const dataWithAuthors = simpleData.map(comunicado => ({
          ...comunicado,
          autor: { nome: 'Sistema' } // Default author
        }))

        return dataWithAuthors
      }

      return data
    } catch (error) {
      console.error('Error in getRecent:', error)
      // Return empty array as fallback
      return []
    }
  },

  // Create comunicado
  async create(comunicadoData) {
    // Prepare data for your array structure
    const preparedData = {
      ...comunicadoData,
      turma_ids: comunicadoData.turma_ids || [],
      destinatarios: comunicadoData.destinatarios || ['admin', 'professor', 'responsavel'],
      data_envio: new Date().toISOString(),
      ativo: true
    }

    const { data, error } = await supabase
      .from('comunicados')
      .insert(preparedData)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ===============================================
// DASHBOARD STATS API
// ===============================================

export const dashboardApi = {
  // Get admin dashboard stats
  async getAdminStats() {
    try {
      // Get total counts with error handling for each
      let totalAlunos = 0, totalProfessores = 0, totalTurmas = 0, presencaHoje = 0

      try {
        const { count } = await supabase.from('alunos').select('*', { count: 'exact', head: true })
        totalAlunos = count || 0
      } catch (error) {
        console.log('Error counting alunos:', error)
      }

      try {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professor')
        totalProfessores = count || 0
      } catch (error) {
        console.log('Error counting professores:', error)
      }

      try {
        const { count } = await supabase.from('turmas').select('*', { count: 'exact', head: true })
        totalTurmas = count || 0
      } catch (error) {
        console.log('Error counting turmas:', error)
      }

      try {
        const { count } = await supabase.from('presencas').select('*', { count: 'exact', head: true }).eq('data', new Date().toISOString().split('T')[0]).eq('presente', true)
        presencaHoje = count || 0
      } catch (error) {
        console.log('Error counting presenca hoje:', error)
      }

      // Get recent comunicados
      let comunicadosRecentes = []
      try {
        comunicadosRecentes = await comunicadosApi.getRecent(5)
      } catch (error) {
        console.log('Error fetching comunicados, using empty array:', error)
        comunicadosRecentes = []
      }

      // Get financial summary for current month (if financeiro table exists)
      let financeiroMes = 0
      try {
        const now = new Date()
        const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM format
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10) // Next month first day
        
        const { data: financeiroData } = await supabase
          .from('financeiro')
          .select('valor, status')
          .gte('data_vencimento', `${currentMonth}-01`)
          .lt('data_vencimento', nextMonth)

        financeiroMes = financeiroData?.reduce((sum, item) => {
          return item.status === 'pago' ? sum + parseFloat(item.valor) : sum
        }, 0) || 0
      } catch (error) {
        console.log('Financeiro table not found, using default value:', error)
        financeiroMes = 0
      }

      return {
        totalAlunos: totalAlunos || 0,
        totalProfessores: totalProfessores || 0,
        totalTurmas: totalTurmas || 0,
        presencaHoje: presencaHoje || 0,
        comunicadosRecentes: comunicadosRecentes || [],
        eventosProximos: [], // TODO: Implement eventos API when needed
        financeiroMes
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      throw error
    }
  }
}

// ===============================================
// ERROR HANDLING UTILITY
// ===============================================

export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  
  if (error.code === 'PGRST301') {
    return 'Você não tem permissão para acessar estes dados.'
  }
  
  if (error.code === 'PGRST116') {
    return 'Nenhum registro encontrado.'
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'Ocorreu um erro inesperado.'
}