/**
 * Script para configurar escola de teste
 * Execute no console do navegador ou em um componente React
 */

import { supabase } from '../lib/supabase'

export const setupTestSchool = async () => {
  try {
    console.log('🏫 Configurando escola de teste...')

    // 1. Criar a escola
    const schoolData = {
      nome: 'Escola Teste Leon',
      slug: 'escola-teste-leon',
      endereco: 'Rua de Teste, 123 - Centro, São Paulo - SP',
      telefone: '(11) 98765-4321',
      email: 'contato@escola-teste-leon.com.br',
      cnpj: '12.345.678/0001-90',
      responsavel_nome: 'Leon Hatori',
      responsavel_email: 'leonhatori@gmail.com',
      mensagem_login: 'Bem-vindo à Escola Teste Leon! Esta é uma escola criada para testes e desenvolvimento.',
      ativo: true
    }

    // Verificar se escola já existe
    const { data: existingSchool } = await supabase
      .from('escolas')
      .select('id')
      .eq('slug', 'escola-teste-leon')
      .single()

    let escola_id

    if (existingSchool) {
      console.log('📝 Escola já existe, atualizando...')
      const { data, error } = await supabase
        .from('escolas')
        .update(schoolData)
        .eq('slug', 'escola-teste-leon')
        .select('id')
        .single()

      if (error) throw error
      escola_id = data.id
      console.log('✅ Escola atualizada com sucesso!')
    } else {
      console.log('🆕 Criando nova escola...')
      const { data, error } = await supabase
        .from('escolas')
        .insert([schoolData])
        .select('id')
        .single()

      if (error) throw error
      escola_id = data.id
      console.log('✅ Escola criada com sucesso!')
    }

    // 2. Buscar usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('❌ Usuário não está logado')
      return { success: false, message: 'Usuário não está logado' }
    }

    console.log('👤 Usuário encontrado:', user.email)

    // 3. Atualizar perfil do usuário
    const profileData = {
      id: user.id,
      email: user.email,
      nome: 'Leon Hatori',
      role: 'admin',
      escola_id: escola_id,
      ativo: true
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([profileData])

    if (profileError) throw profileError

    console.log('✅ Perfil atualizado com sucesso!')

    // 4. Criar configurações da escola
    const configData = {
      escola_id: escola_id,
      tema_cor: '#10B981', // Verde
      permite_cadastro_aluno: true,
      permite_cadastro_professor: true,
      aprovacao_automatica_professor: false,
      horario_funcionamento: {
        segunda: { inicio: '07:00', fim: '17:00' },
        terca: { inicio: '07:00', fim: '17:00' },
        quarta: { inicio: '07:00', fim: '17:00' },
        quinta: { inicio: '07:00', fim: '17:00' },
        sexta: { inicio: '07:00', fim: '17:00' }
      }
    }

    const { error: configError } = await supabase
      .from('configuracoes_escola')
      .upsert([configData], { onConflict: 'escola_id' })

    if (configError) throw configError

    console.log('✅ Configurações da escola criadas!')

    // 5. Mostrar informações finais
    const schoolUrl = window.location.hostname === 'localhost' 
      ? `http://localhost:5173?escola=escola-teste-leon`
      : `https://escola-teste-leon.eduquinha.com.br`

    console.log('🎉 Configuração concluída!')
    console.log('📍 URL da escola:', schoolUrl)
    console.log('🔑 Para testar localmente, acesse:', `http://localhost:5173?escola=escola-teste-leon`)
    
    return {
      success: true,
      escola_id: escola_id,
      schoolUrl: schoolUrl,
      localUrl: `http://localhost:5173?escola=escola-teste-leon`
    }

  } catch (error) {
    console.error('❌ Erro ao configurar escola:', error)
    return { success: false, error: error.message }
  }
}

// Para uso direto no console:
// setupTestSchool().then(result => console.log('Resultado:', result))

export default setupTestSchool