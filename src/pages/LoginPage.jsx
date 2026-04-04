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
    } catch (err) {
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
      padding: '0 32px',
    }}>
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          color: 'var(--accent)',
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          MaRin Kitchen
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Our personal recipe journal
        </div>
      </div>

      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '320px' }}>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '14px 16px', fontSize: '15px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '14px 16px', fontSize: '15px' }}
          />
        </div>

        {error && (
          <div style={{
            color: '#e07070',
            fontSize: '13px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--accent)',
            color: '#111',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '15px',
            fontWeight: '500',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.15s'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
