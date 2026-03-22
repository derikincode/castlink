import React from 'react'

const styles = {
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.3s',
  },
}

const colors = {
  idle: '#3a3860',
  connecting: '#f59e0b',
  connected: '#10b981',
  error: '#f43f5e',
}

export function StatusDot({ status }) {
  return (
    <span
      style={{
        ...styles.dot,
        background: colors[status] ?? colors.idle,
        animation: status === 'connecting' ? 'pulse 1s infinite' : 'none',
      }}
    />
  )
}
