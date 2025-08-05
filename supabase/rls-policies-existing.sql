-- ===============================================
-- EDUQUINHA - RLS POLICIES FOR EXISTING STRUCTURE
-- Sistema de Gestão Escolar Infantil - Supabase
-- ===============================================

-- Enable RLS on all tables (only if not already enabled)
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

-- Enable RLS on new tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financeiro') THEN
        ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'eventos') THEN
        ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ===============================================
-- HELPER FUNCTIONS
-- ===============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
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

-- Check if user is responsible for a student
CREATE OR REPLACE FUNCTION is_responsible_for_student(student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM aluno_responsavel 
    WHERE aluno_id = student_id AND responsavel_id = auth.uid()
  );
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
-- DROP EXISTING POLICIES TO AVOID CONFLICTS
-- ===============================================

-- Drop all existing policies (they will be recreated)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Get all existing policies
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- ===============================================
-- 1. PROFILES POLICIES
-- ===============================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- Admins can create profiles
CREATE POLICY "Admins can create profiles" ON profiles
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (is_admin());

-- Professors can view other professors and parents of their students
CREATE POLICY "Professors can view relevant profiles" ON profiles
  FOR SELECT USING (
    is_professor() AND (
      role = 'professor' OR 
      id IN (
        SELECT ar.responsavel_id FROM aluno_responsavel ar
        JOIN alunos a ON ar.aluno_id = a.id
        JOIN turmas t ON a.turma_id = t.id
        WHERE t.professor_id = auth.uid()
      )
    )
  );

-- Parents can view professors of their children's classes
CREATE POLICY "Parents can view their children's teachers" ON profiles
  FOR SELECT USING (
    is_responsavel() AND (
      role = 'professor' AND id IN (
        SELECT t.professor_id FROM turmas t
        JOIN alunos a ON a.turma_id = t.id
        JOIN aluno_responsavel ar ON ar.aluno_id = a.id
        WHERE ar.responsavel_id = auth.uid()
      )
    )
  );

-- ===============================================
-- 2. TURMAS POLICIES
-- ===============================================

-- Admins can do everything with turmas
CREATE POLICY "Admins can manage turmas" ON turmas
  FOR ALL USING (is_admin());

-- Professors can view their own turmas
CREATE POLICY "Professors can view their turmas" ON turmas
  FOR SELECT USING (is_professor() AND professor_id = auth.uid());

-- Parents can view turmas of their children
CREATE POLICY "Parents can view their children's turmas" ON turmas
  FOR SELECT USING (
    is_responsavel() AND id IN (
      SELECT a.turma_id FROM alunos a
      JOIN aluno_responsavel ar ON ar.aluno_id = a.id
      WHERE ar.responsavel_id = auth.uid()
    )
  );

-- ===============================================
-- 3. ALUNOS POLICIES
-- ===============================================

-- Admins can manage all students
CREATE POLICY "Admins can manage all students" ON alunos
  FOR ALL USING (is_admin());

-- Professors can view students in their classes
CREATE POLICY "Professors can view their students" ON alunos
  FOR SELECT USING (is_professor() AND teaches_student(id));

-- Professors can update students in their classes
CREATE POLICY "Professors can update their students" ON alunos
  FOR UPDATE USING (is_professor() AND teaches_student(id));

-- Parents can view their own children
CREATE POLICY "Parents can view their children" ON alunos
  FOR SELECT USING (is_responsavel() AND is_responsible_for_student(id));

-- ===============================================
-- 4. ALUNO_RESPONSAVEL POLICIES
-- ===============================================

-- Admins can manage all relationships
CREATE POLICY "Admins can manage aluno_responsavel" ON aluno_responsavel
  FOR ALL USING (is_admin());

-- Users can view relationships they're part of
CREATE POLICY "Users can view their relationships" ON aluno_responsavel
  FOR SELECT USING (
    responsavel_id = auth.uid() OR 
    is_admin() OR 
    (is_professor() AND teaches_student(aluno_id))
  );

-- ===============================================
-- 5. ROTINAS POLICIES
-- ===============================================

-- Admins can manage all routines
CREATE POLICY "Admins can manage all routines" ON rotinas
  FOR ALL USING (is_admin());

-- Professors can manage routines for their students
CREATE POLICY "Professors can manage their students' routines" ON rotinas
  FOR ALL USING (is_professor() AND teaches_student(aluno_id));

-- Parents can view their children's routines
CREATE POLICY "Parents can view their children's routines" ON rotinas
  FOR SELECT USING (is_responsavel() AND is_responsible_for_student(aluno_id));

-- ===============================================
-- 6. PRESENCAS POLICIES (Note: using 'presencas' not 'presenca')
-- ===============================================

-- Admins can manage all attendance
CREATE POLICY "Admins can manage all attendance" ON presencas
  FOR ALL USING (is_admin());

-- Professors can manage attendance for their students
CREATE POLICY "Professors can manage their students' attendance" ON presencas
  FOR ALL USING (is_professor() AND teaches_student(aluno_id));

-- Parents can view their children's attendance
CREATE POLICY "Parents can view their children's attendance" ON presencas
  FOR SELECT USING (is_responsavel() AND is_responsible_for_student(aluno_id));

-- ===============================================
-- 7. COMUNICADOS POLICIES
-- ===============================================

-- Admins can manage all announcements
CREATE POLICY "Admins can manage all comunicados" ON comunicados
  FOR ALL USING (is_admin());

-- Professors can create and view announcements
CREATE POLICY "Professors can create comunicados" ON comunicados
  FOR INSERT WITH CHECK (is_professor());

CREATE POLICY "Professors can view comunicados" ON comunicados
  FOR SELECT USING (
    is_professor() AND (
      'professor' = ANY(destinatarios) OR 
      autor_id = auth.uid() OR
      turma_id IN (
        SELECT id FROM turmas WHERE professor_id = auth.uid()
      )
    )
  );

-- Parents can view announcements meant for them
CREATE POLICY "Parents can view their comunicados" ON comunicados
  FOR SELECT USING (
    is_responsavel() AND (
      'responsavel' = ANY(destinatarios) OR
      turma_id IN (
        SELECT a.turma_id FROM alunos a
        JOIN aluno_responsavel ar ON ar.aluno_id = a.id
        WHERE ar.responsavel_id = auth.uid()
      )
    )
  );

-- ===============================================
-- 8. MENSAGENS POLICIES
-- ===============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON mensagens
  FOR SELECT USING (
    remetente_id = auth.uid() OR 
    destinatario_id = auth.uid()
  );

-- Users can send messages
CREATE POLICY "Users can send messages" ON mensagens
  FOR INSERT WITH CHECK (remetente_id = auth.uid());

-- Users can update messages they sent (mark as read, etc.)
CREATE POLICY "Users can update their sent messages" ON mensagens
  FOR UPDATE USING (remetente_id = auth.uid());

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages" ON mensagens
  FOR UPDATE USING (
    destinatario_id = auth.uid() AND 
    OLD.lida = false AND NEW.lida = true
  );

-- ===============================================
-- 9. FOTOS POLICIES
-- ===============================================

-- Admins can manage all photos
CREATE POLICY "Admins can manage all fotos" ON fotos
  FOR ALL USING (is_admin());

-- Professors can manage photos of their students
CREATE POLICY "Professors can manage their students' photos" ON fotos
  FOR ALL USING (is_professor() AND teaches_student(aluno_id));

-- Parents can view photos of their children
CREATE POLICY "Parents can view their children's photos" ON fotos
  FOR SELECT USING (
    is_responsavel() AND 
    is_responsible_for_student(aluno_id)
  );

-- ===============================================
-- 10. ATIVIDADES POLICIES
-- ===============================================

-- Admins can manage all activities
CREATE POLICY "Admins can manage all atividades" ON atividades
  FOR ALL USING (is_admin());

-- Professors can view and create activities for their students
CREATE POLICY "Professors can manage their students' activities" ON atividades
  FOR ALL USING (
    is_professor() AND (
      teaches_student(aluno_id) OR
      turma_id IN (SELECT id FROM turmas WHERE professor_id = auth.uid())
    )
  );

-- Parents can view activities of their children
CREATE POLICY "Parents can view their children's activities" ON atividades
  FOR SELECT USING (
    is_responsavel() AND (
      is_responsible_for_student(aluno_id) OR
      turma_id IN (
        SELECT a.turma_id FROM alunos a
        JOIN aluno_responsavel ar ON ar.aluno_id = a.id
        WHERE ar.responsavel_id = auth.uid()
      )
    )
  );

-- ===============================================
-- 11. ESCOLAS POLICIES
-- ===============================================

-- Everyone can view school information
CREATE POLICY "Everyone can view school info" ON escolas
  FOR SELECT USING (true);

-- Only admins can manage school information
CREATE POLICY "Admins can manage school info" ON escolas
  FOR ALL USING (is_admin());

-- ===============================================
-- 12. COMUNICADO_TURMA POLICIES
-- ===============================================

-- Admins can manage all comunicado_turma
CREATE POLICY "Admins can manage comunicado_turma" ON comunicado_turma
  FOR ALL USING (is_admin());

-- Professors can view comunicado_turma for their classes
CREATE POLICY "Professors can view their turma comunicados" ON comunicado_turma
  FOR SELECT USING (
    is_professor() AND turma_id IN (
      SELECT id FROM turmas WHERE professor_id = auth.uid()
    )
  );

-- Parents can view comunicado_turma for their children's classes
CREATE POLICY "Parents can view their children's turma comunicados" ON comunicado_turma
  FOR SELECT USING (
    is_responsavel() AND turma_id IN (
      SELECT a.turma_id FROM alunos a
      JOIN aluno_responsavel ar ON ar.aluno_id = a.id
      WHERE ar.responsavel_id = auth.uid()
    )
  );

-- ===============================================
-- 13. FINANCEIRO POLICIES (if table exists)
-- ===============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financeiro') THEN
        -- Admins can manage all financial records
        EXECUTE 'CREATE POLICY "Admins can manage all financeiro" ON financeiro FOR ALL USING (is_admin())';

        -- Parents can view their own financial records
        EXECUTE 'CREATE POLICY "Parents can view their financeiro" ON financeiro FOR SELECT USING (is_responsavel() AND (responsavel_id = auth.uid() OR is_responsible_for_student(aluno_id)))';
    END IF;
END $$;

-- ===============================================
-- 14. EVENTOS POLICIES (if table exists)
-- ===============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'eventos') THEN
        -- Admins can manage all events
        EXECUTE 'CREATE POLICY "Admins can manage all eventos" ON eventos FOR ALL USING (is_admin())';

        -- Professors can create and view events for their classes
        EXECUTE 'CREATE POLICY "Professors can manage their class events" ON eventos FOR ALL USING (is_professor() AND (turma_id IN (SELECT id FROM turmas WHERE professor_id = auth.uid()) OR turma_id IS NULL))';

        -- Parents can view events for their children''s classes
        EXECUTE 'CREATE POLICY "Parents can view relevant events" ON eventos FOR SELECT USING (is_responsavel() AND (turma_id IS NULL OR turma_id IN (SELECT a.turma_id FROM alunos a JOIN aluno_responsavel ar ON ar.aluno_id = a.id WHERE ar.responsavel_id = auth.uid())))';
    END IF;
END $$;

-- ===============================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ===============================================

-- Grant basic permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===============================================
-- END OF RLS POLICIES
-- ===============================================