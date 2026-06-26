const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = window.location.origin + window.location.pathname.replace(/\/$/, '')

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-library-read',
  'user-follow-read',
  'user-read-recently-played',
].join(' ')

// ── PKCE helpers ─────────────────────────────────────────────────────────────

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array).map((b) => chars[b % chars.length]).join('')
}

async function sha256(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function getLoginUrl() {
  const codeVerifier = generateRandomString(64)
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64urlEncode(hashed)

  sessionStorage.setItem('spotify_code_verifier', codeVerifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  })

  return `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCodeForToken(code) {
  const codeVerifier = sessionStorage.getItem('spotify_code_verifier')
  if (!codeVerifier) throw new Error('No code verifier found')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error_description || 'Token exchange failed')
  }

  const data = await res.json()
  sessionStorage.removeItem('spotify_code_verifier')
  return {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}

export function getStoredToken() {
  const token = sessionStorage.getItem('spotify_token')
  const expiresAt = parseInt(sessionStorage.getItem('spotify_expires_at') || '0', 10)
  if (token && Date.now() < expiresAt) return token
  sessionStorage.removeItem('spotify_token')
  sessionStorage.removeItem('spotify_expires_at')
  return null
}

export function storeToken(token, expiresAt) {
  sessionStorage.setItem('spotify_token', token)
  sessionStorage.setItem('spotify_expires_at', String(expiresAt))
}

export function clearToken() {
  sessionStorage.removeItem('spotify_token')
  sessionStorage.removeItem('spotify_expires_at')
  sessionStorage.removeItem('spotify_code_verifier')
}

export async function spotifyGet(endpoint, token) {
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Spotify API ${res.status}`)
  return res.json()
}
