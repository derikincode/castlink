import React, { useState, useEffect } from 'react'

/**
 * PCScreen
 * Exibida quando deviceType === 'pc' e phase === 'idle' | 'connecting' | 'error'
 * - Lê ?join=CÓDIGO da URL (quando veio do QR code) e conecta automaticamente
 * - Ou mostra input manual
 */
export function PCScreen({ phase, error, onJoin, onReset }) {
  const [inputCode, setInputCode] = useState('')
  const [autoJoined, setAutoJoined] = useState(false)

  // Auto-fill from URL query param ?join=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const joinCode = params.get('join')
    if (joinCode && joinCode.length === 6 && !autoJoined) {
      setInputCode(joinCode.toUpperCase())
      setAutoJoined(true)
      onJoin(joinCode.toUpperCase())
      // Clean the URL without reload
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, []) // eslint-disable-line

  const handleJoin = () => {
    const code = inputCode.trim().toUpperCase()
    if (code.length !== 6) return
    onJoin(code)
  }

  const isConnecting = phase === 'connecting'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
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

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 40, zIndex: 1, width: '100%', maxWidth: 500, padding: '2rem',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, background: 'var(--accent)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z"/>
              <polygon points="17,14 17,20 22,17"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>CastLink</span>
        </div>

        {/* Card */}
        <div style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          animation: 'fadeUp 0.3s ease both',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              {isConnecting ? 'Conectando...' : 'Conectar a uma sala'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0, fontFamily: 'var(--mono)' }}>
              {isConnecting
                ? `aguardando sala ${inputCode}`
                : 'Digite o código exibido na TV ou outro dispositivo'
              }
            </p>
          </div>

          {/* Code input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 1 }}>
              código da sala
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              maxLength={6}
              placeholder="ABC123"
              disabled={isConnecting}
              autoFocus
              autoCapitalize="characters"
              style={{
                background: 'var(--surface2)',
                border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : 'var(--border2)'}`,
                borderRadius: 10,
                padding: '14px 18px',
                color: 'var(--text)',
                fontSize: 28,
                fontFamily: 'var(--mono)',
                fontWeight: 800,
                letterSpacing: 8,
                outline: 'none',
                width: '100%',
                textTransform: 'uppercase',
                transition: 'border-color 0.15s',
                opacity: isConnecting ? 0.6 : 1,
              }}
            />
            {error && (
              <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--mono)' }}>
                ✕ {error}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isConnecting ? (
              <button
                onClick={handleJoin}
                disabled={inputCode.length !== 6}
                style={{
                  flex: 1, padding: '13px 0', borderRadius: 10,
                  fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
                  cursor: inputCode.length !== 6 ? 'not-allowed' : 'pointer',
                  border: 'none',
                  background: inputCode.length === 6 ? 'var(--accent)' : 'var(--surface2)',
                  color: inputCode.length === 6 ? '#fff' : 'var(--text3)',
                  transition: 'all 0.15s',
                }}
              >
                Conectar
              </button>
            ) : (
              <button
                onClick={onReset}
                style={{
                  flex: 1, padding: '13px 0', borderRadius: 10,
                  fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                  background: 'rgba(244,63,94,0.1)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  color: 'var(--red)',
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Connecting spinner */}
        {isConnecting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 16, height: 16,
              border: '2px solid var(--border2)',
              borderTop: '2px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
              procurando sala {inputCode}...
            </span>
          </div>
        )}

        {/* Info */}
        <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', textAlign: 'center', lineHeight: 1.7, margin: 0 }}>
          O código aparece na TV.<br/>
          Você pode escanear o QR code para conectar automaticamente.
        </p>
      </div>
    </div>
  )
}