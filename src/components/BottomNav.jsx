import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const currentTab = params.get('tab') || 'recipes'

  const isRecipesActive = currentTab !== 'wanttotry' &&
    (location.pathname === '/' || location.pathname.startsWith('/recipe') ||
     location.pathname === '/add' || location.pathname.startsWith('/edit'))
  const isWantActive = currentTab === 'wanttotry' && location.pathname === '/'

  return (
    <nav style={{
      display: 'flex',
      background: 'var(--bg-base)',
      borderTop: '0.5px solid var(--border)',
      paddingBottom: 'var(--safe-bottom)',
      flexShrink: 0,
    }}>
      <button
        className="tappable"
        onClick={() => navigate('/?tab=recipes')}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 0' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={isRecipesActive ? 'var(--accent)' : 'var(--text-tertiary)'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
        <span style={{ fontSize: '9px', color: isRecipesActive ? 'var(--accent)' : 'var(--text-tertiary)', fontWeight: isRecipesActive ? '500' : '400', letterSpacing: '0.3px' }}>
          Recipes
        </span>
      </button>

      <button
        className="tappable"
        onClick={() => navigate('/?tab=wanttotry')}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 0' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={isWantActive ? 'var(--accent)' : 'var(--text-tertiary)'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span style={{ fontSize: '9px', color: isWantActive ? 'var(--accent)' : 'var(--text-tertiary)', fontWeight: isWantActive ? '500' : '400', letterSpacing: '0.3px' }}>
          Want to Try
        </span>
      </button>
    </nav>
  )
}
