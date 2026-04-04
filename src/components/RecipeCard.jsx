import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating'

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      style={{
        display: 'flex',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        minHeight: '90px',
      }}
      onTouchStart={e => e.currentTarget.style.borderColor = 'var(--border-medium)'}
      onTouchEnd={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Photo */}
      <div style={{
        width: '90px',
        minWidth: '90px',
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {recipe.photoURL ? (
          <img
            src={recipe.photoURL}
            alt={recipe.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-tertiary)', fontSize: '28px'
          }}>
            🍽
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px', flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          color: 'var(--text-primary)',
          marginBottom: '5px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {recipe.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
          <StarRating value={recipe.rating || 0} readonly size={14} />
          {recipe.cookLog && recipe.cookLog.length > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              · {recipe.cookLog.length}×
            </span>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {recipe.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '20px',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
