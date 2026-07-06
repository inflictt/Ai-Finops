// All auth API calls live here.
// The KEY detail: credentials:'include' — without it the browser won't send or
// store the httpOnly cookies your backend sets, so login would "work" but the
// session would never stick.
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // send + receive the auth cookies
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const registerUser = (name, email, password) =>
  post('/api/auth/register', { name, email, password })

export const loginUser = (email, password) =>
  post('/api/auth/login', { email, password })

export const logoutUser = () => post('/api/auth/logout')

// "Current User" — reads the cookie on the backend. Returns the user or null.
export async function getMe() {
  const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' })
  if (!res.ok) return null 
  const data = await res.json()
  return data.data 
}