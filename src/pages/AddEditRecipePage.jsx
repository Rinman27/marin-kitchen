import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../firebase'
import StarRating from '../components/StarRating'

const COMMON_TAGS = [
  'Italian', 'Mexican', 'Japanese', 'Indian', 'American', 'Thai', 'Chinese', 'French',
  'Chicken', 'Beef', 'Pork', 'Fish', 'Vegetarian', 'Vegan',
  'Pasta', 'Soup', 'Salad', 'Grill', 'Bake',
  'Quick', 'Date Night', 'Weekend', 'Comfort Food', 'Healthy'
]

const Label = ({ children }) => (
  <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: '500', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
    {children}
  </div>
)

export default function AddEditRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ name: '', rating: 0, tags: [], sourceUrl: '', ingredients: '', instructions: '', notes: '' })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [existingPhotoURL, setExistingPhotoURL] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    async function load() {
      const snap = await getDoc(doc(db, 'recipes', id))
      if (snap.exists()) {
        const data = snap.data()
        setForm({ name: data.name || '', rating: data.rating || 0, tags: data.tags || [], sourceUrl: data.sourceUrl || '', ingredients: data.ingredients || '', instructions: data.instructions || '', notes: data.notes || '' })
        if (data.photoURL) setExistingPhotoURL(data.photoURL)
      }
      setLoading(false)
    }
    load()
  }, [id, isEdit])

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    setError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function toggleTag(tag) {
    setForm(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag] }))
  }

  function addCustomTag() {
    const t = tagInput.trim()
    if (!t || form.tags.includes(t)) { setTagInput(''); return }
    setForm(p => ({ ...p, tags: [...p.tags, t] }))
    setTagInput('')
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Recipe name is required.'); return }
    setSaving(true)
    setError('')
    try {
      let photoURL = existingPhotoURL || null
      if (photoFile) {
        const formData = new FormData()
        formData.append('file', photoFile)
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Photo upload failed')
        const data = await res.json()
        photoURL = data.secure_url
      }
      const payload = { name: form.name.trim(), rating: form.rating, tags: form.tags, sourceUrl: form.sourceUrl.trim(), ingredients: form.ingredients.trim(), instructions: form.instructions.trim(), notes: form.notes.trim(), photoURL }
      if (isEdit) {
        await updateDoc(doc(db, 'recipes', id), { ...payload, updatedAt: serverTimestamp() })
        navigate(`/recipe/${id}`)
      } else {
        payload.createdAt = serverTimestamp()
        payload.cookLog = []
        const docRef = await addDoc(collection(db, 'recipes'), payload)
        navigate(`/recipe/${docRef.id}`)
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}><div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Loading...</div></div>

  const photoSrc = photoPreview || existingPhotoURL

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'calc(var(--safe-top) + 14px) var(--page-pad) 14px',
        borderBottom: '0.5px solid var(--border)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)} className="tappable" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Cancel</button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontStyle: 'italic', fontWeight: 300, color: 'var(--text-primary)' }}>
          {isEdit ? 'Edit Recipe' : 'New Recipe'}
        </span>
        <button onClick={handleSave} disabled={saving} className="tappable" style={{ color: saving ? 'var(--text-tertiary)' : 'var(--accent)', fontSize: '14px', fontWeight: '500' }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px var(--page-pad) 40px' }} className="page-enter">
        {error && (
          <div style={{ background: 'rgba(180,80,80,0.1)', border: '0.5px solid rgba(180,80,80,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 13px', color: '#c47070', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Photo */}
        <div onClick={() => fileInputRef.current?.click()} style={{
          width: '100%', height: '180px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '0.5px dashed var(--border-medium)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '22px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
        }} className="tappable">
          {photoSrc ? (
            <>
              <img src={photoSrc} alt="Recipe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '5px 12px', color: '#fff', fontSize: '11px' }}>Change</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '26px', marginBottom: '6px' }}>📷</div>
              <div style={{ fontSize: '12px', letterSpacing: '0.3px' }}>Tap to add photo</div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </div>

        {/* Name */}
        <div style={{ marginBottom: '18px' }}>
          <Label>Recipe Name *</Label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Cacio e Pepe" style={{ padding: '12px 14px' }} />
        </div>

        {/* Rating */}
        <div style={{ marginBottom: '18px' }}>
          <Label>Rating</Label>
          <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} size={26} />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '18px' }}>
          <Label>Tags</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {COMMON_TAGS.map(tag => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)} className="tappable" style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '11px',
                background: form.tags.includes(tag) ? 'var(--accent)' : 'var(--bg-surface)',
                color: form.tags.includes(tag) ? '#0c0c0c' : 'var(--text-secondary)',
                border: `0.5px solid ${form.tags.includes(tag) ? 'var(--accent)' : 'var(--border-medium)'}`,
                transition: 'all 0.12s',
              }}>
                {tag}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomTag()} placeholder="Custom tag..." style={{ padding: '10px 12px', flex: 1, fontSize: '13px' }} />
            <button type="button" onClick={addCustomTag} className="tappable" style={{ padding: '10px 14px', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '12px', flexShrink: 0 }}>Add</button>
          </div>
          {form.tags.filter(t => !COMMON_TAGS.includes(t)).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {form.tags.filter(t => !COMMON_TAGS.includes(t)).map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} className="tappable" style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', background: 'var(--accent)', color: '#0c0c0c', border: '0.5px solid var(--accent)' }}>
                  {tag} ×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Source */}
        <div style={{ marginBottom: '18px' }}>
          <Label>Source Link</Label>
          <input type="url" value={form.sourceUrl} onChange={e => setForm(p => ({ ...p, sourceUrl: e.target.value }))} placeholder="TikTok, Instagram, YouTube, etc." style={{ padding: '12px 14px', fontSize: '13px' }} />
        </div>

        {/* Ingredients */}
        <div style={{ marginBottom: '18px' }}>
          <Label>Ingredients</Label>
          <textarea value={form.ingredients} onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))} placeholder={'One per line\ne.g. 200g spaghetti\n100g Pecorino Romano'} rows={6} style={{ padding: '12px 14px', resize: 'vertical', lineHeight: '1.7', fontSize: '13px' }} />
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: '18px' }}>
          <Label>Instructions</Label>
          <textarea value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} placeholder={'Step 1: ...\nStep 2: ...'} rows={8} style={{ padding: '12px 14px', resize: 'vertical', lineHeight: '1.7', fontSize: '13px' }} />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '24px' }}>
          <Label>Notes</Label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Personal tweaks, tips, what worked well..." rows={4} style={{ padding: '12px 14px', resize: 'vertical', lineHeight: '1.7', fontSize: '13px', fontStyle: 'italic' }} />
        </div>

        <button onClick={handleSave} disabled={saving} className="tappable" style={{
          width: '100%', padding: '13px',
          background: 'var(--accent)', color: '#0c0c0c',
          borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500',
          letterSpacing: '0.4px', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Recipe'}
        </button>
      </div>
    </div>
  )
}
