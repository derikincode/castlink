import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useRTCStats } from '../hooks/useRTCStats'
import { useLog } from '../hooks/useLog'
import { QUALITY_PRESETS, applyMaxBitrate, preferHighQualityCodec, patchSdpBitrate } from '../lib/rtc'
import { VideoFrame } from './VideoFrame'
import { StatsBar } from './StatsBar'
import { StatusDot } from './StatusDot'
import { LogPanel } from './LogPanel'

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export function Sender({ peerRef, connRef, pcRef, isTVMode, onReset }) {
  const [status, setStatus]       = useState('idle')
  const [sharing, setSharing]     = useState(false)
  const [hasStream, setHasStream] = useState(false)
  const [quality, setQuality]     = useState('hd')

  const localVideoRef  = useRef(null)
  const localStreamRef = useRef(null)
  const internalPCRef  = useRef(null)
  const qualityRef     = useRef('hd')
  qualityRef.current   = quality

  const { entries, append } = useLog()
  const stats = useRTCStats(internalPCRef, sharing)

  useEffect(() => {
    const conn = connRef?.current
    if (!conn) return
    const handler = (d) => { if (d?.type === 'disconnect') stopSharing() }
    conn.on('data', handler)
    return () => { try { conn.off('data', handler) } catch {} }
  }, [connRef]) // eslint-disable-line

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
      setSharing(true); setHasStream(true); setStatus('calling')
      append('tela capturada, iniciando chamada...', 'ok')

      const conn = connRef?.current
      const remotePeerId = conn?.peer
      if (!peerRef?.current || !remotePeerId) { append('peer não encontrado', 'err'); return }

      const call = peerRef.current.call(remotePeerId, stream)
      const pc = call.peerConnection
      internalPCRef.current = pc
      if (pcRef) pcRef.current = pc
      preferHighQualityCodec(pc)

      // Patch SDP para forçar bitrate máximo ANTES da negociação
      const sdpPreset = QUALITY_PRESETS[qualityRef.current]
      if (sdpPreset?.maxBitrate) {
        const origCreateOffer = pc.createOffer.bind(pc)
        pc.createOffer = async (opts) => {
          const offer = await origCreateOffer(opts)
          offer.sdp = patchSdpBitrate(offer.sdp, Math.round(sdpPreset.maxBitrate / 1000))
          return offer
        }
      }

      pc.oniceconnectionstatechange = async () => {
        const s = pc.iceConnectionState
        if (s === 'connected' || s === 'completed') {
          setStatus('connected')
          append('stream P2P ativo!', 'ok')
          const activePreset = QUALITY_PRESETS[qualityRef.current]
          if (activePreset?.maxBitrate) {
            // Aplica imediatamente
            await applyMaxBitrate(pc, activePreset.maxBitrate)
            append(`bitrate forçado: ${Math.round(activePreset.maxBitrate / 1_000_000)} Mbps`, 'ok')
            // Reaplica a cada 3s — o GCC tenta reduzir, a gente força de volta
            const interval = setInterval(async () => {
              if (pc.iceConnectionState !== 'connected' && pc.iceConnectionState !== 'completed') {
                clearInterval(interval)
                return
              }
              await applyMaxBitrate(pc, activePreset.maxBitrate)
            }, 3000)
          }
        }
        if (s === 'disconnected' || s === 'failed' || s === 'closed') {
          setStatus('idle'); append('receptor desconectou')
        }
      }
      stream.getVideoTracks()[0].onended = stopSharing
    } catch (e) {
      append(`erro: ${e.message}`, 'err')
    }
  }

  const stopSharing = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    setSharing(false); setHasStream(false); setStatus('idle')
    internalPCRef.current = null
    append('transmissão encerrada')
  }, [append])

  // ── Celular: não suportado ───────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: 28, position: 'relative' }}>
        <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)`, backgroundSize: '44px 44px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 360, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--accent-light)">
              <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>App necessário</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0, lineHeight: 1.7, fontFamily: 'var(--mono)' }}>
              Transmitir a tela pelo celular requer o app nativo.<br/>Em breve disponível.
            </p>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, padding: '16px 20px', width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 1 }}>no celular você pode</span>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>📺 Receber transmissões na tela</span>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>🔗 Escanear o QR code da TV</span>
          </div>

          <button onClick={onReset} style={{ padding: '12px 24px', borderRadius: 10, fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', width: '100%' }}>
            ← voltar e escolher Receber
          </button>
        </div>
      </div>
    )
  }

  // ── Desktop: transmissor normal ──────────────────────────────────
  const fs = isTVMode ? 16 : 13

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)`, backgroundSize: '44px 44px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: isTVMode ? '2rem 2.5rem' : '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: isTVMode ? 24 : 16, position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z"/><polygon points="17,14 17,20 22,17"/></svg>
            </div>
            <span style={{ fontSize: isTVMode ? 20 : 16, fontWeight: 700 }}>CastLink</span>
            <span style={{ fontSize: isTVMode ? 13 : 11, fontFamily: 'var(--mono)', color: 'var(--accent-light)', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)', padding: '3px 10px', borderRadius: 99 }}>transmissor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusDot status={status === 'connected' ? 'connected' : status === 'calling' ? 'connecting' : 'idle'} />
            <span style={{ fontSize: isTVMode ? 14 : 11, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
              {status === 'idle' && 'pronto'}
              {status === 'calling' && 'conectando...'}
              {status === 'connected' && 'transmitindo'}
            </span>
            <button onClick={onReset} style={{ fontSize: isTVMode ? 13 : 11, fontFamily: 'var(--mono)', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text3)', padding: isTVMode ? '8px 16px' : '5px 12px', borderRadius: 8, cursor: 'pointer' }}>
              ✕ sair
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: isTVMode ? 14 : 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>qualidade de transmissão</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
              <button key={key} onClick={() => !sharing && setQuality(key)} disabled={sharing}
                style={{
                  padding: isTVMode ? '10px 18px' : '7px 14px', borderRadius: 8,
                  fontSize: isTVMode ? 13 : 11, fontFamily: 'var(--mono)',
                  cursor: sharing ? 'not-allowed' : 'pointer',
                  border: quality === key ? '1px solid rgba(79,70,229,0.6)' : '1px solid var(--border2)',
                  background: quality === key ? 'rgba(79,70,229,0.15)' : 'var(--surface2)',
                  color: quality === key ? 'var(--accent-light)' : 'var(--text2)',
                  opacity: sharing && quality !== key ? 0.4 : 1,
                  display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', transition: 'all 0.15s',
                }}>
                <span style={{ fontWeight: 600 }}>{preset.label}</span>
                <span style={{ fontSize: isTVMode ? 11 : 10, color: 'var(--text3)' }}>{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!sharing
            ? <button onClick={startSharing} style={{ ...btnPrimary, fontSize: fs, padding: isTVMode ? '14px 28px' : '11px 20px' }}>▶ compartilhar tela</button>
            : <button onClick={stopSharing} style={{ ...btnDanger, fontSize: fs, padding: isTVMode ? '14px 28px' : '11px 20px' }}>⬛ parar transmissão</button>
          }
        </div>

        <VideoFrame ref={localVideoRef} hasStream={hasStream} placeholderText="pré-visualização local" type="screen" muted tvMode={isTVMode} />
        {sharing && <StatsBar stats={stats} videoEl={localVideoRef.current} tvMode={isTVMode} />}
        <LogPanel entries={entries} />
      </div>
    </div>
  )
}

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 10,
  fontFamily: 'var(--sans)', fontWeight: 600, cursor: 'pointer', border: 'none',
  background: 'var(--accent)', color: '#fff',
}
const btnDanger = {
  ...btnPrimary, background: 'rgba(244,63,94,0.1)',
  border: '1px solid rgba(244,63,94,0.3)', color: 'var(--red)',
}