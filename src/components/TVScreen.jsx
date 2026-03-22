import React, { useEffect } from 'react'
import { QRCode } from './QRCode'

/**
 * TVScreen
 * Exibida quando deviceType === 'tv' e phase === 'idle' | 'connecting'
 * Mostra QR code e código para o usuário escanear com o celular/PC
 */
export function TVScreen({ code, phase, onReset }) {
  // URL que o outro dispositivo vai abrir — leva direto ao código
  const joinUrl = `${window.location.origin}${window.location.pathname}?join=${code}`

  const waiting = phase === 'connecting'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
        padding: '3rem',
        position: 'relative',
      }}
    >
      {/* background grid */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'absolute', top: 40, left: 48 }}>
        <div style={{
          width: 44, height: 44, background: 'var(--accent)',
          borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z"/>
            <polygon points="17,14 17,20 22,17"/>
          </svg>
        </div>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>CastLink</span>
        <span style={{
          fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)',
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          padding: '3px 10px', borderRadius: 6,
        }}>TV</span>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, position: 'relative', zIndex: 1 }}>

        {/* Instruction */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            {waiting ? 'Aguardando conexão...' : 'Pronto para receber'}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text2)', margin: 0, fontFamily: 'var(--mono)' }}>
            {waiting
              ? 'Outro dispositivo está se conectando'
              : 'Escaneie o QR code ou digite o código no outro dispositivo'
            }
          </p>
        </div>

        {/* QR + Code side by side */}
        <div style={{ display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>

          {/* QR Code */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border2)',
            borderRadius: 24,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            opacity: waiting ? 0.5 : 1,
            transition: 'opacity 0.3s',
          }}>
            <QRCode value={joinUrl} size={240} />
            <span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              escanear com celular ou PC
            </span>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 1, height: 60, background: 'var(--border2)' }} />
            <span style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>ou</span>
            <div style={{ width: 1, height: 60, background: 'var(--border2)' }} />
          </div>

          {/* Manual code */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
            opacity: waiting ? 0.5 : 1, transition: 'opacity 0.3s',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 2 }}>
                código da sala
              </span>
              {/* Big code — split in 2 groups of 3 for readability */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{
                  fontSize: 72,
                  fontWeight: 800,
                  letterSpacing: 12,
                  fontFamily: 'var(--mono)',
                  color: 'var(--text)',
                  lineHeight: 1,
                }}>
                  {code.slice(0, 3)}
                </span>
                <span style={{ fontSize: 36, color: 'var(--text3)', lineHeight: 1 }}>·</span>
                <span style={{
                  fontSize: 72,
                  fontWeight: 800,
                  letterSpacing: 12,
                  fontFamily: 'var(--mono)',
                  color: 'var(--text)',
                  lineHeight: 1,
                }}>
                  {code.slice(3)}
                </span>
              </div>
              <span style={{ fontSize: 16, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                castlink.app → aba "Conectar"
              </span>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: waiting ? 'var(--amber)' : 'var(--green)',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 15, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
            {waiting ? 'conectando...' : `sala ${code} aberta`}
          </span>
        </div>

      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        style={{
          position: 'absolute', bottom: 40, right: 48,
          fontSize: 14, fontFamily: 'var(--mono)',
          background: 'transparent', border: '1px solid var(--border2)',
          color: 'var(--text3)', padding: '10px 20px', borderRadius: 10,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        ↺ novo código
      </button>
    </div>
  )
}