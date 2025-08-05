-- ===============================================
-- EDUQUINHA - COMPREHENSIVE DATABASE SCHEMA
-- Sistema de Gestão Escolar Infantil - Supabase PostgreSQL
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. PROFILES (Extended User Information)
-- ===============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nome TEXT NOT NULL,
    telefone TEXT,
    cpf TEXT UNIQUE,
    endereco TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'professor', 'responsavel')),
    data_nascimento DATE,
    foto_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 2. TURMAS (Classes/Classrooms)
-- ===============================================
CREATE TABLE turmas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL, -- "Berçário I", "Maternal II", etc.
    descricao TEXT,
    idade_minima INTEGER, -- idade mínima em meses
    idade_maxima INTEGER, -- idade máxima em meses
    capacidade_maxima INTEGER DEFAULT 20,
    professor_id UUID REFERENCES profiles(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 3. ALUNOS (Students)
-- ===============================================
CREATE TABLE alunos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    genero TEXT CHECK (genero IN ('masculino', 'feminino')),
    foto_url TEXT,
    endereco TEXT,
    observacoes_medicas TEXT,
    alergias TEXT,
    medicamentos TEXT,
    contato_emergencia TEXT,
    telefone_emergencia TEXT,
    turma_id UUID REFERENCES turmas(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 4. RELACIONAMENTO ALUNO-RESPONSÁVEL
-- ===============================================
CREATE TABLE aluno_responsavel (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parentesco TEXT NOT NULL, -- "pai", "mãe", "avô", "tia", etc.
    responsavel_financeiro BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(aluno_id, responsavel_id)
);

-- ===============================================
-- 5. ROTINAS DIÁRIAS (Daily Routines)
-- ===============================================
CREATE TABLE rotinas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES profiles(id),
    data DATE NOT NULL,
    
    -- Alimentação
    mamadeira_qtd INTEGER DEFAULT 0,
    mamadeira_obs TEXT,
    almoco_comeu BOOLEAN DEFAULT false,
    almoco_obs TEXT,
    lanche_comeu BOOLEAN DEFAULT false,
    lanche_obs TEXT,
    jantar_comeu BOOLEAN DEFAULT false,
    jantar_obs TEXT,
    
    -- Sono
    sono_manha_inicio TIME,
    sono_manha_fim TIME,
    sono_tarde_inicio TIME,
    sono_tarde_fim TIME,
    sono_obs TEXT,
    
    -- Humor e comportamento
    humor TEXT CHECK (humor IN ('feliz', 'triste', 'irritado', 'calmo', 'agitado')),
    comportamento TEXT,
    
    -- Higiene
    fraldas_trocadas INTEGER DEFAULT 0,
    evacuacao BOOLEAN DEFAULT false,
    evacuacao_obs TEXT,
    banho BOOLEAN DEFAULT false,
    
    -- Saúde
    febre BOOLEAN DEFAULT false,
    temperatura DECIMAL(3,1),
    medicamento_dado BOOLEAN DEFAULT false,
    medicamento_obs TEXT,
    
    -- Observações gerais
    observacoes_gerais TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(aluno_id, data)
);

-- ===============================================
-- 6. PRESENÇA (Attendance)
-- ===============================================
CREATE TABLE presenca (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    presente BOOLEAN NOT NULL,
    hora_chegada TIME,
    hora_saida TIME,
    quem_trouxe TEXT,
    quem_buscou TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(aluno_id, data)
);

-- ===============================================
-- 7. COMUNICADOS (Announcements)
-- ===============================================
CREATE TABLE comunicados (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    autor_id UUID REFERENCES profiles(id),
    destinatarios TEXT[] DEFAULT '{}', -- ['admin', 'professor', 'responsavel']
    turma_id UUID REFERENCES turmas(id), -- NULL = para toda escola
    urgente BOOLEAN DEFAULT false,
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data_expiracao DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 8. FINANCEIRO (Financial Records)
-- ===============================================
CREATE TABLE financeiro (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES profiles(id),
    tipo TEXT NOT NULL CHECK (tipo IN ('mensalidade', 'material', 'evento', 'multa', 'desconto')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    metodo_pagamento TEXT CHECK (metodo_pagamento IN ('dinheiro', 'pix', 'cartao', 'transferencia')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 9. MENSAGENS (Messages)
-- ===============================================
CREATE TABLE mensagens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    remetente_id UUID REFERENCES profiles(id),
    destinatario_id UUID REFERENCES profiles(id),
    aluno_id UUID REFERENCES alunos(id), -- contexto da mensagem
    assunto TEXT,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 10. FOTOS (Photos)
-- ===============================================
CREATE TABLE fotos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES profiles(id),
    url TEXT NOT NULL, -- URL do Supabase Storage
    descricao TEXT,
    data_foto DATE DEFAULT CURRENT_DATE,
    privada BOOLEAN DEFAULT false, -- se true, só responsáveis podem ver
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 11. EVENTOS/ATIVIDADES (Events/Activities)
-- ===============================================
CREATE TABLE eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    data_evento DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    turma_id UUID REFERENCES turmas(id), -- NULL = evento para toda escola
    tipo TEXT CHECK (tipo IN ('passeio', 'festa', 'reuniao', 'apresentacao', 'feriado')),
    local TEXT,
    valor DECIMAL(10,2), -- custo adicional se houver
    autorizado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_ativo ON profiles(ativo);

-- Alunos
CREATE INDEX idx_alunos_turma ON alunos(turma_id);
CREATE INDEX idx_alunos_ativo ON alunos(ativo);

-- Rotinas
CREATE INDEX idx_rotinas_aluno_data ON rotinas(aluno_id, data);
CREATE INDEX idx_rotinas_data ON rotinas(data);

-- Presença
CREATE INDEX idx_presenca_aluno_data ON presenca(aluno_id, data);
CREATE INDEX idx_presenca_data ON presenca(data);

-- Financeiro
CREATE INDEX idx_financeiro_aluno ON financeiro(aluno_id);
CREATE INDEX idx_financeiro_status ON financeiro(status);
CREATE INDEX idx_financeiro_vencimento ON financeiro(data_vencimento);

-- Mensagens
CREATE INDEX idx_mensagens_destinatario ON mensagens(destinatario_id);
CREATE INDEX idx_mensagens_lida ON mensagens(lida);

-- Fotos
CREATE INDEX idx_fotos_aluno ON fotos(aluno_id);
CREATE INDEX idx_fotos_data ON fotos(data_foto);

-- ===============================================
-- TRIGGERS FOR UPDATED_AT
-- ===============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON turmas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rotinas_updated_at BEFORE UPDATE ON rotinas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financeiro_updated_at BEFORE UPDATE ON financeiro FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- END OF SCHEMA
-- ===============================================