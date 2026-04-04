import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export default function AddWantToTryPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', sourceUrl: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!form.name.trim()) { setError('Recipe name is required.'); return }
    setSaving(true)
    setError('')
    try {
      await addDoc(collection(db, 'wantToTry'), {
        name: form.name.trim(),
        sourceUrl: form.sourceUrl.trim(),
        note: form.note.trim(),
        createdAt: serverTimestamp(),
      })
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'calc(var(--safe-top) + 14px) 20px 14px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Cancel
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-primary)' }}>
          Want to Try
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ color: saving ? 'var(--text-tertiary)' : 'var(--accent)', fontSize: '15px', fontWeight: '500' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px' }} className="page-enter">

        {error && (
          <div style={{
            background: 'rgba(224,112,112,0.12)',
            border: '1px solid rgba(224,112,112,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#e07070',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Recipe Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Birria Tacos"
            style={{ padding: '12px 14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Source Link</label>
          <input
            type="url"
            value={form.sourceUrl}
            onChange={e => setForm(p => ({ ...p, sourceUrl: e.target.value }))}
            placeholder="TikTok, Instagram, YouTube, etc."
            style={{ padding: '12px 14px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Note</label>
          <textarea
            value={form.note}
            onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
            placeholder="Looks amazing, try on a weekend..."
            rows={4}
            style={{ padding: '12px 14px', resize: 'vertical', lineHeight: '1.6' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--accent)',
            color: '#111',
            borderRadius: 'var(--radius-sm)',
            fontSize: '15px',
            fontWeight: '500',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Add to Want to Try'}
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: 'var(--text-tertiary)',
  fontWeight: '500',
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  marginBottom: '8px',
}
