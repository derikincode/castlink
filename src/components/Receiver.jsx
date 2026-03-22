import React, { useState, useRef, useCallback, useEffect } from 'react'
import { usePeer } from '../hooks/usePeer'
import { useRTCStats } from '../hooks/useRTCStats'
import { useLog } from '../hooks/useLog'
import { receiverPeerId, senderPeerId } from '../lib/rtc'
import { VideoFrame } from './VideoFrame'
import { StatsBar } from './StatsBar'
import { StatusDot } from './StatusDot'
import { LogPanel } from './LogPanel'

// Detecta se está numa TV (tela grande + sem mouse preciso)
function useIsTVMode() {
  const [tvMode, setTvMode] = useState(false)
  useEffect(() => {
    const check = () => {
      // TV: tela >= 1280px + pointer grosso (remote/touch)
      const bigScreen = window.innerWidth >= 1100
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches
      const veryBig = window.innerWidth >= 1600
      setTvMode(veryBig || (bigScreen && coarsePointer))
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return tvMode
}

export function Receiver() {
  const [inputCode, setInputCode] = useState('')
  const [status, setStatus] = useState('idle')
  const [joined, setJoined] = useState(false)
  const [hasStream, setHasStream] = useState(false)
  const [autoFullscreen, setAutoFullscreen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const remoteVideoRef = useRef(null)
  const pcRef = useRef(null)
  const destroyRef = useRef(null)

  const { entries, append, reset } = useLog()
  const stats = useRTCStats(pcRef, hasStream)
  const isTVMode = useIsTVMode()

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
    if (el.requestFullscreen) el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen()
  }, [])

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen()
  }, [])

  const handleCall = useCallback(
    (call) => {
      append('recebendo chamada do transmissor...', 'info')
      call.answer()

      call.on('stream', (remoteStream) => {
        const v = remoteVideoRef.current
        if (v) {
          v.srcObject = remoteStream
          // Garante play mesmo em contextos restritivos
          v.play().catch(() => {})
        }
        setHasStream(true)
        setStatus('connected')
        append('stream recebido!', 'ok')
        pcRef.current = call.peerConnection

        // Auto fullscreen em TV mode
        if (autoFullscreen) {
          setTimeout(goFullscreen, 500)
        }
      })

      call.on('error', (e) => {
        append(`erro na chamada: ${e}`, 'err')
        setStatus('error')
      })

      call.peerConnection.oniceconnectionstatechange = () => {
        const s = call.peerConnection.iceConnectionState
        if (s === 'disconnected' || s === 'failed' || s === 'closed') {
          setStatus('idle')
          setHasStream(false)
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
          append('transmissor desconectou')
          if (document.fullscreenElement) document.exitFullscreen()
        }
      }
    },
    [append, autoFullscreen, goFullscreen]
  )

  const joinRoom = () => {
    const code = inputCode.trim().toUpperCase()
    if (code.length !== 6) { append('código deve ter 6 caracteres', 'err'); return }
    setStatus('connecting')
    setJoined(true)
    append(`conectando à sala ${code}...`, 'info')
  }

  const { peerRef, destroy } = usePeer({
    peerId: joined ? receiverPeerId(inputCode.trim().toUpperCase()) : null,
    onReady: () => {
      const code = inputCode.trim().toUpperCase()
      append('conectado ao servidor de sinalização', 'ok')
      const dc = peerRef.current?.connect(senderPeerId(code))
      if (dc) {
        dc.on('open', () => { dc.send({ type: 'ready' }); append('aguardando stream...', 'info') })
        dc.on('error', () => { append('transmissor não encontrado — verifique o código', 'err'); setStatus('error') })
      }
    },
    onError: (err) => {
      append(`erro: ${err.type} — verifique o código`, 'err')
      setStatus('error')
      setJoined(false)
    },
    onCall: handleCall,
  })

  destroyRef.current = destroy

  const leaveRoom = useCallback(() => {
    destroyRef.current?.()
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    if (document.fullscreenElement) document.exitFullscreen()
    setJoined(false); setHasStream(false); setStatus('idle')
    setInputCode(''); pcRef.current = null
    reset('desconectado')
  }, [reset])

  // Handle individual digit input for TV mode (easier with remote)
  const digits = inputCode.split('').concat(Array(6).fill('')).slice(0, 6)

  const fontSize = isTVMode ? 18 : 13

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isTVMode ? 24 : 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: fontSize, fontWeight: 600 }}>receptor</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusDot status={status} />
          <span style={{ fontSize: isTVMode ? 14 : 11, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
            {status === 'idle' && 'aguardando'}
            {status === 'connecting' && 'conectando...'}
            {status === 'connected' && 'recebendo stream'}
            {status === 'error' && 'erro'}
          </span>
        </div>
      </div>

      {/* Code input — TV mode shows big digit boxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ fontSize: isTVMode ? 14 : 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          código da sala (6 letras/números)
        </label>

        {isTVMode ? (
          /* TV: large single input centered */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="XXXXXX"
              disabled={joined}
              autoCapitalize="characters"
              style={{
                ...inputBase,
                fontSize: 36,
                letterSpacing: 14,
                padding: '18px 24px',
                width: 320,
                height: 80,
              }}
            />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {!joined
                ? <button onClick={joinRoom} style={{ ...btnPrimary, fontSize: 16, padding: '16px 32px', borderRadius: 12 }}>conectar</button>
                : <button onClick={leaveRoom} style={{ ...btnDanger, fontSize: 16, padding: '16px 32px', borderRadius: 12 }}>desconectar</button>
              }
              {hasStream && !isFullscreen && (
                <button onClick={goFullscreen} style={{ ...btnGhost, fontSize: 16, padding: '16px 28px', borderRadius: 12 }}>
                  ⛶ tela cheia
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Desktop: compact row */
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="XXXXXX"
              disabled={joined}
              style={{ ...inputBase, fontSize: 22, letterSpacing: 6, width: 190, padding: '10px 14px' }}
            />
            {!joined
              ? <button onClick={joinRoom} style={btnPrimary}>conectar</button>
              : <button onClick={leaveRoom} style={btnDanger}>desconectar</button>
            }
          </div>
        )}
      </div>

      {/* Auto fullscreen toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <div
          onClick={() => setAutoFullscreen((v) => !v)}
          style={{
            width: isTVMode ? 44 : 36,
            height: isTVMode ? 24 : 20,
            background: autoFullscreen ? 'var(--accent)' : 'var(--surface3)',
            borderRadius: 99,
            position: 'relative',
            transition: 'background 0.2s',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <div style={{
            position: 'absolute',
            top: isTVMode ? 3 : 2,
            left: autoFullscreen ? (isTVMode ? 23 : 18) : (isTVMode ? 3 : 2),
            width: isTVMode ? 18 : 16,
            height: isTVMode ? 18 : 16,
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.2s',
          }} />
        </div>
        <span style={{ fontSize: isTVMode ? 14 : 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
          fullscreen automático ao receber stream
        </span>
      </label>

      {/* Remote video */}
      <VideoFrame
        ref={remoteVideoRef}
        hasStream={hasStream}
        placeholderText="aguardando transmissão..."
        type="remote"
        onFullscreen={!isFullscreen ? goFullscreen : undefined}
        tvMode={isTVMode}
      />

      {hasStream && <StatsBar stats={stats} videoEl={remoteVideoRef.current} tvMode={isTVMode} />}
      <LogPanel entries={entries} />
    </div>
  )
}

const inputBase = {
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 8,
  color: 'var(--text)',
  fontFamily: 'var(--mono)',
  fontWeight: 700,
  outline: 'none',
}

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '11px 20px', borderRadius: 10,
  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff',
}

const btnDanger = {
  ...btnPrimary,
  background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--red)',
}

const btnGhost = {
  ...btnPrimary,
  background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)',
}