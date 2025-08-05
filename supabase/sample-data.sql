-- ===============================================
-- EDUQUINHA - SAMPLE DATA FOR TESTING
-- Sistema de Gestão Escolar Infantil
-- ===============================================

-- Note: Execute this AFTER creating users through Supabase Auth
-- Replace the UUIDs below with actual user IDs from auth.users

-- ===============================================
-- 1. SAMPLE PROFILES
-- ===============================================

-- Admin user (replace with actual UUID from auth.users)
INSERT INTO profiles (id, email, nome, telefone, role, ativo) VALUES
('admin-uuid-here', 'admin@eduquinha.com', 'Maria Silva', '(11) 99999-0001', 'admin', true);

-- Professor users
INSERT INTO profiles (id, email, nome, telefone, role, ativo) VALUES
('prof1-uuid-here', 'prof1@eduquinha.com', 'Ana Costa', '(11) 99999-0002', 'professor', true),
('prof2-uuid-here', 'prof2@eduquinha.com', 'João Santos', '(11) 99999-0003', 'professor', true);

-- Responsavel users
INSERT INTO profiles (id, email, nome, telefone, role, ativo) VALUES
('resp1-uuid-here', 'pai1@gmail.com', 'Carlos Oliveira', '(11) 99999-0004', 'responsavel', true),
('resp2-uuid-here', 'mae1@gmail.com', 'Fernanda Oliveira', '(11) 99999-0005', 'responsavel', true),
('resp3-uuid-here', 'pai2@gmail.com', 'Roberto Lima', '(11) 99999-0006', 'responsavel', true);

-- ===============================================
-- 2. SAMPLE TURMAS
-- ===============================================

INSERT INTO turmas (id, nome, descricao, idade_minima, idade_maxima, capacidade_maxima, professor_id, ativo) VALUES
(uuid_generate_v4(), 'Berçário I', 'Bebês de 4 meses a 1 ano', 4, 12, 8, 'prof1-uuid-here', true),
(uuid_generate_v4(), 'Berçário II', 'Bebês de 1 a 2 anos', 12, 24, 10, 'prof2-uuid-here', true),
(uuid_generate_v4(), 'Maternal I', 'Crianças de 2 a 3 anos', 24, 36, 15, 'prof1-uuid-here', true),
(uuid_generate_v4(), 'Maternal II', 'Crianças de 3 a 4 anos', 36, 48, 15, 'prof2-uuid-here', true);

-- ===============================================
-- 3. SAMPLE ALUNOS
-- ===============================================

-- Get turma IDs (you'll need to replace these with actual IDs)
-- SELECT id, nome FROM turmas;

INSERT INTO alunos (id, nome, data_nascimento, genero, turma_id, ativo) VALUES
(uuid_generate_v4(), 'Pedro Oliveira', '2023-03-15', 'masculino', (SELECT id FROM turmas WHERE nome = 'Berçário II' LIMIT 1), true),
(uuid_generate_v4(), 'Sofia Oliveira', '2021-08-22', 'feminino', (SELECT id FROM turmas WHERE nome = 'Maternal II' LIMIT 1), true),
(uuid_generate_v4(), 'Gabriel Lima', '2022-11-10', 'masculino', (SELECT id FROM turmas WHERE nome = 'Maternal I' LIMIT 1), true);

-- ===============================================
-- 4. SAMPLE ALUNO_RESPONSAVEL RELATIONSHIPS
-- ===============================================

-- Pedro Oliveira's parents
INSERT INTO aluno_responsavel (aluno_id, responsavel_id, parentesco, responsavel_financeiro) VALUES
((SELECT id FROM alunos WHERE nome = 'Pedro Oliveira'), 'resp1-uuid-here', 'pai', true),
((SELECT id FROM alunos WHERE nome = 'Pedro Oliveira'), 'resp2-uuid-here', 'mãe', false);

-- Sofia Oliveira's parents (same parents)
INSERT INTO aluno_responsavel (aluno_id, responsavel_id, parentesco, responsavel_financeiro) VALUES
((SELECT id FROM alunos WHERE nome = 'Sofia Oliveira'), 'resp1-uuid-here', 'pai', true),
((SELECT id FROM alunos WHERE nome = 'Sofia Oliveira'), 'resp2-uuid-here', 'mãe', false);

-- Gabriel Lima's parent
INSERT INTO aluno_responsavel (aluno_id, responsavel_id, parentesco, responsavel_financeiro) VALUES
((SELECT id FROM alunos WHERE nome = 'Gabriel Lima'), 'resp3-uuid-here', 'pai', true);

-- ===============================================
-- 5. SAMPLE ROTINAS
-- ===============================================

-- Today's routine for Pedro
INSERT INTO rotinas (aluno_id, professor_id, data, mamadeira_qtd, almoco_comeu, almoco_obs, sono_manha_inicio, sono_manha_fim, humor, fraldas_trocadas) VALUES
((SELECT id FROM alunos WHERE nome = 'Pedro Oliveira'), 'prof2-uuid-here', CURRENT_DATE, 3, true, 'Comeu bem, adorou o purê', '09:30', '11:00', 'feliz', 4);

-- Yesterday's routine for Sofia
INSERT INTO rotinas (aluno_id, professor_id, data, almoco_comeu, almoco_obs, lanche_comeu, sono_tarde_inicio, sono_tarde_fim, humor, comportamento) VALUES
((SELECT id FROM alunos WHERE nome = 'Sofia Oliveira'), 'prof2-uuid-here', CURRENT_DATE - INTERVAL '1 day', true, 'Comeu tudo', true, '14:00', '15:30', 'calmo', 'Muito participativa nas atividades');

-- ===============================================
-- 6. SAMPLE PRESENÇA
-- ===============================================

INSERT INTO presenca (aluno_id, data, presente, hora_chegada, hora_saida, quem_trouxe, quem_buscou) VALUES
((SELECT id FROM alunos WHERE nome = 'Pedro Oliveira'), CURRENT_DATE, true, '08:00', '17:30', 'Mãe', 'Pai'),
((SELECT id FROM alunos WHERE nome = 'Sofia Oliveira'), CURRENT_DATE, true, '07:45', '18:00', 'Pai', 'Mãe'),
((SELECT id FROM alunos WHERE nome = 'Gabriel Lima'), CURRENT_DATE, true, '08:15', '17:00', 'Pai', 'Pai');

-- ===============================================
-- 7. SAMPLE COMUNICADOS
-- ===============================================

INSERT INTO comunicados (titulo, conteudo, autor_id, destinatarios, urgente) VALUES
('Reunião de Pais - Abril', 'Informamos que haverá reunião de pais no dia 15/04 às 19h. Compareçam!', 'admin-uuid-here', ARRAY['responsavel'], false),
('Festa Junina 2024', 'Nossa festa junina será no dia 22/06. Venham fantasiados!', 'admin-uuid-here', ARRAY['responsavel', 'professor'], false),
('Mudança no cardápio', 'A partir de segunda-feira teremos frutas diferentes no lanche da tarde.', 'prof1-uuid-here', ARRAY['responsavel'], false);

-- ===============================================
-- 8. SAMPLE FINANCEIRO
-- ===============================================

INSERT INTO financeiro (aluno_id, responsavel_id, tipo, descricao, valor, data_vencimento, status) VALUES
((SELECT id FROM alunos WHERE nome = 'Pedro Oliveira'), 'resp1-uuid-here', 'mensalidade', 'Mensalidade Abril 2024', 800.00, '2024-04-05', 'pago'),
((SELECT id FROM alunos WHERE nome = 'Sofia Oliveira'), 'resp1-uuid-here', 'mensalidade', 'Mensalidade Abril 2024', 800.00, '2024-04-05', 'pago'),
((SELECT id FROM alunos WHERE nome = 'Gabriel Lima'), 'resp3-uuid-here', 'mensalidade', 'Mensalidade Maio 2024', 800.00, '2024-05-05', 'pendente'),
((SELECT id FROM alunos WHERE nome = 'Pedro Oliveira'), 'resp1-uuid-here', 'material', 'Material Escolar', 150.00, '2024-04-10', 'pendente');

-- ===============================================
-- 9. SAMPLE EVENTOS
-- ===============================================

INSERT INTO eventos (nome, descricao, data_evento, hora_inicio, tipo, turma_id) VALUES
('Festa Junina', 'Festa junina da escola com quadrilha e comidas típicas', '2024-06-22', '14:00', 'festa', NULL),
('Passeio ao Zoológico', 'Visita educativa ao zoológico da cidade', '2024-05-15', '08:00', 'passeio', (SELECT id FROM turmas WHERE nome = 'Maternal II' LIMIT 1)),
('Apresentação do Dia das Mães', 'Homenagem especial para as mamães', '2024-05-10', '16:00', 'apresentacao', NULL);

-- ===============================================
-- USEFUL QUERIES FOR TESTING
-- ===============================================

-- View all students with their classes and parents
/*
SELECT 
    a.nome as aluno,
    t.nome as turma,
    p.nome as responsavel,
    ar.parentesco
FROM alunos a
LEFT JOIN turmas t ON a.turma_id = t.id
LEFT JOIN aluno_responsavel ar ON a.id = ar.aluno_id
LEFT JOIN profiles p ON ar.responsavel_id = p.id
ORDER BY a.nome;
*/

-- View today's routines
/*
SELECT 
    a.nome as aluno,
    r.humor,
    r.mamadeira_qtd,
    r.almoco_comeu,
    r.fraldas_trocadas
FROM rotinas r
JOIN alunos a ON r.aluno_id = a.id
WHERE r.data = CURRENT_DATE;
*/

-- View pending payments
/*
SELECT 
    a.nome as aluno,
    f.descricao,
    f.valor,
    f.data_vencimento
FROM financeiro f
JOIN alunos a ON f.aluno_id = a.id
WHERE f.status = 'pendente'
ORDER BY f.data_vencimento;
*/

-- ===============================================
-- END OF SAMPLE DATA
-- ===============================================