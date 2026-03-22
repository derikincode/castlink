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

export function senderPeerId(code) {
  return `castlink-s-${code}`
}

export function receiverPeerId(code) {
  return `castlink-r-${code}`
}

// Opções de qualidade disponíveis para o usuário escolher
export const QUALITY_PRESETS = {
  auto: {
    label: 'Auto',
    desc: 'Ajusta pela rede',
    video: { frameRate: { ideal: 60, max: 60 } },
    maxBitrate: null,
  },
  hd: {
    label: 'HD — 1080p',
    desc: '~8 Mbps',
    video: {
      width: { ideal: 1920, max: 1920 },
      height: { ideal: 1080, max: 1080 },
      frameRate: { ideal: 60, max: 60 },
    },
    maxBitrate: 8_000_000,
  },
  qhd: {
    label: 'QHD — 1440p',
    desc: '~15 Mbps',
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
 * Força bitrate máximo nos senders de vídeo via RTCRtpSender.setParameters.
 * Muito mais eficaz do que mexer no SDP.
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
      params.encodings[0].maxBitrate = maxBitrateBps
      // Prioridade máxima — evita throttling do navegador
      params.encodings[0].priority = 'high'
      params.encodings[0].networkPriority = 'high'
      await sender.setParameters(params)
    } catch (e) {
      console.warn('setParameters falhou:', e)
    }
  }
}

/**
 * Preferência de codec: VP9 > H264 > VP8 (melhor qualidade/bitrate)
 * Usa setCodecPreferences quando disponível (Chrome 96+)
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
      // Ordena: VP9 primeiro, depois H264, depois o resto
      const sorted = [
        ...caps.codecs.filter((c) => c.mimeType === 'video/VP9'),
        ...caps.codecs.filter((c) => c.mimeType === 'video/H264'),
        ...caps.codecs.filter(
          (c) => c.mimeType !== 'video/VP9' && c.mimeType !== 'video/H264'
        ),
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
        result.fps = report.framesPerSecond
          ? Math.round(report.framesPerSecond)
          : undefined
        result.qualityScore = report.qualityLimitationReason ?? null
      }
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        result.bytesReceived = report.bytesReceived ?? 0
        result.fps = report.framesPerSecond
          ? Math.round(report.framesPerSecond)
          : undefined
        result.jitter = report.jitter !== undefined
          ? Math.round(report.jitter * 1000)
          : undefined
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        if (report.currentRoundTripTime !== undefined) {
          result.rtt = Math.round(report.currentRoundTripTime * 1000)
        }
        result.localCandidateType = undefined
      }
      if (report.type === 'local-candidate') {
        result.localCandidateType = report.candidateType
      }
    })
    return result
  } catch {
    return null
  }
}