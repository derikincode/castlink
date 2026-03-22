import { useState, useCallback } from 'react'

export function useLog() {
  const [entries, setEntries] = useState([
    { time: '--:--', msg: 'pronto', type: 'info' },
  ])

  const append = useCallback((msg, type = '') => {
    const time = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    setEntries((prev) => [...prev.slice(-50), { time, msg, type }])
  }, [])

  const reset = useCallback((msg = 'pronto', type = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    setEntries([{ time, msg, type }])
  }, [])

  return { entries, append, reset }
}
