import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  collection, addDoc, doc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../firebase'
import StarRating from '../components/StarRating'

const COMMON_TAGS = ['Italian', 'Mexican', 'Japanese', 'Indian', 'American', 'Thai', 'Chinese', 'French',
  'Chicken', 'Beef', 'Pork', 'Fish', 'Vegetarian', 'Vegan', 'Pasta', 'Soup', 'Salad',
  'Quick', 'Date Night', 'Weekend', 'Comfort Food', 'Healthy', 'Grill', 'Bake']

export default function AddEditRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    rating: 0,
    tags: [],
    sourceUrl: '',
    ingredients: '',
    instructions: '',
    notes: '',
  })
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
        setForm({
          name: data.name || '',
          rating: data.rating || 0,
          tags: data.tags || [],
          sourceUrl: data.sourceUrl || '',
          ingredients: data.ingredients || '',
          instructions: data.instructions || '',
          notes: data.notes || '',
        })
        if (data.photoURL) setExistingPhotoURL(data.photoURL)
      }
      setLoading(false)
    }
    load()
  }, [id, isEdit])

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    // Warn if file is very large (over 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo is over 10MB. It will still upload but may be slow.')
    } else {
      setError('')
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function toggleTag(tag) {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  function addCustomTag() {
    const t = tagInput.trim()
    if (!t || form.tags.includes(t)) { setTagInput(''); return }
    setForm(prev => ({ ...prev, tags: [...prev.tags, t] }))
    setTagInput('')
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Recipe name is required.'); return }
    setSaving(true)
    setError('')

    try {
      let photoURL = existingPhotoURL || null

      // Upload photo to Cloudinary if a new one was selected
      if (photoFile) {
        const formData = new FormData()
        formData.append('file', photoFile)
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        if (!res.ok) throw new Error('Photo upload failed')
        const data = await res.json()
        photoURL = data.secure_url
      }

      const payload = {
        name: form.name.trim(),
        rating: form.rating,
        tags: form.tags,
        sourceUrl: form.sourceUrl.trim(),
        ingredients: form.ingredients.trim(),
        instructions: form.instructions.trim(),
        notes: form.notes.trim(),
        photoURL,
      }

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
      setError('Something went wrong saving the recipe. Please try again.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const photoSrc = photoPreview || existingPhotoURL

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'calc(var(--safe-top) + 14px) 20px 14px',
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Cancel
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-primary)' }}>
          {isEdit ? 'Edit Recipe' : 'New Recipe'}
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            color: saving ? 'var(--text-tertiary)' : 'var(--accent)',
            fontSize: '15px',
            fontWeight: '500',
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px' }} className="page-enter">

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

        {/* Photo picker */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            height: '180px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {photoSrc ? (
            <>
              <img src={photoSrc} alt="Recipe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', bottom: '10px', right: '10px',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                borderRadius: '20px', padding: '5px 12px',
                color: '#fff', fontSize: '12px',
              }}>
                Change
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>📷</div>
              <div style={{ fontSize: '13px' }}>Tap to add photo</div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Recipe Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Cacio e Pepe"
            style={{ padding: '12px 14px' }}
          />
        </div>

        {/* Rating */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Rating</label>
          <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} size={28} />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {COMMON_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  background: form.tags.includes(tag) ? 'var(--accent)' : 'var(--bg-surface)',
                  color: form.tags.includes(tag) ? '#111' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: form.tags.includes(tag) ? 'var(--accent)' : 'var(--border)',
                  transition: 'all 0.12s',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
          {/* Custom tag input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              placeholder="Add custom tag..."
              style={{ padding: '10px 12px', flex: 1 }}
            />
            <button
              type="button"
              onClick={addCustomTag}
              style={{
                padding: '10px 16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                flexShrink: 0,
              }}
            >
              Add
            </button>
          </div>
          {/* Show active custom tags not in COMMON_TAGS */}
          {form.tags.filter(t => !COMMON_TAGS.includes(t)).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {form.tags.filter(t => !COMMON_TAGS.includes(t)).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    background: 'var(--accent)',
                    color: '#111',
                    border: '1px solid var(--accent)',
                  }}
                >
                  {tag} ×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Source URL */}
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

        {/* Ingredients */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Ingredients</label>
          <textarea
            value={form.ingredients}
            onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))}
            placeholder="One ingredient per line&#10;e.g. 200g spaghetti&#10;100g Pecorino Romano"
            rows={6}
            style={{ padding: '12px 14px', resize: 'vertical', lineHeight: '1.6' }}
          />
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Instructions</label>
          <textarea
            value={form.instructions}
            onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
            placeholder="Step 1: Boil salted water...&#10;Step 2: ..."
            rows={8}
            style={{ padding: '12px 14px', resize: 'vertical', lineHeight: '1.6' }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Personal tweaks, tips, what worked well..."
            rows={4}
            style={{ padding: '12px 14px', resize: 'vertical', lineHeight: '1.6' }}
          />
        </div>

        {/* Save button (bottom) */}
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
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Recipe'}
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
