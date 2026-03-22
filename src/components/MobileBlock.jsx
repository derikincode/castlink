import React from 'react'

export function MobileBlock() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)`, backgroundSize: '44px 44px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 360, textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z"/>
              <polygon points="17,14 17,20 22,17"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800 }}>CastLink</span>
        </div>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent-light)">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>App em breve</h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0, lineHeight: 1.7, fontFamily: 'var(--mono)' }}>
            O CastLink para celular está em desenvolvimento. Por enquanto, use um PC ou notebook para transmitir.
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 14, padding: '18px 20px', width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 1 }}>para transmitir use</span>
          {[
            { icon: '💻', label: 'Chrome no PC ou Mac' },
            { icon: '🪟', label: 'Edge no Windows' },
            { icon: '🦊', label: 'Firefox no desktop' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>{item.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}