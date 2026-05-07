import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import AddEditRecipePage from './pages/AddEditRecipePage'
import AddWantToTryPage from './pages/AddWantToTryPage'

function Wordmark({ size = 22 }) {
  return (
    <div style={{ lineHeight: 1 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: size, fontStyle: 'italic', fontWeight: 300, color: 'var(--accent)', letterSpacing: '-0.5px', lineHeight: 1 }}>
        MaRin
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '7px', color: 'var(--accent)', opacity: 0.35, letterSpacing: '4px', marginTop: '3px', fontWeight: 400 }}>
        KITCHEN
      </div>
    </div>
  )
}

export { Wordmark }

function AppRoutes() {
  const { user } = useAuth()

  if (user === undefined) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontStyle: 'italic', fontWeight: 300, color: 'var(--accent)', letterSpacing: '-0.5px', lineHeight: 1 }}>MaRin</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '8px', color: 'var(--accent)', opacity: 0.3, letterSpacing: '5px' }}>KITCHEN</div>
      </div>
    )
  }

  if (!user) {
    return <Routes><Route path="*" element={<LoginPage />} /></Routes>
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
  return <AuthProvider><AppRoutes /></AuthProvider>
}
