import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SchoolProvider } from './contexts/SchoolContext'
import SchoolErrorBoundary from './components/SchoolErrorBoundary'
import SchoolDebugInfo from './components/SchoolDebugInfo'
import AppRouter from './components/AppRouter'

function App() {
  return (
    <BrowserRouter>
      <SchoolErrorBoundary>
        <SchoolProvider>
          <AuthProvider>
            <AppRouter />
            <SchoolDebugInfo />
          </AuthProvider>
        </SchoolProvider>
      </SchoolErrorBoundary>
    </BrowserRouter>
  )
}

export default App
