import React, { useState, useRef, useCallback } from 'react'
import { usePeer } from '../hooks/usePeer'
import { useRTCStats } from '../hooks/useRTCStats'
import { useLog } from '../hooks/useLog'
import { generateCode, receiverPeerId, senderPeerId } from '../lib/rtc'
import { VideoFrame } from './VideoFrame'
import { StatsBar } from './StatsBar'
import { StatusDot } from './StatusDot'
import { LogPanel } from './LogPanel'

export function Receiver() {
  const [inputCode, setInputCode] = useState('')
  const [status, setStatus] = useState('idle')
  const [joined, setJoined] = useState(false)
  const [hasStream, setHasStream] = useState(false)

  const remoteVideoRef = useRef(null)
  const pcRef = useRef(null)
  const peerIdRef = useRef(null)
  const destroyRef = useRef(null)

  const { entries, append, reset } = useLog()
  const stats = useRTCStats(pcRef, hasStream)

  const handleCall = useCallback(
    (call) => {
      append('recebendo chamada do transmissor...', 'info')
      call.answer()

      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
        setHasStream(true)
        setStatus('connected')
        append('stream recebido!', 'ok')
        pcRef.current = call.peerConnection
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
        }
      }
    },
    [append]
  )

  const joinRoom = () => {
    const code = inputCode.trim().toUpperCase()
    if (code.length !== 6) {
      append('código deve ter 6 caracteres', 'err')
      return
    }

    const pid = receiverPeerId(code)
    peerIdRef.current = pid
    setStatus('connecting')
    setJoined(true)
    append(`conectando à sala ${code}...`, 'info')
  }

  const { peerRef, destroy } = usePeer({
    peerId: joined ? receiverPeerId(inputCode.trim().toUpperCase()) : null,
    onReady: () => {
      const code = inputCode.trim().toUpperCase()
      append('conectado ao servidor de sinalização', 'ok')

      // notify sender via data channel
      const dc = peerRef.current?.connect(senderPeerId(code))
      if (dc) {
        dc.on('open', () => {
          dc.send({ type: 'ready' })
          append('aguardando stream do transmissor...', 'info')
        })
        dc.on('error', () => {
          append('transmissor não encontrado — verifique o código', 'err')
          setStatus('error')
        })
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
    setJoined(false)
    setHasStream(false)
    setStatus('idle')
    setInputCode('')
    pcRef.current = null
    reset('desconectado')
  }, [reset])

  const goFullscreen = () => {
    const v = remoteVideoRef.current
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen()
    else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen()
    else if (v.mozRequestFullScreen) v.mozRequestFullScreen()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>receptor</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusDot status={status} />
          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
            {status === 'idle' && 'aguardando'}
            {status === 'connecting' && 'conectando...'}
            {status === 'connected' && 'recebendo stream'}
            {status === 'error' && 'erro'}
          </span>
        </div>
      </div>

      {/* Code input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          código da sala (6 letras)
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="XXXXXX"
            disabled={joined}
            style={inputStyle}
          />
          {!joined ? (
            <button onClick={joinRoom} style={btnPrimary}>
              conectar
            </button>
          ) : (
            <button onClick={leaveRoom} style={btnDanger}>
              desconectar
            </button>
          )}
        </div>
      </div>

      {/* Remote video */}
      <VideoFrame
        ref={remoteVideoRef}
        hasStream={hasStream}
        placeholderText="aguardando transmissão..."
        type="remote"
        onFullscreen={goFullscreen}
      />

      {hasStream && <StatsBar stats={stats} videoEl={remoteVideoRef.current} />}

      <LogPanel entries={entries} />
    </div>
  )
}

const inputStyle = {
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: 20,
  fontFamily: 'var(--mono)',
  fontWeight: 700,
  letterSpacing: 5,
  width: 180,
  outline: 'none',
}

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '11px 20px',
  borderRadius: 10,
  fontFamily: 'var(--sans)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
}

const btnDanger = {
  ...btnPrimary,
  background: 'rgba(244,63,94,0.1)',
  border: '1px solid rgba(244,63,94,0.3)',
  color: 'var(--red)',
}
