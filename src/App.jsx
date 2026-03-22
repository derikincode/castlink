import React, { useEffect } from 'react'
import { useDeviceType } from './hooks/useDeviceType'
import { useHandshake } from './hooks/useHandshake'
import { TVScreen } from './components/TVScreen'
import { PCScreen } from './components/PCScreen'
import { RolePicker } from './components/RolePicker'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'
import { MobileBlock } from './components/MobileBlock'

// TV tem Android no UA mas também tem tela grande — checar TV antes
const ua = navigator.userAgent
const isTVua = /\b(TV|SmartTV|SMART-TV|HbbTV|Tizen|WebOS|VIDAA|Viera|NetCast|BRAVIA|Aquos|AndroidTV)\b/i.test(ua)
const isBigScreen = window.innerWidth >= 1100
const isMobileUA  = /Android|iPhone|iPad|iPod/i.test(ua)

// Só bloqueia se for mobile E não for TV
const isMobile = isMobileUA && !isTVua && !isBigScreen

export default function App() {
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

  // Bloqueia mobile — mas só depois de confirmar que não é TV
  if (isMobile && !isTVMode) return <MobileBlock />

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