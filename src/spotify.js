const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = window.location.origin + window.location.pathname

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-library-read',
  'user-follow-read',
  'user-read-recently-played',
].join(' ')

export function getLoginUrl() {
  const params = new URLSearchParams({
    response_type: 'token',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'false',
  })
  return `https://accounts.spotify.com/authorize?${params}`
}

export function getTokenFromHash() {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const token = params.get('access_token')
  const expiresIn = params.get('expires_in')
  if (token) {
    const expiresAt = Date.now() + parseInt(expiresIn, 10) * 1000
    return { token, expiresAt }
  }
  return null
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
}

export async function spotifyGet(endpoint, token) {
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Spotify API ${res.status}`)
  return res.json()
}
