import React, { useState } from 'react'

export function RoomCode({ code, onRefresh }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border2)',
        borderRadius: 10,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: 'var(--text3)',
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
        }}
      >
        código da sala
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 7,
            fontFamily: 'var(--mono)',
            color: 'var(--text)',
          }}
        >
          {code || '——————'}
        </span>

        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button
            onClick={copy}
            style={{
              fontSize: 11,
              fontFamily: 'var(--mono)',
              background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(79,70,229,0.12)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(79,70,229,0.3)'}`,
              color: copied ? 'var(--green)' : 'var(--accent-light)',
              padding: '5px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '✓ copiado' : 'copiar'}
          </button>

          <button
            onClick={onRefresh}
            title="Gerar novo código"
            style={{
              fontSize: 14,
              background: 'transparent',
              border: '1px solid var(--border2)',
              color: 'var(--text2)',
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            ↺
          </button>
        </div>
      </div>

      <span
        style={{
          fontSize: 11,
          color: 'var(--text3)',
          fontFamily: 'var(--mono)',
        }}
      >
        digite este código no dispositivo receptor
      </span>
    </div>
  )
}
