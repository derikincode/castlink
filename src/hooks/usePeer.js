import { useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'
import { ICE_SERVERS } from '../lib/rtc'

export function usePeer({ peerId, onReady, onError, onCall, onConnection }) {
  const peerRef = useRef(null)

  const destroy = useCallback(() => {
    if (peerRef.current) {
      try { peerRef.current.destroy() } catch {}
      peerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!peerId) return
    destroy()

    const peer = new Peer(peerId, {
      debug: 0,
      config: { iceServers: ICE_SERVERS },
    })

    peer.on('open', (id) => onReady?.(id))
    peer.on('error', (err) => onError?.(err))
    peer.on('call', (call) => onCall?.(call))
    peer.on('connection', (conn) => onConnection?.(conn))

    peerRef.current = peer

    return () => {
      destroy()
    }
  }, [peerId]) // eslint-disable-line

  return { peerRef, destroy }
}
