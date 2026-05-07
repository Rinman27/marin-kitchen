import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const Label = ({ children }) => (
  <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: '500', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
    {children}
  </div>
)

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
      navigate('/?tab=wanttotry')
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'calc(var(--safe-top) + 14px) var(--page-pad) 14px',
        borderBottom: '0.5px solid var(--border)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate('/?tab=wanttotry')} className="tappable" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Cancel</button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontStyle: 'italic', fontWeight: 300, color: 'var(--text-primary)' }}>Want to Try</span>
        <button onClick={handleSave} disabled={saving} className="tappable" style={{ color: saving ? 'var(--text-tertiary)' : 'var(--accent)', fontSize: '14px', fontWeight: '500' }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px var(--page-pad) 40px' }} className="page-enter">
        {error && (
          <div style={{ background: 'rgba(180,80,80,0.1)', border: '0.5px solid rgba(180,80,80,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 13px', color: '#c47070', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '18px' }}>
          <Label>Recipe Name *</Label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Birria Tacos" style={{ padding: '12px 14px', fontSize: '13px' }} />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <Label>Source Link</Label>
          <input type="url" value={form.sourceUrl} onChange={e => setForm(p => ({ ...p, sourceUrl: e.target.value }))} placeholder="TikTok, Instagram, YouTube, etc." style={{ padding: '12px 14px', fontSize: '13px' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Label>Note</Label>
          <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Looks amazing, try on a weekend..." rows={4} style={{ padding: '12px 14px', resize: 'vertical', lineHeight: '1.7', fontSize: '13px' }} />
        </div>

        <button onClick={handleSave} disabled={saving} className="tappable" style={{
          width: '100%', padding: '13px',
          background: 'var(--accent)', color: '#0c0c0c',
          borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500',
          letterSpacing: '0.4px', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving...' : 'Add to Want to Try'}
        </button>
      </div>
    </div>
  )
}
