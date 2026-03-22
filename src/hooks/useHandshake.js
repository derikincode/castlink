/**
 * useHandshake
 *
 * Gerencia o fluxo completo de conexão:
 *   idle → connecting → role_pick → ready
 *
 * Quando dois peers se conectam via data channel, trocam mensagens:
 *   A envia { type: 'hello', deviceType: 'tv'|'pc' }
 *   B responde { type: 'hello', deviceType: 'tv'|'pc' }
 *   Então ambos entram em role_pick e o usuário escolhe sender/receiver
 *   Quem escolhe sender envia { type: 'role', role: 'sender' }
 *   O outro automaticamente vira receiver
 */
import { useRef, useState, useCallback, useEffect } from 'react'
import Peer from 'peerjs'
import { ICE_SERVERS, generateCode, senderPeerId, receiverPeerId } from '../lib/rtc'

export function useHandshake({ deviceType }) {
  const [phase, setPhase] = useState('idle')
  // idle | connecting | role_pick | ready | error
  const [code, setCode] = useState(() => generateCode())
  const [role, setRole] = useState(null)         // 'sender' | 'receiver'
  const [peerDeviceType, setPeerDeviceType] = useState(null)
  const [error, setError] = useState(null)

  const peerRef = useRef(null)
  const connRef = useRef(null)  // data connection
  const callRef = useRef(null)  // media call
  const pcRef   = useRef(null)  // RTCPeerConnection

  // ── helpers ──────────────────────────────────────────────────────────
  const send = useCallback((msg) => {
    if (connRef.current?.open) connRef.current.send(msg)
  }, [])

  const destroyPeer = useCallback(() => {
    try { peerRef.current?.destroy() } catch {}
    peerRef.current = null
    connRef.current = null
    callRef.current = null
    pcRef.current   = null
  }, [])

  // ── handle incoming data messages ─────────────────────────────────
  const handleData = useCallback((data) => {
    if (data.type === 'hello') {
      setPeerDeviceType(data.deviceType)
      setPhase('role_pick')
    }
    if (data.type === 'role') {
      // peer chose a role → we take the opposite
      const opposite = data.role === 'sender' ? 'receiver' : 'sender'
      setRole(opposite)
      setPhase('ready')
    }
  }, [])

  // ── wire up a data connection ─────────────────────────────────────
  const wireConn = useCallback((conn) => {
    connRef.current = conn
    conn.on('open', () => {
      send({ type: 'hello', deviceType })
    })
    conn.on('data', handleData)
    conn.on('close', () => {
      setPhase('idle')
      setRole(null)
      setPeerDeviceType(null)
    })
    conn.on('error', () => setError('Conexão perdida'))
  }, [deviceType, handleData, send])

  // ── start as HOST (TV / quem gera o código) ───────────────────────
  const startHost = useCallback((roomCode) => {
    destroyPeer()
    const myId = `castlink-h-${roomCode}`
    const peer = new Peer(myId, { debug: 0, config: { iceServers: ICE_SERVERS } })
    peerRef.current = peer

    peer.on('open', () => setPhase('connecting'))
    peer.on('connection', (conn) => wireConn(conn))
    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        // código em uso, gera outro
        const nc = generateCode()
        setCode(nc)
        startHost(nc)
      } else {
        setError(err.type)
        setPhase('error')
      }
    })
  }, [destroyPeer, wireConn])

  // ── join as GUEST (PC / quem escaneia) ────────────────────────────
  const joinGuest = useCallback((roomCode) => {
    destroyPeer()
    const myId = `castlink-g-${roomCode}-${Math.random().toString(36).slice(2, 6)}`
    const peer = new Peer(myId, { debug: 0, config: { iceServers: ICE_SERVERS } })
    peerRef.current = peer

    setPhase('connecting')

    peer.on('open', () => {
      const conn = peer.connect(`castlink-h-${roomCode}`, { reliable: true })
      wireConn(conn)
    })
    peer.on('error', (err) => {
      setError(`Sala não encontrada (${err.type})`)
      setPhase('error')
    })
  }, [destroyPeer, wireConn])

  // ── user picks a role ─────────────────────────────────────────────
  const pickRole = useCallback((chosen) => {
    setRole(chosen)
    send({ type: 'role', role: chosen })
    setPhase('ready')
  }, [send])

  // ── reset everything ──────────────────────────────────────────────
  const reset = useCallback(() => {
    destroyPeer()
    const nc = generateCode()
    setCode(nc)
    setPhase('idle')
    setRole(null)
    setPeerDeviceType(null)
    setError(null)
  }, [destroyPeer])

  // ── auto-start host when code is set (TV flow) ────────────────────
  // exposed separately so App can decide when to call

  return {
    phase,       // 'idle' | 'connecting' | 'role_pick' | 'ready' | 'error'
    code,
    role,        // 'sender' | 'receiver' | null
    peerDeviceType,
    error,
    peerRef,
    connRef,
    callRef,
    pcRef,
    // actions
    startHost,
    joinGuest,
    pickRole,
    reset,
    setCode,
  }
}