import React, { useState, useRef, useCallback } from 'react'
import { usePeer } from '../hooks/usePeer'
import { useRTCStats } from '../hooks/useRTCStats'
import { useLog } from '../hooks/useLog'
import {
  generateCode,
  senderPeerId,
  receiverPeerId,
  QUALITY_PRESETS,
  applyMaxBitrate,
  preferHighQualityCodec,
} from '../lib/rtc'
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
  const [quality, setQuality] = useState('hd')

  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const pcRef = useRef(null)
  const qualityRef = useRef('hd')
  qualityRef.current = quality

  const { entries, append, reset } = useLog()
  const stats = useRTCStats(pcRef, sharing)

  const makeCall = useCallback(
    async (peerRef) => {
      if (!localStreamRef.current || !peerRef.current) return
      append('ligando para receptor...', 'info')

      const call = peerRef.current.call(receiverPeerId(code), localStreamRef.current)
      const pc = call.peerConnection
      pcRef.current = pc

      preferHighQualityCodec(pc)

      pc.oniceconnectionstatechange = async () => {
        const s = pc.iceConnectionState
        if (s === 'connected' || s === 'completed') {
          setStatus('connected')
          append('conexão P2P estabelecida!', 'ok')
          const preset = QUALITY_PRESETS[qualityRef.current]
          if (preset?.maxBitrate) {
            await applyMaxBitrate(pc, preset.maxBitrate)
            append(`bitrate forçado: ${Math.round(preset.maxBitrate / 1_000_000)} Mbps`, 'ok')
          }
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
    peerId: senderPeerId(code),
    onReady: () => { setStatus('idle'); append(`sala ${code} aberta`, 'ok') },
    onError: (err) => { append(`erro: ${err.type}`, 'err'); setStatus('error') },
    onConnection: (conn) => {
      append('receptor entrou na sala', 'info')
      setStatus('connecting')
      conn.on('data', (d) => { if (d?.type === 'ready') makeCall(peerRef) })
    },
  })

  const startSharing = async () => {
    try {
      const preset = QUALITY_PRESETS[quality]
      append(`capturando tela — ${preset.label}`, 'info')
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { ...preset.video, cursor: 'always', displaySurface: 'monitor' },
        audio: { echoCancellation: false, noiseSuppression: false, sampleRate: 48000 },
      })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      setSharing(true)
      setHasStream(true)
      append('tela capturada com sucesso', 'ok')
      stream.getVideoTracks()[0].onended = stopSharing
    } catch (e) {
      append(`erro ao capturar: ${e.message}`, 'err')
    }
  }

  const stopSharing = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    setSharing(false); setHasStream(false); setStatus('idle')
    pcRef.current = null
    append('transmissão encerrada')
  }, [append])

  const refreshCode = () => {
    stopSharing()
    const c = generateCode()
    setCode(c)
    reset(`sala ${c} aberta`, 'ok')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      {/* Quality presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          qualidade de transmissão
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => !sharing && setQuality(key)}
              disabled={sharing}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 11,
                fontFamily: 'var(--mono)',
                cursor: sharing ? 'not-allowed' : 'pointer',
                border: quality === key ? '1px solid rgba(79,70,229,0.6)' : '1px solid var(--border2)',
                background: quality === key ? 'rgba(79,70,229,0.15)' : 'var(--surface2)',
                color: quality === key ? 'var(--accent-light)' : 'var(--text2)',
                opacity: sharing && quality !== key ? 0.4 : 1,
                display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontWeight: 600 }}>{preset.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{preset.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!sharing
          ? <button onClick={startSharing} style={btnPrimary}>▶ compartilhar tela</button>
          : <button onClick={stopSharing} style={btnDanger}>⬛ parar transmissão</button>
        }
      </div>

      <VideoFrame ref={localVideoRef} hasStream={hasStream} placeholderText="pré-visualização local" type="screen" muted />
      {sharing && <StatsBar stats={stats} videoEl={localVideoRef.current} />}
      <LogPanel entries={entries} />
    </div>
  )
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