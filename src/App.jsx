import React, { useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import { exchangeCodeForToken, getStoredToken, storeToken, clearToken } from './spotify.js'

export default function App() {
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function init() {
      // Check for ?code= in URL (returning from Spotify OAuth)
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorParam = params.get('error')

      if (errorParam) {
        setError('Spotify login was cancelled or denied.')
        window.history.replaceState(null, '', window.location.pathname)
        setReady(true)
        return
      }

      if (code) {
        // Clean URL immediately so refresh doesn't re-use the code
        window.history.replaceState(null, '', window.location.pathname)
        try {
          const { token, expiresAt } = await exchangeCodeForToken(code)
          storeToken(token, expiresAt)
          setToken(token)
        } catch (e) {
          setError('Could not complete login: ' + e.message)
        }
        setReady(true)
        return
      }

      // Check sessionStorage for existing token
      const stored = getStoredToken()
      if (stored) setToken(stored)
      setReady(true)
    }

    init()
  }, [])

  function handleLogout() {
    clearToken()
    setToken(null)
  }

  if (!ready) return null

  return token
    ? <Dashboard token={token} onLogout={handleLogout} />
    : <Login error={error} />
}
