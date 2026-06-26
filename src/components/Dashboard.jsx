import React, { useEffect, useState, useCallback } from 'react'
import { spotifyGet, clearToken } from '../spotify.js'
import StatCard from './StatCard.jsx'
import TopList from './TopList.jsx'
import styles from './Dashboard.module.css'

const RANGES = [
  { key: 'short_term', label: '4 weeks' },
  { key: 'medium_term', label: '6 months' },
  { key: 'long_term', label: 'All time' },
]

export default function Dashboard({ token, onLogout }) {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [tops, setTops] = useState({ songs: [], artists: [], albums: [] })
  const [range, setRange] = useState('short_term')
  const [loadingTops, setLoadingTops] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState(null)

  const api = useCallback((endpoint) => spotifyGet(endpoint, token), [token])

  // Load profile + hero stats once
  useEffect(() => {
    async function load() {
      try {
        const [me, recent, saved, following] = await Promise.all([
          api('/me'),
          api('/me/player/recently-played?limit=50'),
          api('/me/tracks?limit=1'),
          api('/me/following?type=artist&limit=1'),
        ])

        setUser(me)

        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        const weekTracks = (recent.items || []).filter(
          (i) => new Date(i.played_at).getTime() > oneWeekAgo
        )
        const weekMs = weekTracks.reduce((s, i) => s + (i.track?.duration_ms || 0), 0)
        const weekMin = Math.round(weekMs / 60000)

        const savedTotal = saved.total || 0
        const roughHours = Math.round((savedTotal * 3.5 * 3) / 60)

        setStats({
          weekMin,
          lifetimeHours: roughHours,
          savedTracks: savedTotal,
          followedArtists: following.artists?.total || 0,
        })
      } catch (e) {
        if (e.message === 'UNAUTHORIZED') onLogout()
        else setError('Could not load your profile.')
      } finally {
        setLoadingStats(false)
      }
    }
    load()
  }, [api, onLogout])

  // Load tops when range changes
  useEffect(() => {
    async function load() {
      setLoadingTops(true)
      try {
        const [songs, artists] = await Promise.all([
          api(`/me/top/tracks?limit=10&time_range=${range}`),
          api(`/me/top/artists?limit=5&time_range=${range}`),
        ])

        // Derive top 5 unique albums from top tracks
        const seen = new Set()
        const albums = []
        for (const t of songs.items || []) {
          if (t.album && !seen.has(t.album.id)) {
            seen.add(t.album.id)
            albums.push(t.album)
            if (albums.length >= 5) break
          }
        }

        setTops({
          songs: (songs.items || []).slice(0, 5),
          artists: artists.items || [],
          albums,
        })
      } catch (e) {
        if (e.message === 'UNAUTHORIZED') onLogout()
        else setError('Could not load your top tracks.')
      } finally {
        setLoadingTops(false)
      }
    }
    load()
  }, [range, api, onLogout])

  const initials = user?.display_name
    ? user.display_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--green)">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>Spotify Stats</span>
        </div>

        <div className={styles.userArea}>
          <div className={styles.pill}>
            <div className={styles.avatar}>
              {user?.images?.[0]?.url
                ? <img src={user.images[0].url} alt={user.display_name} />
                : <span>{initials}</span>
              }
            </div>
            <span className={styles.userName}>{user?.display_name || '…'}</span>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout}>Log out</button>
        </div>
      </header>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Hero stats */}
      <section className={styles.heroGrid}>
        <StatCard
          eyebrow="This week"
          value={loadingStats ? null : stats.weekMin?.toLocaleString() ?? '—'}
          label="minutes listened"
          accent
        />
        <StatCard
          eyebrow="Estimated all-time"
          value={loadingStats ? null : stats.lifetimeHours?.toLocaleString() ?? '—'}
          label="hours of music"
        />
        <StatCard
          eyebrow="Saved tracks"
          value={loadingStats ? null : stats.savedTracks?.toLocaleString() ?? '—'}
          label="songs in your library"
        />
        <StatCard
          eyebrow="Following"
          value={loadingStats ? null : stats.followedArtists?.toLocaleString() ?? '—'}
          label="artists"
        />
      </section>

      {/* Top lists */}
      <section className={styles.listsSection}>
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>Your Top Picks</h2>
          <div className={styles.tabs}>
            {RANGES.map((r) => (
              <button
                key={r.key}
                className={`${styles.tab} ${range === r.key ? styles.tabActive : ''}`}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.listsGrid}>
          <TopList
            title="Top Songs"
            icon="song"
            items={tops.songs}
            loading={loadingTops}
            type="track"
          />
          <TopList
            title="Top Artists"
            icon="artist"
            items={tops.artists}
            loading={loadingTops}
            type="artist"
          />
          <TopList
            title="Top Albums"
            icon="album"
            items={tops.albums}
            loading={loadingTops}
            type="album"
          />
        </div>
      </section>
    </div>
  )
}
