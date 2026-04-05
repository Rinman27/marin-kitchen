import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import BottomNav from '../components/BottomNav'
import RecipeCard from '../components/RecipeCard'

export default function MainPage() {
  const location = useLocation()
  const tab = useMemo(() => new URLSearchParams(location.search).get('tab') || 'recipes', [location.search])
  const [recipes, setRecipes] = useState([])
  const [wantToTry, setWantToTry] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const searchRef = useRef(null)

  useEffect(() => {
    const qRecipes = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
    const unsubRecipes = onSnapshot(qRecipes, snap => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })

    const qWant = query(collection(db, 'wantToTry'), orderBy('createdAt', 'desc'))
    const unsubWant = onSnapshot(qWant, snap => {
      setWantToTry(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => { unsubRecipes(); unsubWant() }
  }, [])

  const filteredRecipes = recipes.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.name?.toLowerCase().includes(q) ||
      r.tags?.some(t => t.toLowerCase().includes(q))
    )
  })

  const filteredWant = wantToTry.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.name?.toLowerCase().includes(q)
  })

  async function deleteWantItem(id) {
    if (window.confirm('Remove from Want to Try?')) {
      await deleteDoc(doc(db, 'wantToTry', id))
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>

      {/* Header */}
      <div style={{
        paddingTop: 'calc(var(--safe-top) + 16px)',
        padding: 'calc(var(--safe-top) + 16px) 20px 0',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontStyle: 'italic',
              color: 'var(--accent)',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}>
              MaRin
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '9px',
              color: 'var(--accent)',
              opacity: 0.5,
              letterSpacing: '3px',
              marginTop: '2px',
            }}>
              KITCHEN
            </div>
          </div>
          <button
            onClick={() => navigate(tab === 'recipes' ? '/add' : '/add-want')}
            style={{
              width: '34px', height: '34px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#111',
              fontSize: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '300',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            +
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {[
            { key: 'recipes', label: 'My Recipes' },
            { key: 'wanttotry', label: 'Want to Try' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { navigate(`/?tab=${t.key}`); setSearch('') }}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                background: tab === t.key ? 'var(--accent)' : 'var(--bg-surface)',
                color: tab === t.key ? '#111' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: tab === t.key ? 'var(--accent)' : 'var(--border)',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          padding: '10px 14px',
          marginBottom: '14px',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'recipes' ? 'Search recipes or tags...' : 'Search...'}
            style={{
              background: 'none',
              border: 'none',
              padding: '0',
              fontSize: '14px',
              color: 'var(--text-primary)',
              flex: 1,
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-tertiary)', fontSize: '18px', lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }} className="page-enter">
        {tab === 'recipes' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', paddingTop: '60px', fontSize: '14px' }}>
                Loading...
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🍽</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  {search ? 'No recipes match your search.' : 'No recipes yet. Tap + to add your first!'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
              </div>
            )}
          </>
        )}

        {tab === 'wanttotry' && (
          <>
            {filteredWant.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>♡</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  {search ? 'No results.' : 'Nothing saved yet. Tap + to add something!'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredWant.map(item => (
                  <div key={item.id} style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 16px',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '16px',
                          color: 'var(--text-primary)',
                          marginBottom: item.note || item.sourceUrl ? '8px' : '0',
                        }}>
                          {item.name}
                        </div>
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: 'var(--accent)',
                              fontSize: '12px',
                              textDecoration: 'none',
                              marginBottom: item.note ? '6px' : '0',
                            }}
                            onClick={e => e.stopPropagation()}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            {item.sourceUrl.length > 40 ? item.sourceUrl.slice(0, 40) + '...' : item.sourceUrl}
                          </a>
                        )}
                        {item.note && (
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.note}</div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteWantItem(item.id)}
                        style={{ color: 'var(--text-tertiary)', fontSize: '20px', lineHeight: 1, flexShrink: 0, padding: '2px' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
