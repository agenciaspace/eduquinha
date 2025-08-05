-- ===============================================
-- CRIAR USUÁRIO ADMINISTRADOR DE TESTE
-- ===============================================

-- Primeiro, vamos verificar se existem usuários na tabela auth.users
SELECT id, email FROM auth.users LIMIT 5;

-- Verificar se existe um perfil para o usuário
SELECT * FROM profiles LIMIT 5;

-- Se você fez login com um email específico, substitua 'admin@eduquinha.com' pelo email que você usou
-- Vamos assumir que você usou admin@eduquinha.com para teste

-- Inserir ou atualizar perfil de administrador
INSERT INTO profiles (id, nome, email, role, telefone)
SELECT 
  au.id,
  'Administrador Teste',
  au.email,
  'admin',
  '(11) 99999-9999'
FROM auth.users au
WHERE au.email = 'admin@eduquinha.com'
ON CONFLICT (id) 
DO UPDATE SET 
  nome = EXCLUDED.nome,
  role = EXCLUDED.role,
  telefone = EXCLUDED.telefone;

-- Se você usou um email diferente, crie um novo usuário ou atualize o email aqui:
-- Exemplo para qualquer primeiro usuário existente:
-- UPDATE profiles 
-- SET role = 'admin', nome = 'Administrador Teste'
-- WHERE id = (SELECT id FROM auth.users LIMIT 1);

-- Verificar se o perfil foi criado corretamente
SELECT p.*, au.email 
FROM profiles p 
JOIN auth.users au ON p.id = au.id 
WHERE p.role = 'admin';

-- Mostrar instruções
\echo 'INSTRUÇÕES:'
\echo '1. Se você não vê nenhum usuário admin acima, você precisa:'
\echo '   - Primeiro fazer login no aplicativo para criar um usuário'
\echo '   - Depois executar este script novamente'
\echo '2. Se o usuário existe mas não tem role=admin, execute:'
\echo '   UPDATE profiles SET role = '\''admin'\'', nome = '\''Administrador Teste'\'' WHERE id = '\''SEU_USER_ID_AQUI'\'';'