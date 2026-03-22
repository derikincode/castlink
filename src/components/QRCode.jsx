import React, { useEffect, useRef } from 'react'

/**
 * Renders a QR code onto a <canvas> using the `qrcode` npm package.
 * Falls back to a text link if the library fails.
 */
export function QRCode({ value, size = 220 }) {
  const canvasRef = useRef(null)
  const fallbackRef = useRef(false)

  useEffect(() => {
    if (!value || !canvasRef.current) return

    import('qrcode').then((QRLib) => {
      QRLib.default.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#e8e6ff',   // matches --text
          light: '#0f0f18',  // matches --surface
        },
      }).catch((e) => {
        fallbackRef.current = true
        console.warn('QR render failed:', e)
      })
    }).catch(() => {
      fallbackRef.current = true
    })
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        borderRadius: 16,
        display: 'block',
        imageRendering: 'pixelated',
      }}
    />
  )
}