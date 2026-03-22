import React from 'react'

/**
 * RolePicker
 * Aparece em AMBOS os dispositivos após o handshake.
 * O usuário escolhe: transmitir (sender) ou receber (receiver).
 * Quem escolhe primeiro envia { type: 'role' } ao peer,
 * que automaticamente pega o papel oposto.
 */
export function RolePicker({ onPick, peerDeviceType, isTVMode }) {
  const peerLabel = peerDeviceType === 'tv' ? 'TV' : peerDeviceType === 'pc' ? 'PC/celular' : 'outro dispositivo'

  const cardBase = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isTVMode ? 20 : 14,
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: isTVMode ? 24 : 16,
    padding: isTVMode ? '48px 56px' : '32px 40px',
    cursor: 'pointer',
    transition: 'all 0.18s',
    flex: 1,
    minWidth: isTVMode ? 280 : 200,
    maxWidth: isTVMode ? 380 : 300,
  }

  const handleHover = (e, entering) => {
    e.currentTarget.style.background = entering ? 'var(--surface2)' : 'var(--surface)'
    e.currentTarget.style.borderColor = entering ? 'rgba(79,70,229,0.5)' : 'var(--border2)'
    e.currentTarget.style.transform = entering ? 'translateY(-4px)' : 'translateY(0)'
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isTVMode ? 56 : 40,
      padding: '2rem',
      position: 'relative',
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

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 1 }}>
        {/* connected badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, margin: '0 auto',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 99, padding: '6px 16px',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
          <span style={{ fontSize: isTVMode ? 16 : 12, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
            conectado com {peerLabel}
          </span>
        </div>

        <h1 style={{ fontSize: isTVMode ? 42 : 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
          O que você quer fazer?
        </h1>
        <p style={{ fontSize: isTVMode ? 20 : 15, color: 'var(--text2)', margin: 0, fontFamily: 'var(--mono)' }}>
          Escolha o papel deste dispositivo
        </p>
      </div>

      {/* Role cards */}
      <div style={{
        display: 'flex',
        gap: isTVMode ? 32 : 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
        zIndex: 1,
      }}>
        {/* SENDER */}
        <div
          style={cardBase}
          onClick={() => onPick('sender')}
          onMouseEnter={(e) => handleHover(e, true)}
          onMouseLeave={(e) => handleHover(e, false)}
        >
          <div style={{
            width: isTVMode ? 80 : 60, height: isTVMode ? 80 : 60,
            background: 'rgba(79,70,229,0.12)',
            border: '1px solid rgba(79,70,229,0.3)',
            borderRadius: isTVMode ? 20 : 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={isTVMode ? 36 : 28} height={isTVMode ? 36 : 28} viewBox="0 0 24 24" fill="var(--accent-light)">
              <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h6l-2 3v1h8v-1l-2-3h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isTVMode ? 24 : 18, fontWeight: 700, marginBottom: 6 }}>Transmitir</div>
            <div style={{ fontSize: isTVMode ? 15 : 12, color: 'var(--text3)', fontFamily: 'var(--mono)', lineHeight: 1.5 }}>
              Compartilhar minha tela<br/>para o outro dispositivo
            </div>
          </div>
          <div style={{
            fontSize: isTVMode ? 13 : 11, fontFamily: 'var(--mono)',
            color: 'var(--accent-light)',
            background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)',
            padding: '4px 12px', borderRadius: 99,
          }}>
            sender
          </div>
        </div>

        {/* RECEIVER */}
        <div
          style={cardBase}
          onClick={() => onPick('receiver')}
          onMouseEnter={(e) => handleHover(e, true)}
          onMouseLeave={(e) => handleHover(e, false)}
        >
          <div style={{
            width: isTVMode ? 80 : 60, height: isTVMode ? 80 : 60,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: isTVMode ? 20 : 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={isTVMode ? 36 : 28} height={isTVMode ? 36 : 28} viewBox="0 0 24 24" fill="var(--green)">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isTVMode ? 24 : 18, fontWeight: 700, marginBottom: 6 }}>Receber</div>
            <div style={{ fontSize: isTVMode ? 15 : 12, color: 'var(--text3)', fontFamily: 'var(--mono)', lineHeight: 1.5 }}>
              Ver a tela do<br/>outro dispositivo aqui
            </div>
          </div>
          <div style={{
            fontSize: isTVMode ? 13 : 11, fontFamily: 'var(--mono)',
            color: 'var(--green)',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
            padding: '4px 12px', borderRadius: 99,
          }}>
            receiver
          </div>
        </div>
      </div>
    </div>
  )
}