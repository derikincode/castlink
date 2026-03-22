import React from 'react'

function Chip({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '5px 10px',
        fontSize: 12,
        fontFamily: 'var(--mono)',
      }}
    >
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value ?? '—'}</span>
    </div>
  )
}

export function StatsBar({ stats, videoEl }) {
  const res =
    videoEl?.videoWidth
      ? `${videoEl.videoWidth}×${videoEl.videoHeight}`
      : undefined

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Chip label="resolução" value={res} />
      <Chip label="fps" value={stats?.fps} />
      <Chip
        label="bitrate"
        value={stats?.kbps ? `${stats.kbps} kbps` : undefined}
      />
      {stats?.rtt !== undefined && (
        <Chip label="latência" value={`${stats.rtt}ms`} />
      )}
    </div>
  )
}
