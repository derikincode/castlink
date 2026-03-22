import React, { useState, useRef, useCallback, useEffect } from 'react'
import { usePeer } from '../hooks/usePeer'
import { useRTCStats } from '../hooks/useRTCStats'
import { useLog } from '../hooks/useLog'
import { generateCode, senderPeerId, receiverPeerId } from '../lib/rtc'
import { RoomCode } from './RoomCode'
import { VideoFrame } from './VideoFrame'
import { StatsBar } from './StatsBar'
import { StatusDot } from './StatusDot'
import { LogPanel } from './LogPanel'

export function Sender() {
  const [code, setCode] = useState(() => generateCode())
  const [status, setStatus] = useState('idle')
  const [sharing, setSharing] = useState(false)
  const [hasStream, setHasStream] = useState(false)

  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const pcRef = useRef(null)
  const currentCallRef = useRef(null)

  const { entries, append, reset } = useLog()
  const stats = useRTCStats(pcRef, sharing)

  const peerId = senderPeerId(code)

  const makeCall = useCallback(
    (peerRef) => {
      if (!localStreamRef.current || !peerRef.current) return
      const targetId = receiverPeerId(code)
      append(`ligando para receptor...`, 'info')
      const call = peerRef.current.call(targetId, localStreamRef.current)
      currentCallRef.current = call

      call.peerConnection.oniceconnectionstatechange = () => {
        const s = call.peerConnection.iceConnectionState
        if (s === 'connected' || s === 'completed') {
          setStatus('connected')
          append('conexão P2P estabelecida!', 'ok')
          pcRef.current = call.peerConnection
        }
        if (s === 'disconnected' || s === 'failed' || s === 'closed') {
          setStatus('idle')
          append('receptor desconectou')
        }
      }
    },
    [code, append]
  )

  const { peerRef } = usePeer({
    peerId,
    onReady: () => {
      setStatus('idle')
      append(`sala ${code} aberta`, 'ok')
    },
    onError: (err) => {
      append(`erro: ${err.type}`, 'err')
      setStatus('error')
    },
    onConnection: (conn) => {
      append('receptor entrou na sala', 'info')
      setStatus('connecting')
      conn.on('data', (d) => {
        if (d?.type === 'ready') makeCall(peerRef)
      })
    },
  })

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 60, max: 60 }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      setSharing(true)
      setHasStream(true)
      append('tela capturada com sucesso', 'ok')

      stream.getVideoTracks()[0].onended = stopSharing
    } catch (e) {
      append(`erro ao capturar tela: ${e.message}`, 'err')
    }
  }

  const stopSharing = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    setSharing(false)
    setHasStream(false)
    setStatus('idle')
    append('transmissão encerrada')
  }, [append])

  const refreshCode = () => {
    stopSharing()
    const newCode = generateCode()
    setCode(newCode)
    reset(`sala ${newCode} aberta`, 'ok')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>transmissor</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusDot status={status} />
          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
            {status === 'idle' && 'aguardando'}
            {status === 'connecting' && 'conectando...'}
            {status === 'connected' && 'transmitindo'}
            {status === 'error' && 'erro'}
          </span>
        </div>
      </div>

      <RoomCode code={code} onRefresh={refreshCode} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!sharing ? (
          <button onClick={startSharing} style={btnPrimary}>
            ▶ compartilhar tela
          </button>
        ) : (
          <button onClick={stopSharing} style={btnDanger}>
            ⬛ parar transmissão
          </button>
        )}
      </div>

      {/* Video preview */}
      <VideoFrame
        ref={localVideoRef}
        hasStream={hasStream}
        placeholderText="pré-visualização local"
        type="screen"
        muted
      />

      {sharing && <StatsBar stats={stats} videoEl={localVideoRef.current} />}

      <LogPanel entries={entries} />
    </div>
  )
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
  transition: 'opacity 0.15s',
}

const btnDanger = {
  ...btnPrimary,
  background: 'rgba(244,63,94,0.1)',
  border: '1px solid rgba(244,63,94,0.3)',
  color: 'var(--red)',
}
