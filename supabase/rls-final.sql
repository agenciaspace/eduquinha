-- ===============================================
-- EDUQUINHA - FINAL RLS POLICIES FOR YOUR EXACT STRUCTURE
-- Based on actual table structure analysis
-- ===============================================

-- Drop existing policies first
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
-- HELPER FUNCTIONS (Updated for your structure)
-- ===============================================

-- Get current user's role
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is professor
CREATE OR REPLACE FUNCTION is_professor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'professor';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is responsavel
CREATE OR REPLACE FUNCTION is_responsavel()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'responsavel';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is responsible for a student (using both methods)
CREATE OR REPLACE FUNCTION is_responsible_for_student(student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check via aluno_responsavel table
  IF EXISTS (
    SELECT 1 FROM aluno_responsavel 
    WHERE aluno_id = student_id AND responsavel_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  -- Check via responsaveis_ids array in alunos table
  IF EXISTS (
    SELECT 1 FROM alunos 
    WHERE id = student_id AND auth.uid() = ANY(responsaveis_ids)
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if professor teaches the student's class
CREATE OR REPLACE FUNCTION teaches_student(student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM alunos a
    JOIN turmas t ON a.turma_id = t.id
    WHERE a.id = student_id AND t.professor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- 1. PROFILES POLICIES
-- ===============================================

CREATE POLICY "profile_select" ON profiles FOR SELECT USING (
  auth.uid() = id OR is_admin() OR 
  (is_professor() AND role IN ('professor', 'responsavel')) OR
  (is_responsavel() AND role = 'professor')
);

CREATE POLICY "profile_update" ON profiles FOR UPDATE USING (
  auth.uid() = id OR is_admin()
);

CREATE POLICY "profile_insert" ON profiles FOR INSERT WITH CHECK (is_admin());

-- ===============================================
-- 2. TURMAS POLICIES  
-- ===============================================

CREATE POLICY "turmas_select" ON turmas FOR SELECT USING (
  is_admin() OR 
  (is_professor() AND professor_id = auth.uid()) OR
  (is_responsavel() AND id IN (
    SELECT turma_id FROM alunos 
    WHERE auth.uid() = ANY(responsaveis_ids) OR
    id IN (SELECT aluno_id FROM aluno_responsavel WHERE responsavel_id = auth.uid())
  ))
);

CREATE POLICY "turmas_manage" ON turmas FOR ALL USING (is_admin());

-- ===============================================
-- 3. ALUNOS POLICIES
-- ===============================================

CREATE POLICY "alunos_select" ON alunos FOR SELECT USING (
  is_admin() OR 
  teaches_student(id) OR 
  is_responsible_for_student(id)
);

CREATE POLICY "alunos_insert" ON alunos FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "alunos_update" ON alunos FOR UPDATE USING (
  is_admin() OR teaches_student(id)
);

CREATE POLICY "alunos_delete" ON alunos FOR DELETE USING (is_admin());

-- ===============================================
-- 4. ALUNO_RESPONSAVEL POLICIES
-- ===============================================

CREATE POLICY "aluno_responsavel_select" ON aluno_responsavel FOR SELECT USING (
  is_admin() OR 
  responsavel_id = auth.uid() OR 
  teaches_student(aluno_id)
);

CREATE POLICY "aluno_responsavel_manage" ON aluno_responsavel FOR ALL USING (is_admin());

-- ===============================================
-- 5. ROTINAS POLICIES
-- ===============================================

CREATE POLICY "rotinas_select" ON rotinas FOR SELECT USING (
  is_admin() OR 
  teaches_student(aluno_id) OR 
  is_responsible_for_student(aluno_id)
);

CREATE POLICY "rotinas_insert" ON rotinas FOR INSERT WITH CHECK (
  is_admin() OR teaches_student(aluno_id)
);

CREATE POLICY "rotinas_update" ON rotinas FOR UPDATE USING (
  is_admin() OR teaches_student(aluno_id) OR criado_por = auth.uid()
);

CREATE POLICY "rotinas_delete" ON rotinas FOR DELETE USING (
  is_admin() OR criado_por = auth.uid()
);

-- ===============================================
-- 6. PRESENCAS POLICIES
-- ===============================================

CREATE POLICY "presencas_select" ON presencas FOR SELECT USING (
  is_admin() OR 
  teaches_student(aluno_id) OR 
  is_responsible_for_student(aluno_id) OR
  professor_id = auth.uid()
);

CREATE POLICY "presencas_insert" ON presencas FOR INSERT WITH CHECK (
  is_admin() OR teaches_student(aluno_id) OR professor_id = auth.uid()
);

CREATE POLICY "presencas_update" ON presencas FOR UPDATE USING (
  is_admin() OR professor_id = auth.uid()
);

CREATE POLICY "presencas_delete" ON presencas FOR DELETE USING (
  is_admin() OR professor_id = auth.uid()
);

-- ===============================================
-- 7. COMUNICADOS POLICIES (with turma_ids array)
-- ===============================================

CREATE POLICY "comunicados_select" ON comunicados FOR SELECT USING (
  is_admin() OR
  autor_id = auth.uid() OR
  (is_professor() AND ('professor' = ANY(destinatarios) OR array_length(turma_ids, 1) IS NULL)) OR
  (is_responsavel() AND ('responsavel' = ANY(destinatarios) OR array_length(turma_ids, 1) IS NULL)) OR
  (is_professor() AND EXISTS (
    SELECT 1 FROM turmas t WHERE t.id = ANY(turma_ids) AND t.professor_id = auth.uid()
  )) OR
  (is_responsavel() AND EXISTS (
    SELECT 1 FROM alunos a WHERE a.turma_id = ANY(turma_ids) AND is_responsible_for_student(a.id)
  ))
);

CREATE POLICY "comunicados_insert" ON comunicados FOR INSERT WITH CHECK (
  is_admin() OR is_professor()
);

CREATE POLICY "comunicados_update" ON comunicados FOR UPDATE USING (
  is_admin() OR autor_id = auth.uid()
);

CREATE POLICY "comunicados_delete" ON comunicados FOR DELETE USING (
  is_admin() OR autor_id = auth.uid()
);

-- ===============================================
-- 8. MENSAGENS POLICIES
-- ===============================================

CREATE POLICY "mensagens_select" ON mensagens FOR SELECT USING (
  is_admin() OR 
  remetente_id = auth.uid() OR 
  destinatario_id = auth.uid()
);

CREATE POLICY "mensagens_insert" ON mensagens FOR INSERT WITH CHECK (
  remetente_id = auth.uid()
);

CREATE POLICY "mensagens_update" ON mensagens FOR UPDATE USING (
  is_admin() OR 
  remetente_id = auth.uid() OR 
  destinatario_id = auth.uid()
);

-- ===============================================
-- 9. FOTOS POLICIES
-- ===============================================

CREATE POLICY "fotos_select" ON fotos FOR SELECT USING (
  is_admin() OR
  enviado_por = auth.uid() OR
  (aluno_id IS NOT NULL AND is_responsible_for_student(aluno_id)) OR
  (aluno_id IS NOT NULL AND teaches_student(aluno_id)) OR
  (turma_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM turmas WHERE id = turma_id AND professor_id = auth.uid()
  )) OR
  (turma_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM alunos a WHERE a.turma_id = turma_id AND is_responsible_for_student(a.id)
  ))
);

CREATE POLICY "fotos_insert" ON fotos FOR INSERT WITH CHECK (
  is_admin() OR is_professor()
);

CREATE POLICY "fotos_update" ON fotos FOR UPDATE USING (
  is_admin() OR enviado_por = auth.uid()
);

CREATE POLICY "fotos_delete" ON fotos FOR DELETE USING (
  is_admin() OR enviado_por = auth.uid()
);

-- ===============================================
-- 10. ATIVIDADES POLICIES
-- ===============================================

CREATE POLICY "atividades_select" ON atividades FOR SELECT USING (
  is_admin() OR
  criado_por = auth.uid() OR
  (turma_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM turmas WHERE id = turma_id AND professor_id = auth.uid()
  )) OR
  (turma_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM alunos a WHERE a.turma_id = turma_id AND is_responsible_for_student(a.id)
  ))
);

CREATE POLICY "atividades_insert" ON atividades FOR INSERT WITH CHECK (
  is_admin() OR is_professor()
);

CREATE POLICY "atividades_update" ON atividades FOR UPDATE USING (
  is_admin() OR criado_por = auth.uid()
);

CREATE POLICY "atividades_delete" ON atividades FOR DELETE USING (
  is_admin() OR criado_por = auth.uid()
);

-- ===============================================
-- 11. ESCOLAS POLICIES
-- ===============================================

CREATE POLICY "escolas_select" ON escolas FOR SELECT USING (true);
CREATE POLICY "escolas_manage" ON escolas FOR ALL USING (is_admin());

-- ===============================================
-- 12. COMUNICADO_TURMA POLICIES
-- ===============================================

CREATE POLICY "comunicado_turma_select" ON comunicado_turma FOR SELECT USING (
  is_admin() OR
  EXISTS (SELECT 1 FROM turmas WHERE id = turma_id AND professor_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM alunos a 
    WHERE a.turma_id = turma_id AND is_responsible_for_student(a.id)
  )
);

CREATE POLICY "comunicado_turma_manage" ON comunicado_turma FOR ALL USING (is_admin());

-- ===============================================
-- GRANT PERMISSIONS
-- ===============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

SELECT 'RLS policies configured successfully for your structure!' as status;