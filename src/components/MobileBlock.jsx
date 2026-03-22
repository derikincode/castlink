import React from 'react'

export function MobileBlock() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)`, backgroundSize: '44px 44px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 340, textAlign: 'center', width: '100%' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z"/>
              <polygon points="17,14 17,20 22,17"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800 }}>CastLink</span>
        </div>

        {/* Icon */}
        <div style={{ width: 58, height: 58, borderRadius: 16, background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--accent-light)">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
          </svg>
        </div>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>App em breve</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0, lineHeight: 1.6, fontFamily: 'var(--mono)' }}>
            O CastLink para celular está em desenvolvimento. Use um PC ou notebook para transmitir.
          </p>
        </div>

        {/* Info box */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 18px', width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 1 }}>para transmitir use</span>
          {[
            { icon: '💻', label: 'Chrome no PC ou Mac' },
            { icon: '🪟', label: 'Edge no Windows' },
            { icon: '🦊', label: 'Firefox no desktop' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{item.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}