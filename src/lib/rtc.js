export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
]

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateCode(len = 6) {
  return Array.from({ length: len }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

export function senderPeerId(code) { return `castlink-s-${code}` }
export function receiverPeerId(code) { return `castlink-r-${code}` }

export const QUALITY_PRESETS = {
  auto: {
    label: 'Auto',
    desc: 'Ajusta pela rede',
    video: { frameRate: { ideal: 60, max: 60 } },
    maxBitrate: null,
  },
  hd: {
    label: 'HD — 1080p',
    desc: '~8 Mbps · 60fps',
    video: {
      width: { ideal: 1920, max: 1920 },
      height: { ideal: 1080, max: 1080 },
      frameRate: { ideal: 60, max: 60 },
    },
    maxBitrate: 8_000_000,
  },
  qhd: {
    label: 'QHD — 1440p',
    desc: '~15 Mbps · 60fps',
    video: {
      width: { ideal: 2560, max: 2560 },
      height: { ideal: 1440, max: 1440 },
      frameRate: { ideal: 60, max: 60 },
    },
    maxBitrate: 15_000_000,
  },
  performance: {
    label: 'Performance',
    desc: '720p · baixo delay',
    video: {
      width: { ideal: 1280, max: 1280 },
      height: { ideal: 720, max: 720 },
      frameRate: { ideal: 60, max: 60 },
    },
    maxBitrate: 4_000_000,
  },
}

/**
 * Força bitrate via setParameters — chamado após ICE connected.
 * Usa CBR (taxa constante) e desabilita degradação de qualidade.
 */
export async function applyMaxBitrate(pc, maxBitrateBps) {
  if (!pc || !maxBitrateBps) return
  const senders = pc.getSenders()
  for (const sender of senders) {
    if (sender.track?.kind !== 'video') continue
    try {
      const params = sender.getParameters()
      if (!params.encodings || params.encodings.length === 0) {
        params.encodings = [{}]
      }
      const enc = params.encodings[0]
      enc.maxBitrate      = maxBitrateBps
      enc.minBitrate      = Math.round(maxBitrateBps * 0.7) // mínimo 70%
      enc.priority        = 'high'
      enc.networkPriority = 'high'
      // Prefere reduzir framerate antes de qualidade quando há congestionamento
      enc.degradationPreference = 'maintain-resolution'
      await sender.setParameters(params)
    } catch (e) {
      console.warn('setParameters falhou:', e)
    }

    // Desabilita detecção de overuse de CPU (Chrome-specific)
    try {
      const track = sender.track
      if (track && track.applyConstraints) {
        await track.applyConstraints({
          // Mantém framerate mesmo sob carga de CPU
          frameRate: { ideal: 60, min: 24 },
        })
      }
    } catch {}
  }
}

/**
 * Aplica bitrate diretamente no SDP via regex — garante que o limite
 * seja definido ANTES da negociação, complementando o setParameters.
 */
export function patchSdpBitrate(sdp, maxKbps) {
  // Remove linhas b=AS e b=TIAS existentes e injeta as nossas
  let patched = sdp
    .replace(/b=AS:[0-9]+\r\n/g, '')
    .replace(/b=TIAS:[0-9]+\r\n/g, '')

  // Insere b=AS (kbps) e b=TIAS (bps) após cada linha m=video
  patched = patched.replace(
    /(m=video.*\r\n)/g,
    `$1b=AS:${maxKbps}\r\nb=TIAS:${maxKbps * 1000}\r\n`
  )
  return patched
}

/**
 * Preferência de codec: VP9 > H264 > VP8
 */
export function preferHighQualityCodec(pc) {
  if (!pc) return
  try {
    const transceivers = pc.getTransceivers()
    for (const transceiver of transceivers) {
      if (transceiver.sender?.track?.kind !== 'video') continue
      if (!RTCRtpSender.getCapabilities) continue
      const caps = RTCRtpSender.getCapabilities('video')
      if (!caps) continue
      const sorted = [
        ...caps.codecs.filter((c) => c.mimeType === 'video/VP9'),
        ...caps.codecs.filter((c) => c.mimeType === 'video/H264'),
        ...caps.codecs.filter((c) => c.mimeType !== 'video/VP9' && c.mimeType !== 'video/H264'),
      ]
      if (transceiver.setCodecPreferences && sorted.length > 0) {
        transceiver.setCodecPreferences(sorted)
      }
    }
  } catch (e) {
    console.warn('setCodecPreferences falhou:', e)
  }
}

export async function getRTCStats(pc) {
  if (!pc) return null
  try {
    const stats = await pc.getStats()
    const result = {}
    stats.forEach((report) => {
      if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
        result.bytesSent = report.bytesSent ?? 0
        result.fps = report.framesPerSecond ? Math.round(report.framesPerSecond) : undefined
        result.qualityScore = report.qualityLimitationReason ?? null
      }
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        result.bytesReceived = report.bytesReceived ?? 0
        result.fps = report.framesPerSecond ? Math.round(report.framesPerSecond) : undefined
        result.jitter = report.jitter !== undefined ? Math.round(report.jitter * 1000) : undefined
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        if (report.currentRoundTripTime !== undefined) {
          result.rtt = Math.round(report.currentRoundTripTime * 1000)
        }
      }
    })
    return result
  } catch {
    return null
  }
}