import React, { useEffect } from 'react'
import { useDeviceType } from './hooks/useDeviceType'
import { useHandshake } from './hooks/useHandshake'
import { TVScreen } from './components/TVScreen'
import { PCScreen } from './components/PCScreen'
import { RolePicker } from './components/RolePicker'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'
import { MobileBlock } from './components/MobileBlock'

export default function App() {
  const deviceType = useDeviceType() // 'tv' | 'pc' | 'mobile'
  const isTVMode   = deviceType === 'tv'
  const isMobile   = deviceType === 'mobile'

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

  // Mobile → bloqueia imediatamente
  if (isMobile) return <MobileBlock />

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