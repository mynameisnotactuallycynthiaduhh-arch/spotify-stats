import React from 'react'
import styles from './TopList.module.css'

const icons = {
  song: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  artist: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  album: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
}

function getImage(item, type) {
  if (type === 'track') return item.album?.images?.[2]?.url || item.album?.images?.[0]?.url
  if (type === 'artist') return item.images?.[1]?.url || item.images?.[0]?.url
  if (type === 'album') return item.images?.[1]?.url || item.images?.[0]?.url
  return ''
}

function getSub(item, type) {
  if (type === 'track') return item.artists?.map((a) => a.name).join(', ')
  if (type === 'artist') {
    if (item.followers?.total) return item.followers.total.toLocaleString() + ' followers'
    return item.genres?.[0] || ''
  }
  if (type === 'album') return item.artists?.map((a) => a.name).join(', ')
  return ''
}

function getUrl(item) {
  return item.external_urls?.spotify || '#'
}

function SkeletonRow({ i }) {
  return (
    <div className={styles.row}>
      <span className={styles.rank}>{i + 1}</span>
      <div className={`${styles.img} ${styles.skelImg}`} />
      <div className={styles.info}>
        <div className={`${styles.skelLine} ${styles.skelName}`} style={{ width: `${55 + Math.random() * 30}%` }} />
        <div className={`${styles.skelLine} ${styles.skelSub}`} style={{ width: `${30 + Math.random() * 20}%` }} />
      </div>
    </div>
  )
}

export default function TopList({ title, icon, items, loading, type }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon}>{icons[icon]}</span>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>

      <div className={styles.list}>
        {loading
          ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} i={i} />)
          : items.map((item, i) => (
              <div key={item.id} className={styles.row}>
                <span className={styles.rank}>{i + 1}</span>
                <img
                  className={`${styles.img} ${type === 'artist' ? styles.circle : ''}`}
                  src={getImage(item, type)}
                  alt=""
                  loading="lazy"
                />
                <div className={styles.info}>
                  <div className={styles.name}>{item.name}</div>
                  <div className={styles.sub}>{getSub(item, type)}</div>
                </div>
                <a
                  href={getUrl(item)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.playBtn}
                  title="Open in Spotify"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                </a>
              </div>
            ))}
      </div>
    </div>
  )
}
