import React, { useEffect } from 'react'
import { useDeviceType } from './hooks/useDeviceType'
import { useHandshake } from './hooks/useHandshake'
import { TVScreen } from './components/TVScreen'
import { PCScreen } from './components/PCScreen'
import { RolePicker } from './components/RolePicker'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'

export default function App() {
  const deviceType = useDeviceType()
  const isTVMode = deviceType === 'tv'

  const {
    phase,
    code,
    role,
    peerDeviceType,
    error,
    peerRef,
    connRef,
    callRef,
    pcRef,
    startHost,
    joinGuest,
    pickRole,
    reset,
  } = useHandshake({ deviceType })

  // TV auto-starts as host on mount
  useEffect(() => {
    if (isTVMode && phase === 'idle') {
      startHost(code)
    }
  }, [isTVMode, code]) // eslint-disable-line

  if (phase === 'ready' && role) {
    return role === 'sender'
      ? <Sender peerRef={peerRef} connRef={connRef} pcRef={pcRef} isTVMode={isTVMode} onReset={reset} />
      : <Receiver peerRef={peerRef} connRef={connRef} callRef={callRef} pcRef={pcRef} isTVMode={isTVMode} onReset={reset} />
  }

  if (phase === 'role_pick') {
    return (
      <RolePicker
        onPick={pickRole}
        peerDeviceType={peerDeviceType}
        isTVMode={isTVMode}
      />
    )
  }

  if (isTVMode) {
    return <TVScreen code={code} phase={phase} onReset={reset} />
  }

  return (
    <PCScreen
      phase={phase}
      error={error}
      onJoin={joinGuest}
      onReset={reset}
    />
  )
}