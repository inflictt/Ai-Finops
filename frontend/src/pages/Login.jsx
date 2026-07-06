// The login / signup screen. Shown by App.jsx whenever no one is logged in.
// Styled with your existing Editorial classes (.panel, .input, .btn, etc.).
import React, { useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isSignup = mode === 'signup'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isSignup) await register(name, email, password)
      else await login(email, password) // success → AuthProvider sets the user → App renders the dashboard
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6" style={{ background: 'var(--desk)' }}>
      <div className="grain" aria-hidden="true" />
      <div className="panel p-8 w-full max-w-[420px] relative z-10">
        <div className="eyebrow mb-3"><span className="ebdot" />AI FinOps</div>
        <h1 className="disp text-[26px] mb-1">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="text-[13.5px] text-muted mb-6">
          {isSignup ? 'Start automating your cloud cost reports.' : 'Log in to see your reports.'}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          {isSignup && (
            <div>
              <label className="field-label">Name</label>
              <input className="input mt-1.5" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name" required />
            </div>
          )}
          <div>
            <label className="field-label">Email</label>
            <input className="input mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="input mt-1.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={6} />
          </div>

          {error && <div className="text-[13px]" style={{ color: 'var(--destructive)' }}>{error}</div>}

          <button className="btn btn-primary w-full mt-1" disabled={busy} type="submit">
            {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <div className="text-[13px] text-muted mt-5 text-center">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="accent-text font-semibold"
            onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError('') }}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}