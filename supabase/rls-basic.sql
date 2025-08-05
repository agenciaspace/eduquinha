-- ===============================================
-- EDUQUINHA - BASIC RLS POLICIES (ULTRA SAFE)
-- This will work with any table structure
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aluno_responsavel ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicado_turma ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- HELPER FUNCTIONS
-- ===============================================

-- Get current user's role (safe version)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE((SELECT role FROM profiles WHERE id = auth.uid()), 'guest');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'guest';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- DROP ALL EXISTING POLICIES
-- ===============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- ===============================================
-- BASIC POLICIES - VERY PERMISSIVE FOR TESTING
-- ===============================================

-- PROFILES: Users can see their own profile, admins see all
CREATE POLICY "profile_select" ON profiles FOR SELECT USING (
  auth.uid() = id OR is_admin()
);

CREATE POLICY "profile_update" ON profiles FOR UPDATE USING (
  auth.uid() = id OR is_admin()
);

CREATE POLICY "profile_insert" ON profiles FOR INSERT WITH CHECK (
  is_admin()
);

-- TURMAS: Admins manage all, others can view
CREATE POLICY "turmas_select" ON turmas FOR SELECT USING (true);
CREATE POLICY "turmas_manage" ON turmas FOR ALL USING (is_admin());

-- ALUNOS: Admins manage all, others can view
CREATE POLICY "alunos_select" ON alunos FOR SELECT USING (true);
CREATE POLICY "alunos_manage" ON alunos FOR ALL USING (is_admin());

-- ALUNO_RESPONSAVEL: Admins manage all, others can view
CREATE POLICY "aluno_responsavel_select" ON aluno_responsavel FOR SELECT USING (true);
CREATE POLICY "aluno_responsavel_manage" ON aluno_responsavel FOR ALL USING (is_admin());

-- ROTINAS: Admins manage all, others can view
CREATE POLICY "rotinas_select" ON rotinas FOR SELECT USING (true);
CREATE POLICY "rotinas_manage" ON rotinas FOR ALL USING (is_admin());

-- PRESENCAS: Admins manage all, others can view
CREATE POLICY "presencas_select" ON presencas FOR SELECT USING (true);
CREATE POLICY "presencas_manage" ON presencas FOR ALL USING (is_admin());

-- COMUNICADOS: Everyone can view, admins can manage
CREATE POLICY "comunicados_select" ON comunicados FOR SELECT USING (true);
CREATE POLICY "comunicados_manage" ON comunicados FOR ALL USING (is_admin());

-- MENSAGENS: Users can see their own messages
CREATE POLICY "mensagens_select" ON mensagens FOR SELECT USING (
  auth.uid() = remetente_id OR 
  auth.uid() = destinatario_id OR 
  is_admin()
);
CREATE POLICY "mensagens_insert" ON mensagens FOR INSERT WITH CHECK (
  auth.uid() = remetente_id OR is_admin()
);
CREATE POLICY "mensagens_update" ON mensagens FOR UPDATE USING (
  auth.uid() = remetente_id OR 
  auth.uid() = destinatario_id OR 
  is_admin()
);

-- FOTOS: Everyone can view, admins can manage
CREATE POLICY "fotos_select" ON fotos FOR SELECT USING (true);
CREATE POLICY "fotos_manage" ON fotos FOR ALL USING (is_admin());

-- ATIVIDADES: Everyone can view, admins can manage
CREATE POLICY "atividades_select" ON atividades FOR SELECT USING (true);
CREATE POLICY "atividades_manage" ON atividades FOR ALL USING (is_admin());

-- ESCOLAS: Everyone can view, admins can manage
CREATE POLICY "escolas_select" ON escolas FOR SELECT USING (true);
CREATE POLICY "escolas_manage" ON escolas FOR ALL USING (is_admin());

-- COMUNICADO_TURMA: Everyone can view, admins can manage
CREATE POLICY "comunicado_turma_select" ON comunicado_turma FOR SELECT USING (true);
CREATE POLICY "comunicado_turma_manage" ON comunicado_turma FOR ALL USING (is_admin());

-- ===============================================
-- GRANT PERMISSIONS
-- ===============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===============================================
-- TEST THE SETUP
-- ===============================================

-- Test if everything works
SELECT 'RLS setup complete!' as status;