// One place that holds "who is logged in" for the whole app.
// Any component can call useAuth() to read the user or log in/out.
import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, logoutUser, getMe } from './auth.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, ask the backend "who am I?" using the cookie.
  // This is what keeps you logged in across refreshes.
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await loginUser(email, password)
    setUser(res.data.user) // login returns { data: { user, accessToken } }
    return res
  }

  const register = async (name, email, password) => {
    await registerUser(name, email, password)
    // register doesn't issue tokens, so log in right after for a smooth flow
    return login(email, password)
  }

  const logout = async () => {
    try { await logoutUser() } catch (e) { /* ignore */ }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}