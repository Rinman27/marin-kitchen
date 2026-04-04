import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import AddEditRecipePage from './pages/AddEditRecipePage'
import AddWantToTryPage from './pages/AddWantToTryPage'

function AppRoutes() {
  const { user } = useAuth()

  // Still loading auth state
  if (user === undefined) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-base)'
      }}>
        <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '22px' }}>
          MaRin Kitchen
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/recipe/:id" element={<RecipeDetailPage />} />
      <Route path="/add" element={<AddEditRecipePage />} />
      <Route path="/edit/:id" element={<AddEditRecipePage />} />
      <Route path="/add-want" element={<AddWantToTryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
