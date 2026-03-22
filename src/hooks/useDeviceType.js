import { useState, useEffect } from 'react'

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState('pc')

  useEffect(() => {
    const check = () => {
      const bigScreen   = window.innerWidth >= 1100
      const coarse      = window.matchMedia('(pointer: coarse)').matches
      const veryBig     = window.innerWidth >= 1600
      const isTV        = veryBig || (bigScreen && coarse)
      setDeviceType(isTV ? 'tv' : 'pc')
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return deviceType  // 'tv' | 'pc'
}