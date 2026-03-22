import React, { useEffect, useRef } from 'react'

const typeColor = {
  ok: '#10b981',
  err: '#f43f5e',
  info: '#818cf8',
  '': 'var(--text2, #9d9abf)',
}

export function LogPanel({ entries }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [entries])

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 12px',
        fontFamily: 'var(--mono)',
        fontSize: 11,
        maxHeight: 96,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: 'var(--text3)', flexShrink: 0 }}>{e.time}</span>
          <span style={{ color: typeColor[e.type] ?? typeColor[''] }}>{e.msg}</span>
        </div>
      ))}
    </div>
  )
}
