import React from 'react'
import styles from './StatCard.module.css'

export default function StatCard({ eyebrow, value, label, accent }) {
  const isLoading = value === null || value === undefined

  return (
    <div className={`${styles.card} ${accent ? styles.accent : ''}`}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      {isLoading ? (
        <div className={styles.skelValue} />
      ) : (
        <div className={`${styles.value} ${accent ? styles.valueGreen : ''}`}>{value}</div>
      )}
      {isLoading ? (
        <div className={styles.skelLabel} />
      ) : (
        <div className={styles.label}>{label}</div>
      )}
    </div>
  )
}
