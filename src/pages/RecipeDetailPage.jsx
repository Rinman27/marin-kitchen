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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'recipes', id))
      if (snap.exists()) {
        setRecipe({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleMadeThis() {
    setMarking(true)
    const today = new Date().toISOString().split('T')[0]
    await updateDoc(doc(db, 'recipes', id), {
      cookLog: arrayUnion(today)
    })
    setRecipe(prev => ({
      ...prev,
      cookLog: [...(prev.cookLog || []), today]
    }))
    setMarking(false)
  }

  async function handleDelete() {
    await deleteDoc(doc(db, 'recipes', id))
    navigate('/')
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', gap: '16px' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Recipe not found.</div>
        <button onClick={() => navigate('/')} style={{ color: 'var(--accent)' }}>Go back</button>
      </div>
    )
  }

  const sortedLog = [...(recipe.cookLog || [])].sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Hero photo */}
        <div style={{
          width: '100%',
          height: '260px',
          background: 'var(--bg-elevated)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {recipe.photoURL ? (
            <img src={recipe.photoURL} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>🍽</div>
          )}
          {/* Back button overlay */}
          <button
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: 'calc(var(--safe-top) + 12px)',
              left: '16px',
              width: '34px', height: '34px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              fontSize: '20px',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            ‹
          </button>
          {/* Edit button overlay */}
          <button
            onClick={() => navigate(`/edit/${id}`)}
            style={{
              position: 'absolute',
              top: 'calc(var(--safe-top) + 12px)',
              right: '16px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              color: 'var(--accent)',
              fontSize: '13px',
              fontWeight: '500',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Edit
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 20px 32px' }} className="page-enter">

          {/* Title & rating */}
          <div style={{ marginBottom: '14px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
              marginBottom: '8px',
              lineHeight: 1.2,
            }}>
              {recipe.name}
            </h1>
            <StarRating value={recipe.rating || 0} readonly size={20} />
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {recipe.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Source link */}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                marginBottom: '20px',
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span style={{ color: 'var(--accent)', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {recipe.sourceUrl}
              </span>
            </a>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.trim() && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Ingredients
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                {recipe.ingredients}
              </div>
            </div>
          )}

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.trim() && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Instructions
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.9', whiteSpace: 'pre-line' }}>
                {recipe.instructions}
              </div>
            </div>
          )}

          {/* Notes */}
          {recipe.notes && recipe.notes.trim() && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Notes
              </div>
              <div style={{
                background: 'var(--bg-surface)',
                borderLeft: '2px solid var(--accent)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                padding: '12px 14px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                whiteSpace: 'pre-line',
              }}>
                {recipe.notes}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

          {/* Made This */}
          <button
            onClick={handleMadeThis}
            disabled={marking}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--accent)',
              color: '#111',
              borderRadius: 'var(--radius-sm)',
              fontSize: '15px',
              fontWeight: '500',
              marginBottom: '10px',
              opacity: marking ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {marking ? 'Logged!' : '✓ Made This'}
          </button>

          {/* Cook log */}
          {sortedLog.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                Made {sortedLog.length} time{sortedLog.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {sortedLog.slice(0, 5).map((d, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {formatDate(d)}
                  </div>
                ))}
                {sortedLog.length > 5 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    +{sortedLog.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delete */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ color: '#e07070', fontSize: '13px', width: '100%', padding: '8px', textAlign: 'center' }}
            >
              Delete Recipe
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1, padding: '12px',
                  background: '#e07070', color: '#fff',
                  borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500',
                }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '12px',
                  background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)', fontSize: '14px',
                  border: '1px solid var(--border)',
                }}
              >
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
