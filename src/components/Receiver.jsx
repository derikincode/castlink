import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useRTCStats } from '../hooks/useRTCStats'
import { useLog } from '../hooks/useLog'
import { VideoFrame } from './VideoFrame'
import { StatsBar } from './StatsBar'
import { StatusDot } from './StatusDot'
import { LogPanel } from './LogPanel'

/**
 * Receiver — recebe peerRef/connRef/callRef/pcRef do useHandshake.
 * Aguarda a chamada de mídia do sender e exibe o stream.
 */
export function Receiver({ peerRef, connRef, callRef, pcRef, isTVMode, onReset }) {
  const [status, setStatus]       = useState('waiting')
  const [hasStream, setHasStream] = useState(false)
  const [autoFullscreen, setAutoFullscreen] = useState(true)
  const [isFullscreen, setIsFullscreen]     = useState(false)

  const remoteVideoRef = useRef(null)
  const internalPCRef  = useRef(null)

  const { entries, append } = useLog()
  const stats = useRTCStats(internalPCRef, hasStream)

  // Track fullscreen changes
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
    const v = remoteVideoRef.current
    if (!v) return
    const el = v.requestFullscreen ? v : document.documentElement
    ;(el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen).call(el)
  }, [])

  // Register incoming call handler on peerRef
  useEffect(() => {
    const peer = peerRef?.current
    if (!peer) return

    append('aguardando stream do transmissor...', 'info')

    const handleCall = (call) => {
      append('recebendo chamada...', 'info')
      call.answer()
      callRef && (callRef.current = call)

      call.on('stream', (remoteStream) => {
        const v = remoteVideoRef.current
        if (v) { v.srcObject = remoteStream; v.play().catch(() => {}) }
        setHasStream(true)
        setStatus('receiving')
        append('stream recebido!', 'ok')
        internalPCRef.current = call.peerConnection
        if (pcRef) pcRef.current = call.peerConnection
        if (autoFullscreen) setTimeout(goFullscreen, 500)
      })

      call.on('error', (e) => { append(`erro: ${e}`, 'err'); setStatus('error') })

      call.peerConnection.oniceconnectionstatechange = () => {
        const s = call.peerConnection.iceConnectionState
        if (s === 'disconnected' || s === 'failed' || s === 'closed') {
          setStatus('waiting'); setHasStream(false)
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
          if (document.fullscreenElement) document.exitFullscreen()
          append('transmissor desconectou')
        }
      }
    }

    peer.on('call', handleCall)
    return () => { try { peer.off('call', handleCall) } catch {} }
  }, [peerRef?.current, autoFullscreen, goFullscreen]) // eslint-disable-line

  const fs = isTVMode ? 16 : 13

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div aria-hidden style={{
        position: 'fixed', inset: 0,
        backgroundImage: `linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)`,
        backgroundSize: '44px 44px', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: isTVMode ? '2rem 2.5rem' : '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: isTVMode ? 24 : 16, position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </div>
            <span style={{ fontSize: isTVMode ? 20 : 16, fontWeight: 700 }}>CastLink</span>
            <span style={{ fontSize: isTVMode ? 13 : 11, fontFamily: 'var(--mono)', color: 'var(--green)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '3px 10px', borderRadius: 99 }}>receptor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusDot status={status === 'receiving' ? 'connected' : status === 'waiting' ? 'connecting' : 'error'} />
            <span style={{ fontSize: isTVMode ? 14 : 11, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
              {status === 'waiting' && 'aguardando stream'}
              {status === 'receiving' && 'recebendo'}
              {status === 'error' && 'erro'}
            </span>
            <button onClick={onReset} style={{ fontSize: isTVMode ? 13 : 11, fontFamily: 'var(--mono)', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text3)', padding: isTVMode ? '8px 16px' : '5px 12px', borderRadius: 8, cursor: 'pointer' }}>
              ✕ sair
            </button>
          </div>
        </div>

        {/* Auto fullscreen toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
          <div onClick={() => setAutoFullscreen(v => !v)} style={{
            width: isTVMode ? 44 : 36, height: isTVMode ? 24 : 20,
            background: autoFullscreen ? 'var(--accent)' : 'var(--surface3)',
            borderRadius: 99, position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', top: isTVMode ? 3 : 2,
              left: autoFullscreen ? (isTVMode ? 23 : 18) : (isTVMode ? 3 : 2),
              width: isTVMode ? 18 : 16, height: isTVMode ? 18 : 16,
              background: '#fff', borderRadius: '50%', transition: 'left 0.2s',
            }} />
          </div>
          <span style={{ fontSize: isTVMode ? 14 : 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
            fullscreen automático ao receber stream
          </span>
        </label>

        {/* Video */}
        <VideoFrame
          ref={remoteVideoRef}
          hasStream={hasStream}
          placeholderText={status === 'waiting' ? 'aguardando transmissor iniciar...' : 'stream encerrado'}
          type="remote"
          onFullscreen={!isFullscreen && hasStream ? goFullscreen : undefined}
          tvMode={isTVMode}
        />

        {hasStream && <StatsBar stats={stats} videoEl={remoteVideoRef.current} tvMode={isTVMode} />}

        {/* Fullscreen button if not already in fs */}
        {hasStream && !isFullscreen && (
          <button onClick={goFullscreen} style={{
            alignSelf: 'flex-start',
            padding: isTVMode ? '14px 28px' : '11px 20px',
            borderRadius: 10, fontFamily: 'var(--sans)',
            fontSize: fs, fontWeight: 600, cursor: 'pointer',
            border: 'none', background: 'var(--accent)', color: '#fff',
          }}>
            ⛶ {isTVMode ? 'abrir em tela cheia' : 'fullscreen'}
          </button>
        )}

        <LogPanel entries={entries} />
      </div>
    </div>
  )
}