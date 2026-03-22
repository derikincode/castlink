import { useState, useEffect } from 'react'

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState('pc')

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      const h = window.innerHeight

      // URL param ?device=tv ou ?device=pc força o modo manualmente
      const param = new URLSearchParams(window.location.search).get('device')
      if (param === 'tv') { setDeviceType('tv'); return }
      if (param === 'pc') { setDeviceType('pc'); return }

      // User agent hints — Smart TVs geralmente têm "TV", "SmartTV", "SMART-TV",
      // "HbbTV", "Tizen", "WebOS", "VIDAA" no UA
      const ua = navigator.userAgent || ''
      const tvUA = /\b(TV|SmartTV|SMART-TV|HbbTV|Tizen|WebOS|VIDAA|Viera|NetCast|BRAVIA|Aquos|PHILIPS|AndroidTV)\b/i.test(ua)

      // Tela grande sem toque (TV com controle ou mouse)
      const bigScreen = w >= 1100 && h >= 600
      const coarse    = window.matchMedia('(pointer: coarse)').matches
      const noHover   = window.matchMedia('(hover: none)').matches
      const veryBig   = w >= 1600

      // É TV se:
      // - UA diz que é TV, ou
      // - tela muito grande (>=1600), ou
      // - tela grande + sem hover (controle remoto), ou
      // - tela grande + pointer grosso (touch TV)
      const isTV = tvUA || veryBig || (bigScreen && noHover) || (bigScreen && coarse)

      setDeviceType(isTV ? 'tv' : 'pc')
    }

    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return deviceType
}