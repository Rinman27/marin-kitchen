import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Recipes',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    )
  },
  {
    path: '/want-to-try',
    label: 'Want to Try',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
  }
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      display: 'flex',
      background: 'var(--bg-base)',
      borderTop: '1px solid var(--border)',
      paddingBottom: 'var(--safe-bottom)',
    }}>
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.path ||
          (item.path === '/' && (location.pathname.startsWith('/recipe') || location.pathname === '/add' || location.pathname.startsWith('/edit')))
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '10px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {item.icon(active)}
            <span style={{
              fontSize: '10px',
              color: active ? 'var(--accent)' : 'var(--text-tertiary)',
              fontWeight: active ? '500' : '400',
              letterSpacing: '0.2px'
            }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
