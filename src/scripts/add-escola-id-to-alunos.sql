-- Add escola_id to alunos table for better querying
-- This is optional - students are linked to schools through turmas

-- Add the column if it doesn't exist
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS escola_id UUID REFERENCES escolas(id);

-- Update existing records to set escola_id based on their turma
UPDATE alunos a
SET escola_id = t.escola_id
FROM turmas t
WHERE a.turma_id = t.id
AND a.escola_id IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_alunos_escola_id ON alunos(escola_id);

-- Add comment for documentation
COMMENT ON COLUMN alunos.escola_id IS 'Direct reference to school for easier querying. Automatically set based on turma.';