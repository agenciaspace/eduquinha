import { Routes, Route, Navigate } from 'react-router-dom'
import { useSchool } from '../contexts/SchoolContext'
import PrivateRoute from './PrivateRoute'
import Layout from './Layout'
import PreserveParamsNavigate from './PreserveParamsNavigate'
import EnsureSchoolInUrl from './EnsureSchoolInUrl'

// Main site pages
import LandingPage from '../pages/LandingPage'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Unauthorized from '../pages/Unauthorized'

// Admin pages
import Alunos from '../pages/admin/Alunos'
import AlunoDetalhes from '../pages/admin/AlunoDetalhes'
import Professores from '../pages/admin/Professores'
import Turmas from '../pages/admin/Turmas'
import Calendario from '../pages/admin/Calendario'
import Financeiro from '../pages/admin/Financeiro'
import FinanceiroDetalhes from '../pages/admin/FinanceiroDetalhes'
import Comunicados from '../pages/admin/Comunicados'
import Relatorios from '../pages/admin/Relatorios'
import Configuracoes from '../pages/admin/Configuracoes'
import GerenciarEscolas from '../pages/admin/GerenciarEscolas'

// Role-specific pages
import DashboardAluno from '../pages/aluno/DashboardAluno'
import DashboardSysAdmin from '../pages/sysadmin/DashboardSysAdmin'

// School pages
import SchoolLogin from '../pages/school/SchoolLogin'
import SchoolRegister from '../pages/school/SchoolRegister'
import SchoolNotFound from '../pages/SchoolNotFound'
import SetupTestSchool from '../pages/SetupTestSchool'
import SimpleSchoolSetup from '../pages/SimpleSchoolSetup'
import DebugSchool from '../pages/DebugSchool'
import FixProfile from '../pages/FixProfile'
import QuickFixProfile from '../pages/QuickFixProfile'
import CheckProfileStatus from '../pages/CheckProfileStatus'
import MudarSenha from '../pages/MudarSenha'
import RunSQL from '../pages/RunSQL'

import Test from '../pages/Test'

export default function AppRouter() {
  const { school, loading: schoolLoading, isSchoolSite, error } = useSchool()

  if (schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Handle school-related errors
  if (isSchoolSite && error === 'SCHOOL_NOT_FOUND') {
    return <SchoolNotFound />
  }

  if (isSchoolSite && error === 'SCHOOL_LOAD_ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar escola</h1>
          <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar os dados da escola.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  // School subdomain routes
  if (isSchoolSite) {
    return (
      <Routes>
        {/* School public routes */}
        <Route path="/" element={<PreserveParamsNavigate to="/login" replace />} />
        <Route path="/login" element={<SchoolLogin />} />
        <Route path="/cadastro" element={<SchoolRegister />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* School dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/meu-dia"
          element={
            <PrivateRoute allowedRoles={['aluno', 'admin']}>
              <Layout>
                <DashboardAluno />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/agenda"
          element={
            <PrivateRoute allowedRoles={['aluno', 'admin']}>
              <Layout>
                <Calendario />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/fotos"
          element={
            <PrivateRoute allowedRoles={['aluno', 'admin']}>
              <Layout>
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">📸 Galeria de Fotos</h1>
                  <p className="text-gray-600">Em breve você poderá ver todas as fotos das atividades!</p>
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/recados"
          element={
            <PrivateRoute allowedRoles={['aluno', 'admin']}>
              <Layout>
                <Comunicados />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/jogos"
          element={
            <PrivateRoute allowedRoles={['aluno', 'admin']}>
              <Layout>
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">🎮 Jogos Educativos</h1>
                  <p className="text-gray-600">Em breve jogos divertidos para aprender brincando!</p>
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/cardapio"
          element={
            <PrivateRoute allowedRoles={['aluno', 'admin']}>
              <Layout>
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">🍎 Cardápio da Semana</h1>
                  <p className="text-gray-600">Em breve você verá o cardápio delicioso da escola!</p>
                </div>
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Professor Routes */}
        <Route
          path="/calendario"
          element={
            <PrivateRoute allowedRoles={['admin', 'professor']}>
              <Layout>
                <Calendario />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/comunicados"
          element={
            <PrivateRoute allowedRoles={['admin', 'professor']}>
              <Layout>
                <Comunicados />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Admin Routes for School */}
        <Route
          path="/alunos"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <Alunos />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/alunos/:id"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <AlunoDetalhes />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/professores"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <Professores />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/turmas"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <Turmas />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <Financeiro />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/financeiro/:id"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <FinanceiroDetalhes />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/relatorios"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <Relatorios />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <Configuracoes />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Catch all for school sites */}
        <Route path="*" element={<PreserveParamsNavigate to="/login" replace />} />
      </Routes>
    )
  }

  // Main site routes (admin/system)
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/alunos"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <Alunos />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/alunos/:id"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <AlunoDetalhes />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/professores"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <Professores />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/turmas"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <Turmas />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/calendario"
        element={
          <PrivateRoute allowedRoles={['admin', 'professor']}>
            <Layout>
              <Calendario />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/financeiro"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <Financeiro />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/financeiro/:id"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <FinanceiroDetalhes />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/comunicados"
        element={
          <PrivateRoute allowedRoles={['admin', 'professor']}>
            <Layout>
              <Comunicados />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/relatorios"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <Relatorios />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/configuracoes"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <Configuracoes />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* System Admin Routes */}
      <Route
        path="/sistema/monitor"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <DashboardSysAdmin />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/escolas"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <GerenciarEscolas />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/usuarios"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <div className="p-8">Usuários Globais (Em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/database"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <div className="p-8">Gestão de Database (Em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/backups"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <div className="p-8">Backups (Em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/logs"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <div className="p-8">Logs do Sistema (Em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/analytics"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <div className="p-8">Analytics (Em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/seguranca"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <div className="p-8">Configurações de Segurança (Em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/integracoes"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <div className="p-8">Integrações (Em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/sistema/configuracoes"
        element={
          <PrivateRoute allowedRoles={['sysadmin']}>
            <Layout>
              <div className="p-8">Configurações do Sistema (Em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="/setup-test-school" element={<SetupTestSchool />} />
      <Route path="/setup-school" element={<SimpleSchoolSetup />} />
      <Route path="/debug-school" element={<DebugSchool />} />
      <Route path="/fix-profile" element={<FixProfile />} />
      <Route path="/quick-fix" element={<QuickFixProfile />} />
      <Route path="/check-profile" element={<CheckProfileStatus />} />
      <Route path="/mudar-senha" element={<MudarSenha />} />
      <Route path="/run-sql" element={<RunSQL />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  )
}