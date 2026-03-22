import React from 'react'
import { QRCode } from './QRCode'

export function TVScreen({ code, phase, onReset }) {
  const joinUrl = `${window.location.origin}${window.location.pathname}?join=${code}`
  const waiting = phase === 'connecting'

  return (
    <div style={{
      height: '100vh',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      padding: '28px 48px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* bg grid */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px',
        pointerEvents: 'none',
      }} />

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z"/>
              <polygon points="17,14 17,20 22,17"/>
            </svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>CastLink</span>
          <span style={{
            fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)',
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            padding: '2px 8px', borderRadius: 5,
          }}>TV</span>
        </div>

        {/* Status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 99, padding: '6px 16px',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: waiting ? 'var(--amber)' : 'var(--green)',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
            {waiting ? 'conectando...' : `sala ${code} aberta`}
          </span>
        </div>
      </div>

      {/* Center content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 72,
        position: 'relative',
        zIndex: 1,
      }}>

        {/* QR Code */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 20,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <QRCode value={joinUrl} size={220} />
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            escanear com celular ou PC
          </span>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 1, height: 50, background: 'var(--border2)' }} />
          <span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>ou</span>
          <div style={{ width: 1, height: 50, background: 'var(--border2)' }} />
        </div>

        {/* Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{
            fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
            textTransform: 'uppercase', letterSpacing: '2px',
          }}>
            código da sala
          </span>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{
              fontSize: 80, fontWeight: 800, letterSpacing: 10,
              fontFamily: 'var(--mono)', color: 'var(--text)', lineHeight: 1,
            }}>
              {code.slice(0, 3)}
            </span>
            <span style={{ fontSize: 40, color: 'var(--text3)', lineHeight: 1, marginBottom: 4 }}>·</span>
            <span style={{
              fontSize: 80, fontWeight: 800, letterSpacing: 10,
              fontFamily: 'var(--mono)', color: 'var(--text)', lineHeight: 1,
            }}>
              {code.slice(3)}
            </span>
          </div>

          <span style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            abra o app no outro dispositivo → "Conectar"
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
        <button onClick={onReset} style={{
          fontSize: 12, fontFamily: 'var(--mono)',
          background: 'transparent', border: '1px solid var(--border2)',
          color: 'var(--text3)', padding: '8px 16px', borderRadius: 8,
          cursor: 'pointer',
        }}>
          ↺ novo código
        </button>
      </div>
    </div>
  )
}