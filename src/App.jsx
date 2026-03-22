import React, { useEffect } from 'react'
import { useDeviceType } from './hooks/useDeviceType'
import { useHandshake } from './hooks/useHandshake'
import { TVScreen } from './components/TVScreen'
import { PCScreen } from './components/PCScreen'
import { RolePicker } from './components/RolePicker'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'
import { MobileBlock } from './components/MobileBlock'

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export default function App() {
  // Bloqueia mobile logo na entrada
  if (isMobile) return <MobileBlock />

  const deviceType = useDeviceType()
  const isTVMode = deviceType === 'tv'

  const {
    phase, code, role, peerDeviceType, error,
    peerRef, connRef, callRef, pcRef,
    startHost, joinGuest, pickRole, reset,
  } = useHandshake({ deviceType })

  useEffect(() => {
    if (isTVMode && phase === 'idle') startHost(code)
  }, [isTVMode, code]) // eslint-disable-line

  useEffect(() => {
    if (isTVMode && phase === 'role_pick') pickRole('receiver')
  }, [isTVMode, phase]) // eslint-disable-line

  if (phase === 'ready' && role) {
    return role === 'sender'
      ? <Sender peerRef={peerRef} connRef={connRef} pcRef={pcRef} isTVMode={isTVMode} onReset={reset} />
      : <Receiver peerRef={peerRef} connRef={connRef} callRef={callRef} pcRef={pcRef} isTVMode={isTVMode} onReset={reset} />
  }

  if (isTVMode) return <TVScreen code={code} phase={phase} onReset={reset} />

  if (phase === 'role_pick') {
    return <RolePicker onPick={pickRole} peerDeviceType={peerDeviceType} isTVMode={false} />
  }

  return <PCScreen phase={phase} error={error} onJoin={joinGuest} onReset={reset} />
}