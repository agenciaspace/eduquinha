-- ===============================================
-- EDUQUINHA - MIGRATION FOR MISSING TABLES/FIELDS
-- Execute this only if tables/fields are missing
-- ===============================================

-- ===============================================
-- 1. CHECK AND ADD MISSING TABLES
-- ===============================================

-- Add financeiro table if it doesn't exist
CREATE TABLE IF NOT EXISTS financeiro (
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

-- Add eventos table if it doesn't exist
CREATE TABLE IF NOT EXISTS eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    data_evento DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    turma_id UUID REFERENCES turmas(id),
    tipo TEXT CHECK (tipo IN ('passeio', 'festa', 'reuniao', 'apresentacao', 'feriado')),
    local TEXT,
    valor DECIMAL(10,2),
    autorizado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 2. CHECK AND ADD MISSING COLUMNS
-- ===============================================

-- Add missing columns to existing tables if they don't exist

-- Profiles table additions
DO $$ 
BEGIN
    -- Add cpf column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cpf') THEN
        ALTER TABLE profiles ADD COLUMN cpf TEXT UNIQUE;
    END IF;
    
    -- Add endereco column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'endereco') THEN
        ALTER TABLE profiles ADD COLUMN endereco TEXT;
    END IF;
    
    -- Add data_nascimento column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'data_nascimento') THEN
        ALTER TABLE profiles ADD COLUMN data_nascimento DATE;
    END IF;
    
    -- Add foto_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'foto_url') THEN
        ALTER TABLE profiles ADD COLUMN foto_url TEXT;
    END IF;
    
    -- Add ativo column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ativo') THEN
        ALTER TABLE profiles ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Turmas table additions
DO $$ 
BEGIN
    -- Add idade_minima column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'turmas' AND column_name = 'idade_minima') THEN
        ALTER TABLE turmas ADD COLUMN idade_minima INTEGER;
    END IF;
    
    -- Add idade_maxima column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'turmas' AND column_name = 'idade_maxima') THEN
        ALTER TABLE turmas ADD COLUMN idade_maxima INTEGER;
    END IF;
    
    -- Add capacidade_maxima column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'turmas' AND column_name = 'capacidade_maxima') THEN
        ALTER TABLE turmas ADD COLUMN capacidade_maxima INTEGER DEFAULT 20;
    END IF;
    
    -- Add ativo column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'turmas' AND column_name = 'ativo') THEN
        ALTER TABLE turmas ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Alunos table additions
DO $$ 
BEGIN
    -- Add genero column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'genero') THEN
        ALTER TABLE alunos ADD COLUMN genero TEXT CHECK (genero IN ('masculino', 'feminino'));
    END IF;
    
    -- Add endereco column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'endereco') THEN
        ALTER TABLE alunos ADD COLUMN endereco TEXT;
    END IF;
    
    -- Add observacoes_medicas column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'observacoes_medicas') THEN
        ALTER TABLE alunos ADD COLUMN observacoes_medicas TEXT;
    END IF;
    
    -- Add alergias column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'alergias') THEN
        ALTER TABLE alunos ADD COLUMN alergias TEXT;
    END IF;
    
    -- Add medicamentos column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'medicamentos') THEN
        ALTER TABLE alunos ADD COLUMN medicamentos TEXT;
    END IF;
    
    -- Add contato_emergencia column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'contato_emergencia') THEN
        ALTER TABLE alunos ADD COLUMN contato_emergencia TEXT;
    END IF;
    
    -- Add telefone_emergencia column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'telefone_emergencia') THEN
        ALTER TABLE alunos ADD COLUMN telefone_emergencia TEXT;
    END IF;
    
    -- Add ativo column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'ativo') THEN
        ALTER TABLE alunos ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Rotinas table - check if all necessary columns exist
DO $$ 
BEGIN
    -- Add missing routine tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'mamadeira_qtd') THEN
        ALTER TABLE rotinas ADD COLUMN mamadeira_qtd INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'mamadeira_obs') THEN
        ALTER TABLE rotinas ADD COLUMN mamadeira_obs TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'almoco_comeu') THEN
        ALTER TABLE rotinas ADD COLUMN almoco_comeu BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'almoco_obs') THEN
        ALTER TABLE rotinas ADD COLUMN almoco_obs TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'lanche_comeu') THEN
        ALTER TABLE rotinas ADD COLUMN lanche_comeu BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'lanche_obs') THEN
        ALTER TABLE rotinas ADD COLUMN lanche_obs TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'jantar_comeu') THEN
        ALTER TABLE rotinas ADD COLUMN jantar_comeu BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'jantar_obs') THEN
        ALTER TABLE rotinas ADD COLUMN jantar_obs TEXT;
    END IF;
    
    -- Sleep columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'sono_manha_inicio') THEN
        ALTER TABLE rotinas ADD COLUMN sono_manha_inicio TIME;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'sono_manha_fim') THEN
        ALTER TABLE rotinas ADD COLUMN sono_manha_fim TIME;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'sono_tarde_inicio') THEN
        ALTER TABLE rotinas ADD COLUMN sono_tarde_inicio TIME;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'sono_tarde_fim') THEN
        ALTER TABLE rotinas ADD COLUMN sono_tarde_fim TIME;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'sono_obs') THEN
        ALTER TABLE rotinas ADD COLUMN sono_obs TEXT;
    END IF;
    
    -- Mood and behavior
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'humor') THEN
        ALTER TABLE rotinas ADD COLUMN humor TEXT CHECK (humor IN ('feliz', 'triste', 'irritado', 'calmo', 'agitado'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'comportamento') THEN
        ALTER TABLE rotinas ADD COLUMN comportamento TEXT;
    END IF;
    
    -- Hygiene
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'fraldas_trocadas') THEN
        ALTER TABLE rotinas ADD COLUMN fraldas_trocadas INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'evacuacao') THEN
        ALTER TABLE rotinas ADD COLUMN evacuacao BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'evacuacao_obs') THEN
        ALTER TABLE rotinas ADD COLUMN evacuacao_obs TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'banho') THEN
        ALTER TABLE rotinas ADD COLUMN banho BOOLEAN DEFAULT false;
    END IF;
    
    -- Health
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'febre') THEN
        ALTER TABLE rotinas ADD COLUMN febre BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'temperatura') THEN
        ALTER TABLE rotinas ADD COLUMN temperatura DECIMAL(3,1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'medicamento_dado') THEN
        ALTER TABLE rotinas ADD COLUMN medicamento_dado BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'medicamento_obs') THEN
        ALTER TABLE rotinas ADD COLUMN medicamento_obs TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rotinas' AND column_name = 'observacoes_gerais') THEN
        ALTER TABLE rotinas ADD COLUMN observacoes_gerais TEXT;
    END IF;
END $$;

-- Comunicados table additions
DO $$ 
BEGIN
    -- Add destinatarios column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comunicados' AND column_name = 'destinatarios') THEN
        ALTER TABLE comunicados ADD COLUMN destinatarios TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add urgente column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comunicados' AND column_name = 'urgente') THEN
        ALTER TABLE comunicados ADD COLUMN urgente BOOLEAN DEFAULT false;
    END IF;
    
    -- Add data_expiracao column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comunicados' AND column_name = 'data_expiracao') THEN
        ALTER TABLE comunicados ADD COLUMN data_expiracao DATE;
    END IF;
    
    -- Add ativo column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comunicados' AND column_name = 'ativo') THEN
        ALTER TABLE comunicados ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- ===============================================
-- 3. CREATE MISSING INDEXES
-- ===============================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON profiles(ativo);
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_alunos_ativo ON alunos(ativo);
CREATE INDEX IF NOT EXISTS idx_rotinas_aluno_data ON rotinas(aluno_id, data);
CREATE INDEX IF NOT EXISTS idx_rotinas_data ON rotinas(data);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_data ON presencas(aluno_id, data);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas(data);
CREATE INDEX IF NOT EXISTS idx_fotos_aluno ON fotos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_destinatario ON mensagens(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_lida ON mensagens(lida);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_financeiro_aluno ON financeiro(aluno_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_status ON financeiro(status);
CREATE INDEX IF NOT EXISTS idx_financeiro_vencimento ON financeiro(data_vencimento);

-- ===============================================
-- 4. CREATE UPDATE TRIGGERS
-- ===============================================

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables that have updated_at column
DO $$
BEGIN
    -- Check if triggers exist before creating them
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_turmas_updated_at') THEN
        CREATE TRIGGER update_turmas_updated_at 
        BEFORE UPDATE ON turmas 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_alunos_updated_at') THEN
        CREATE TRIGGER update_alunos_updated_at 
        BEFORE UPDATE ON alunos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rotinas_updated_at') THEN
        CREATE TRIGGER update_rotinas_updated_at 
        BEFORE UPDATE ON rotinas 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_financeiro_updated_at') THEN
        CREATE TRIGGER update_financeiro_updated_at 
        BEFORE UPDATE ON financeiro 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ===============================================
-- END OF MIGRATION
-- ===============================================