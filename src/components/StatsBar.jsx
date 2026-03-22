import React from 'react'

function Chip({ label, value, tvMode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: tvMode ? 8 : 6,
        padding: tvMode ? '8px 14px' : '5px 10px',
        fontSize: tvMode ? 14 : 12,
        fontFamily: 'var(--mono)',
      }}
    >
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value ?? '—'}</span>
    </div>
  )
}

export function StatsBar({ stats, videoEl, tvMode = false }) {
  const res = videoEl?.videoWidth ? `${videoEl.videoWidth}×${videoEl.videoHeight}` : undefined

  const qualityColor =
    stats?.qualityScore === 'none' ? 'var(--green)'
    : stats?.qualityScore === 'bandwidth' ? 'var(--amber)'
    : stats?.qualityScore ? 'var(--red)'
    : undefined

  return (
    <div style={{ display: 'flex', gap: tvMode ? 10 : 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip label="res" value={res} tvMode={tvMode} />
      <Chip label="fps" value={stats?.fps} tvMode={tvMode} />
      <Chip label="bitrate" value={stats?.kbps ? `${stats.kbps} kbps` : undefined} tvMode={tvMode} />
      {stats?.rtt !== undefined && <Chip label="rtt" value={`${stats.rtt}ms`} tvMode={tvMode} />}
      {stats?.jitter !== undefined && <Chip label="jitter" value={`${stats.jitter}ms`} tvMode={tvMode} />}
      {stats?.qualityScore && (
        <div style={{
          fontSize: tvMode ? 13 : 11,
          fontFamily: 'var(--mono)',
          color: qualityColor,
          padding: tvMode ? '8px 12px' : '5px 8px',
          background: 'var(--surface2)',
          border: `1px solid ${qualityColor ?? 'var(--border)'}`,
          borderRadius: tvMode ? 8 : 6,
          opacity: 0.9,
        }}>
          limite: {stats.qualityScore}
        </div>
      )}
    </div>
  )
}