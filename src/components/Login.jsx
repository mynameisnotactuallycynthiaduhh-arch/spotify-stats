import React from 'react'
import { getLoginUrl } from '../spotify.js'
import styles from './Login.module.css'

const SpotifyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

export default function Login({ error }) {
  async function handleLogin() {
    const url = await getLoginUrl()
    window.location.href = url
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.waveform} aria-hidden="true">
          {[20, 38, 55, 32, 50, 60, 44, 28, 48, 18].map((h, i) => (
            <div
              key={i}
              className={styles.bar}
              style={{ height: h, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>

        <h1 className={styles.headline}>
          Your music,<br /><span>counted.</span>
        </h1>
        <p className={styles.sub}>
          Top songs, artists, albums, and listening stats — pulled live from your Spotify account.
        </p>

        <button className={styles.btn} onClick={handleLogin}>
          <SpotifyIcon />
          Log in with Spotify
        </button>

        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.note}>
          Read-only access. Nothing is stored.
        </p>
      </div>
    </div>
  )
}
