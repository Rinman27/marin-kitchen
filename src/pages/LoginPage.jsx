import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100%',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 36px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }} className="page-enter">
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '52px',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--accent)',
          letterSpacing: '-1px',
          lineHeight: 1,
          marginBottom: '8px',
        }}>
          MaRin
        </div>
        <div style={{
          width: '48px',
          height: '0.5px',
          background: 'var(--accent)',
          opacity: 0.2,
          margin: '0 auto 8px',
        }} />
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '9px',
          color: 'var(--accent)',
          opacity: 0.3,
          letterSpacing: '5px',
          fontWeight: 400,
        }}>
          KITCHEN
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '300px' }} className="page-enter">
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '13px 16px', fontSize: '14px', letterSpacing: '0.2px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '13px 16px', fontSize: '14px' }}
          />
        </div>

        {error && (
          <div style={{ color: '#c47070', fontSize: '12px', marginBottom: '14px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tappable"
          style={{
            width: '100%',
            padding: '13px',
            background: 'var(--accent)',
            color: '#0c0c0c',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '0.5px',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
