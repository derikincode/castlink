import React, { useState } from 'react'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'

export default function App() {
  const [mode, setMode] = useState('sender')

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '4rem',
        position: 'relative',
      }}
    >
      {/* Grid background */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Glow blob */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 860,
          padding: '0 1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '2.5rem 0 2rem',
            animation: 'fadeUp 0.4s ease both',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              background: 'var(--accent)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'glow 3s ease-in-out infinite',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z" />
              <polygon points="17,14 17,20 22,17" />
            </svg>
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.5px',
                lineHeight: 1,
              }}
            >
              CastLink
            </h1>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text3)',
                fontFamily: 'var(--mono)',
              }}
            >
              WebRTC · P2P · Zero Relay
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {['WebRTC', 'P2P', 'React'].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--mono)',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border2)',
                  color: 'var(--text3)',
                  padding: '3px 8px',
                  borderRadius: 5,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Mode tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: '1.5rem',
            animation: 'fadeUp 0.4s 0.05s ease both',
          }}
        >
          {[
            { id: 'sender', icon: '🖥️', label: 'Transmitir', desc: 'Este PC → outro dispositivo' },
            { id: 'receiver', icon: '📺', label: 'Receber', desc: 'TV / outro dispositivo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              style={{
                padding: '1.3rem 1.4rem',
                background:
                  mode === tab.id ? 'rgba(79,70,229,0.1)' : 'var(--surface)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                border: 'none',
                color: 'var(--text)',
                fontFamily: 'var(--sans)',
                textAlign: 'left',
                transition: 'background 0.15s',
                borderBottom:
                  mode === tab.id
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: mode === tab.id ? 'var(--accent-light)' : 'var(--text)',
                }}
              >
                {tab.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text3)',
                  fontFamily: 'var(--mono)',
                }}
              >
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '1.5rem',
            animation: 'fadeUp 0.35s 0.1s ease both',
            marginBottom: '1.5rem',
          }}
        >
          {mode === 'sender' ? <Sender /> : <Receiver />}
        </div>

        {/* Info footer */}
        <div
          style={{
            background: 'rgba(79,70,229,0.05)',
            border: '1px solid rgba(79,70,229,0.15)',
            borderRadius: 10,
            padding: '14px 18px',
            fontSize: 12,
            color: 'var(--text3)',
            fontFamily: 'var(--mono)',
            lineHeight: 1.8,
            animation: 'fadeUp 0.35s 0.15s ease both',
          }}
        >
          ℹ️ A conexão é <strong style={{ color: 'var(--text2)' }}>direta entre os dispositivos</strong> (P2P via WebRTC).
          Nenhum vídeo passa por servidor. O PeerJS é usado apenas para trocar metadados de handshake.
          Os dois dispositivos precisam de acesso à internet para a sinalização inicial.
        </div>

        {/* How it works */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginTop: '1.5rem',
            animation: 'fadeUp 0.35s 0.2s ease both',
          }}
        >
          {[
            { n: '01', title: 'Gere o código', desc: 'PC transmissor cria sala com código único de 6 letras' },
            { n: '02', title: 'Digite no receptor', desc: 'TV ou tablet digita o código e inicia handshake WebRTC' },
            { n: '03', title: 'Stream P2P direto', desc: 'Vídeo vai direto entre os dois — sem servidor de mídia' },
          ].map((step) => (
            <div
              key={step.n}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--mono)',
                  color: 'var(--accent-light)',
                  opacity: 0.7,
                }}
              >
                {step.n}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{step.title}</span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text3)',
                  fontFamily: 'var(--mono)',
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
