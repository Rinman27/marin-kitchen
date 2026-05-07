import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import StarRating from '../components/StarRating'
import BottomNav from '../components/BottomNav'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [marked, setMarked] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'recipes', id))
      if (snap.exists()) setRecipe({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    load()
  }, [id])

  async function handleMadeThis() {
    if (marking) return
    setMarking(true)
    const today = new Date().toISOString().split('T')[0]
    await updateDoc(doc(db, 'recipes', id), { cookLog: arrayUnion(today) })
    setRecipe(prev => ({ ...prev, cookLog: [...(prev.cookLog || []), today] }))
    setMarked(true)
    setTimeout(() => { setMarked(false); setMarking(false) }, 2000)
  }

  async function handleDelete() {
    await deleteDoc(doc(db, 'recipes', id))
    navigate('/')
  }

  function formatDate(d) {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Loading...</div>
    </div>
  }

  if (!recipe) {
    return <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', gap: '16px' }}>
      <div style={{ color: 'var(--text-tertiary)' }}>Recipe not found.</div>
      <button onClick={() => navigate('/')} style={{ color: 'var(--accent)', fontSize: '14px' }}>Go back</button>
    </div>
  }

  const sortedLog = [...(recipe.cookLog || [])].sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Hero */}
        <div style={{ width: '100%', height: '280px', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
          {recipe.photoURL ? (
            <img src={recipe.photoURL} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>🍽</div>
          )}
          {/* Gradient fade at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(transparent, var(--bg-base))' }} />

          {/* Back button */}
          <button
            className="tappable"
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: 'calc(var(--safe-top) + 12px)',
              left: '16px',
              width: '32px', height: '32px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(10px)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '18px',
            }}
          >
            ‹
          </button>

          {/* Edit button */}
          <button
            className="tappable"
            onClick={() => navigate(`/edit/${id}`)}
            style={{
              position: 'absolute',
              top: 'calc(var(--safe-top) + 12px)',
              right: '16px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(10px)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              color: 'var(--accent)',
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '0.3px',
            }}
          >
            Edit
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '4px var(--page-pad) 32px' }} className="page-enter">

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '30px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
            marginBottom: '10px',
          }}>
            {recipe.name}
          </h1>

          <StarRating value={recipe.rating || 0} readonly size={18} />

          {/* Tags */}
          {recipe.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '12px' }}>
              {recipe.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '0.5px solid var(--border-medium)',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.2px',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Source */}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tappable"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 13px',
                marginTop: '14px',
                textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span style={{ color: 'var(--accent)', fontSize: '12px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {recipe.sourceUrl}
              </span>
            </a>
          )}

          <div style={{ height: '0.5px', background: 'var(--border)', margin: '20px 0' }} />

          {/* Ingredients */}
          {recipe.ingredients?.trim() && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: '500', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Ingredients
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-line', fontFamily: 'var(--font-body)' }}>
                {recipe.ingredients}
              </div>
            </div>
          )}

          {/* Instructions */}
          {recipe.instructions?.trim() && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: '500', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Instructions
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 2, whiteSpace: 'pre-line', fontFamily: 'var(--font-body)' }}>
                {recipe.instructions}
              </div>
            </div>
          )}

          {/* Notes */}
          {recipe.notes?.trim() && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: '500', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Notes
              </div>
              <div style={{
                background: 'var(--bg-surface)',
                borderLeft: '1.5px solid var(--accent-border)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                padding: '12px 14px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                whiteSpace: 'pre-line',
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
              }}>
                {recipe.notes}
              </div>
            </div>
          )}

          <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: '20px' }} />

          {/* Made This */}
          <button
            onClick={handleMadeThis}
            disabled={marking}
            className="tappable"
            style={{
              width: '100%',
              padding: '13px',
              background: marked ? 'rgba(232,213,176,0.15)' : 'var(--accent)',
              color: marked ? 'var(--accent)' : '#0c0c0c',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '0.4px',
              border: marked ? '0.5px solid var(--accent-border)' : 'none',
              transition: 'all 0.3s ease',
              marginBottom: '10px',
            }}
          >
            {marked ? '✓ Logged!' : '✓ Made This'}
          </button>

          {/* Cook log */}
          {sortedLog.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '5px', fontFamily: 'var(--font-body)' }}>
                Made {sortedLog.length} time{sortedLog.length !== 1 ? 's' : ''}
              </div>
              {sortedLog.slice(0, 5).map((d, i) => (
                <div key={i} style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{formatDate(d)}</div>
              ))}
              {sortedLog.length > 5 && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>+{sortedLog.length - 5} more</div>}
            </div>
          )}

          {/* Delete */}
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} style={{ color: 'var(--text-tertiary)', fontSize: '12px', width: '100%', padding: '8px', textAlign: 'center' }}>
              Delete Recipe
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleDelete} className="tappable" style={{ flex: 1, padding: '11px', background: '#7a3a3a', color: '#ffb8b8', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500' }}>
                Yes, Delete
              </button>
              <button onClick={() => setShowDelete(false)} className="tappable" style={{ flex: 1, padding: '11px', background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '13px', border: '0.5px solid var(--border)' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
