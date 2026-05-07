export default function StarRating({ value, onChange, size = 22, readonly = false }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          className={readonly ? '' : 'tappable'}
          style={{ background: 'none', border: 'none', padding: '2px', cursor: readonly ? 'default' : 'pointer', lineHeight: 1 }}
        >
          <svg width={size} height={size} viewBox="0 0 24 24"
            fill={star <= value ? 'var(--accent)' : 'none'}
            stroke={star <= value ? 'var(--accent)' : 'var(--text-tertiary)'}
            strokeWidth="1.2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}
