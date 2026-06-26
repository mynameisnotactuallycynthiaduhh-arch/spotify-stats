import React, { useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import { getTokenFromHash, getStoredToken, storeToken, clearToken } from './spotify.js'

export default function App() {
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Check for token in URL hash (returning from Spotify OAuth)
    const fromHash = getTokenFromHash()
    if (fromHash) {
      storeToken(fromHash.token, fromHash.expiresAt)
      setToken(fromHash.token)
      // Clean hash from URL without reload
      window.history.replaceState(null, '', window.location.pathname)
      setReady(true)
      return
    }

    // Check sessionStorage
    const stored = getStoredToken()
    if (stored) setToken(stored)
    setReady(true)
  }, [])

  function handleLogout() {
    clearToken()
    setToken(null)
  }

  if (!ready) return null // Avoid flash

  return token
    ? <Dashboard token={token} onLogout={handleLogout} />
    : <Login />
}
