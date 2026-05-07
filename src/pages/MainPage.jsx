import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import BottomNav from '../components/BottomNav'
import StarRating from '../components/StarRating'
import { Wordmark } from '../App'

function HorizontalCard({ recipe, onClick }) {
  return (
    <div
      onClick={onClick}
      className="tappable"
      style={{
        width: '110px',
        flexShrink: 0,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        cursor: 'pointer',
      }}
    >
      <div style={{
        height: '80px',
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {recipe.photoURL ? (
          <img src={recipe.photoURL} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🍽</div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '30px',
          background: 'linear-gradient(transparent, rgba(13,13,13,0.7))',
        }} />
      </div>
      <div style={{ padding: '8px 9px 10px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--text-primary)',
          lineHeight: 1.25,
          marginBottom: '4px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {recipe.name}
        </div>
        <StarRating value={recipe.rating || 0} readonly size={11} />
      </div>
    </div>
  )
}

export default function MainPage() {
  const [recipes, setRecipes] = useState([])
  const [wantToTry, setWantToTry] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const tab = useMemo(() => new URLSearchParams(location.search).get('tab') || 'recipes', [location.search])

  useEffect(() => {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'wantToTry'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setWantToTry(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  // Build shelves from tags, sorted by most recipes, min 2 per shelf
  const shelves = useMemo(() => {
    if (!recipes.length) return { tagged: [], untagged: [] }

    const tagMap = {}
    const untagged = []

    recipes.forEach(r => {
      if (!r.tags || r.tags.length === 0) {
        untagged.push(r)
      } else {
        r.tags.forEach(tag => {
          if (!tagMap[tag]) tagMap[tag] = []
          tagMap[tag].push(r)
        })
      }
    })

    // Sort shelves by count descending, filter min 2
    const tagged = Object.entries(tagMap)
      .filter(([, items]) => items.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([tag, items]) => ({ tag, items }))

    // Tags with only 1 recipe go into untagged catch-all
    const singleTagRecipes = Object.entries(tagMap)
      .filter(([, items]) => items.length < 2)
      .flatMap(([, items]) => items)

    const allUntagged = [...new Map([...untagged, ...singleTagRecipes].map(r => [r.id, r])).values()]

    return { tagged, untagged: allUntagged }
  }, [recipes])

  // Filtered shelves for search
  const filteredShelves = useMemo(() => {
    if (!search) return shelves
    const q = search.toLowerCase()
    const filteredTagged = shelves.tagged
      .map(s => ({ ...s, items: s.items.filter(r => r.name?.toLowerCase().includes(q) || r.tags?.some(t => t.toLowerCase().includes(q))) }))
      .filter(s => s.items.length > 0)
    const filteredUntagged = shelves.untagged.filter(r => r.name?.toLowerCase().includes(q))
    return { tagged: filteredTagged, untagged: filteredUntagged }
  }, [search, shelves])

  const filteredWant = useMemo(() => {
    if (!search) return wantToTry
    const q = search.toLowerCase()
    return wantToTry.filter(r => r.name?.toLowerCase().includes(q))
  }, [search, wantToTry])

  async function deleteWantItem(id) {
    if (window.confirm('Remove from Want to Try?')) {
      await deleteDoc(doc(db, 'wantToTry', id))
    }
  }

  const hasRecipes = filteredShelves.tagged.length > 0 || filteredShelves.untagged.length > 0

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>

      {/* Header */}
      <div style={{
        paddingTop: 'calc(var(--safe-top) + 14px)',
        padding: 'calc(var(--safe-top) + 14px) var(--page-pad) 0',
        background: 'var(--bg-base)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <Wordmark size={24} />
          <button
            className="tappable"
            onClick={() => navigate(tab === 'recipes' ? '/add' : '/add-want')}
            style={{
              width: '30px', height: '30px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#0c0c0c',
              fontSize: '20px',
              fontWeight: '300',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            +
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '12px' }}>
          {[{ key: 'recipes', label: 'My Recipes' }, { key: 'wanttotry', label: 'Want to Try' }].map(t => (
            <button
              key={t.key}
              className="tappable"
              onClick={() => { navigate(`/?tab=${t.key}`); setSearch('') }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                letterSpacing: '0.2px',
                background: tab === t.key ? 'var(--accent)' : 'transparent',
                color: tab === t.key ? '#0c0c0c' : 'var(--text-tertiary)',
                border: `0.5px solid ${tab === t.key ? 'var(--accent)' : 'var(--border-medium)'}`,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '9px 13px',
          marginBottom: '4px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'recipes' ? 'Search recipes or tags...' : 'Search...'}
            style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-tertiary)', fontSize: '16px', lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>

        {tab === 'recipes' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', paddingTop: '60px', fontSize: '13px' }}>Loading...</div>
            ) : !hasRecipes ? (
              <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🍽</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  {search ? 'No recipes match your search.' : 'No recipes yet. Tap + to add your first!'}
                </div>
              </div>
            ) : (
              <div className="stagger">
                {/* Tag shelves */}
                {filteredShelves.tagged.map(shelf => (
                  <div key={shelf.tag} style={{ marginTop: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '0 var(--page-pad) 10px',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                      }}>
                        {shelf.tag}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        {shelf.items.length}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '0 var(--page-pad)',
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                    }}>
                      {shelf.items.map(r => (
                        <HorizontalCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />
                      ))}
                    </div>
                    <div style={{ height: '0.5px', background: 'var(--border)', margin: '16px var(--page-pad) 0' }} />
                  </div>
                ))}

                {/* Catch-all untagged shelf */}
                {filteredShelves.untagged.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '0 var(--page-pad) 10px',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                      }}>
                        All Recipes
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        {filteredShelves.untagged.length}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '0 var(--page-pad)',
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                    }}>
                      {filteredShelves.untagged.map(r => (
                        <HorizontalCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'wanttotry' && (
          <div style={{ padding: '16px var(--page-pad) 0' }} className="stagger">
            {filteredWant.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>♡</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  {search ? 'No results.' : 'Nothing saved yet. Tap + to add something!'}
                </div>
              </div>
            ) : (
              filteredWant.map(item => (
                <div key={item.id} style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '13px 15px',
                  border: '0.5px solid var(--border)',
                  marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '17px',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: 'var(--text-primary)',
                        marginBottom: item.sourceUrl || item.note ? '8px' : 0,
                        lineHeight: 1.2,
                      }}>
                        {item.name}
                      </div>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            color: 'var(--accent)', fontSize: '11px',
                            textDecoration: 'none',
                            marginBottom: item.note ? '5px' : 0,
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          {item.sourceUrl.length > 38 ? item.sourceUrl.slice(0, 38) + '...' : item.sourceUrl}
                        </a>
                      )}
                      {item.note && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.note}</div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteWantItem(item.id)}
                      style={{ color: 'var(--text-tertiary)', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
