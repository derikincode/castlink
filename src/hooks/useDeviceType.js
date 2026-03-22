import { useState, useEffect } from 'react'

const TV_UA = [
  /SmartTV/i, /Smart-TV/i, /HbbTV/i, /SMART-TV/i,
  /Tizen/i, /WebOS/i, /VIDAA/i, /Viera/i, /NetCast/i,
  /BRAVIA/i, /Aquos/i, /Android TV/i, /GoogleTV/i,
  /Chromecast/i, /CrKey/i,
  /AFTT/i, /AFTM/i, /AFTB/i, /AFTS/i, /AFT/i,
  /Konka/i, /TCL/i, /Roku/i, /AppleTV/i,
  /Philips/i, /OpenTV/i, /OPENTV/i,
]

const MOBILE_UA = [
  /iPhone/i, /iPod/i,
  /Android.*Mobile/i, // Android + Mobile = celular
]

// iPad tem tela grande — trata como tablet/PC, não mobile
const TABLET_UA = [/iPad/i]

function detectDevice() {
  const ua = navigator.userAgent

  // 1. Parâmetro manual na URL — prioridade máxima
  const param = new URLSearchParams(window.location.search).get('device')
  if (param === 'tv')     return 'tv'
  if (param === 'pc')     return 'pc'
  if (param === 'mobile') return 'mobile'

  // 2. UA de TV conhecido → TV
  if (TV_UA.some((p) => p.test(ua))) return 'tv'

  // 3. UA de celular → mobile
  if (MOBILE_UA.some((p) => p.test(ua))) return 'mobile'

  // 4. Tablet → PC (tela grande, sem mobile no UA)
  if (TABLET_UA.some((p) => p.test(ua))) return 'pc'

  // 5. Android sem "Mobile" = tablet ou TV Android genérica sem UA conhecido
  //    Fallback: tela + pointer para distinguir
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) {
    return screenAndPointerDetect()
  }

  // 6. UA não reconhecido (browser genérico, WebView desconhecido, etc.)
  //    Fallback: tela + pointer
  if (!/Windows|Macintosh|Linux|CrOS/i.test(ua)) {
    return screenAndPointerDetect()
  }

  // 7. Desktop conhecido → PC
  return 'pc'
}

/**
 * Fallback por tamanho de tela + pointer
 * Usado quando o UA não é reconhecido nem como TV, nem mobile, nem desktop.
 */
function screenAndPointerDetect() {
  const w = window.innerWidth
  const h = window.innerHeight
  const coarse  = window.matchMedia('(pointer: coarse)').matches
  const noHover = window.matchMedia('(hover: none)').matches
  const fine    = window.matchMedia('(pointer: fine)').matches

  // Tela muito grande + sem pointer preciso = TV
  if (w >= 1280 && (noHover || coarse)) return 'tv'

  // Tela grande + pointer fino = PC/monitor
  if (w >= 1024 && fine) return 'pc'

  // Tela pequena = mobile
  if (w < 768) return 'mobile'

  // Zona cinza (tablet, etc.) → PC
  return 'pc'
}

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState(() => detectDevice())

  useEffect(() => {
    // Re-detecta se a janela for redimensionada (raro, mas garante)
    const handler = () => setDeviceType(detectDevice())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return deviceType // 'tv' | 'pc' | 'mobile'
}