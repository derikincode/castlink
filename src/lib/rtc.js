export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
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

export async function getRTCStats(pc) {
  if (!pc) return null
  try {
    const stats = await pc.getStats()
    const result = {}
    stats.forEach((report) => {
      if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
        result.bytesSent = report.bytesSent ?? 0
      }
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        result.bytesReceived = report.bytesReceived ?? 0
        result.fps = report.framesPerSecond
          ? Math.round(report.framesPerSecond)
          : undefined
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
