import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useRTCStats } from '../hooks/useRTCStats'
import { useLog } from '../hooks/useLog'
import { VideoFrame } from './VideoFrame'
import { StatsBar } from './StatsBar'
import { StatusDot } from './StatusDot'
import { LogPanel } from './LogPanel'

export function Receiver({ peerRef, connRef, callRef, pcRef, isTVMode, onReset }) {
  const [status, setStatus]             = useState('waiting')
  const [hasStream, setHasStream]       = useState(false)
  const [needsPlay, setNeedsPlay]       = useState(false) // autoplay bloqueado
  const [autoFullscreen, setAutoFullscreen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const remoteVideoRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const internalPCRef  = useRef(null)

  const { entries, append } = useLog()
  const stats = useRTCStats(internalPCRef, hasStream)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  const goFullscreen = useCallback(() => {
    const el = document.documentElement
    ;(el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen)?.call(el)
  }, [])

  const forcePlay = useCallback(() => {
    const v = remoteVideoRef.current
    if (!v) return
    if (remoteStreamRef.current) v.srcObject = remoteStreamRef.current
    v.play()
      .then(() => {
        setNeedsPlay(false)
        setHasStream(true)
        setStatus('receiving')
        if (autoFullscreen) setTimeout(goFullscreen, 300)
      })
      .catch((e) => append(`erro ao tocar: ${e.message}`, 'err'))
  }, [autoFullscreen, goFullscreen, append])

  useEffect(() => {
    const peer = peerRef?.current
    if (!peer) return
    append('aguardando stream...', 'info')

    const handleCall = (call) => {
      append('recebendo chamada...', 'info')
      call.answer()
      if (callRef) callRef.current = call

      call.on('stream', (remoteStream) => {
        remoteStreamRef.current = remoteStream
        const v = remoteVideoRef.current
        if (v) {
          v.srcObject = remoteStream
          v.play()
            .then(() => {
              setNeedsPlay(false)
              setHasStream(true)
              setStatus('receiving')
              append('stream recebido!', 'ok')
              if (autoFullscreen) setTimeout(goFullscreen, 500)
            })
            .catch(() => {
              // Autoplay bloqueado — pede interação do usuário
              setNeedsPlay(true)
              setStatus('receiving')
              append('clique em ▶ para iniciar', 'info')
            })
        }
        internalPCRef.current = call.peerConnection
        if (pcRef) pcRef.current = call.peerConnection
      })

      call.on('error', (e) => { append(`erro: ${e}`, 'err'); setStatus('error') })

      call.peerConnection.oniceconnectionstatechange = () => {
        const s = call.peerConnection.iceConnectionState
        if (s === 'disconnected' || s === 'failed' || s === 'closed') {
          setStatus('waiting'); setHasStream(false); setNeedsPlay(false)
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
          if (document.fullscreenElement) document.exitFullscreen()
          append('transmissor desconectou')
        }
      }
    }

    peer.on('call', handleCall)
    return () => { try { peer.off('call', handleCall) } catch {} }
  }, [peerRef?.current, autoFullscreen, goFullscreen]) // eslint-disable-line

  // ── TV MODE ──────────────────────────────────────────────────────────
  if (isTVMode) {
    return (
      <div style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr auto', padding: '28px 48px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)`, backgroundSize: '44px 44px', pointerEvents: 'none' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'var(--green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800 }}>CastLink</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--green)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '2px 10px', borderRadius: 99 }}>receptor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 99, padding: '6px 16px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'receiving' ? 'var(--green)' : 'var(--amber)', animation: 'pulse 1.4s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
                {status === 'waiting' ? 'aguardando transmissão' : 'recebendo stream'}
              </span>
            </div>
            <button onClick={onReset} style={{ fontSize: 12, fontFamily: 'var(--mono)', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text3)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>✕ sair</button>
          </div>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {/* Vídeo — sempre montado para receber o stream */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            style={{
              width: '100%', maxHeight: '70vh',
              objectFit: 'contain', borderRadius: 12,
              display: hasStream && !needsPlay ? 'block' : 'none',
            }}
          />

          {/* Aguardando */}
          {status === 'waiting' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
              <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.2)', animation: 'pulse 2s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.35)', animation: 'pulse 2s 0.3s ease-in-out infinite' }} />
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--green)"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>Aguardando transmissão</div>
                <div style={{ fontSize: 15, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 8 }}>Inicie o compartilhamento no outro dispositivo</div>
              </div>
            </div>
          )}

          {/* Autoplay bloqueado — botão grande para tocar */}
          {needsPlay && (
            <button
              onClick={forcePlay}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: '2rem',
              }}
            >
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 60px rgba(79,70,229,0.4)',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Toque para reproduzir</span>
              <span style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>o stream chegou — clique para iniciar</span>
            </button>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          {hasStream ? <StatsBar stats={stats} videoEl={remoteVideoRef.current} tvMode /> : <div />}
          {hasStream && !isFullscreen && !needsPlay && (
            <button onClick={goFullscreen} style={{ fontSize: 13, fontFamily: 'var(--mono)', background: 'var(--accent)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
              ⛶ tela cheia
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── PC MODE ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)`, backgroundSize: '44px 44px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'var(--green)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>CastLink</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--green)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '2px 8px', borderRadius: 99 }}>receptor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusDot status={status === 'receiving' ? 'connected' : 'connecting'} />
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
              {status === 'waiting' ? 'aguardando stream' : 'recebendo'}
            </span>
            <button onClick={onReset} style={{ fontSize: 11, fontFamily: 'var(--mono)', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text3)', padding: '5px 10px', borderRadius: 7, cursor: 'pointer', marginLeft: 4 }}>✕ sair</button>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
          <div onClick={() => setAutoFullscreen(v => !v)} style={{ width: 34, height: 19, background: autoFullscreen ? 'var(--accent)' : 'var(--surface3)', borderRadius: 99, position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, left: autoFullscreen ? 17 : 2, width: 15, height: 15, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>fullscreen automático</span>
        </label>

        {/* Vídeo sempre montado */}
        <div style={{ position: 'relative' }}>
          <VideoFrame ref={remoteVideoRef} hasStream={hasStream && !needsPlay} placeholderText="aguardando transmissor iniciar..." type="remote" onFullscreen={!isFullscreen && hasStream && !needsPlay ? goFullscreen : undefined} />
          {needsPlay && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', borderRadius: 10 }}>
              <button onClick={forcePlay} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Clique para reproduzir</span>
              </button>
            </div>
          )}
        </div>

        {hasStream && !needsPlay && <StatsBar stats={stats} videoEl={remoteVideoRef.current} />}
        {hasStream && !isFullscreen && !needsPlay && (
          <button onClick={goFullscreen} style={{ alignSelf: 'flex-start', padding: '10px 18px', borderRadius: 10, fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff' }}>
            ⛶ fullscreen
          </button>
        )}
        <LogPanel entries={entries} />
      </div>
    </div>
  )
}