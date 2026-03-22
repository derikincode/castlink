import { useState, useEffect, useRef } from 'react'
import { getRTCStats } from '../lib/rtc'

export function useRTCStats(pcRef, active) {
  const [stats, setStats] = useState(null)
  const prevBytes = useRef(0)

  useEffect(() => {
    if (!active) {
      setStats(null)
      prevBytes.current = 0
      return
    }

    const interval = setInterval(async () => {
      const pc = pcRef.current
      if (!pc) return
      const raw = await getRTCStats(pc)
      if (!raw) return

      const bytes = raw.bytesSent ?? raw.bytesReceived ?? 0
      const diff = bytes - prevBytes.current
      prevBytes.current = bytes
      const kbps = diff > 0 ? Math.round((diff * 8) / 1500) : 0

      setStats((prev) => ({
        ...prev,
        ...raw,
        kbps,
      }))
    }, 1500)

    return () => clearInterval(interval)
  }, [active, pcRef])

  return stats
}
