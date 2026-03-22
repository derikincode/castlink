import React, { forwardRef } from 'react'

const PlaceholderIcon = ({ type }) =>
  type === 'screen' ? (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.25 }}>
      <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h6l-2 3v1h8v-1l-2-3h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z" />
    </svg>
  ) : (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.25 }}>
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  )

export const VideoFrame = forwardRef(function VideoFrame(
  { hasStream, placeholderText, type = 'screen', muted = false, onFullscreen },
  ref
) {
  return (
    <div
      style={{
        background: '#000',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: '16/9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!hasStream && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: 'var(--text3)',
            fontSize: 13,
            fontFamily: 'var(--mono)',
            pointerEvents: 'none',
          }}
        >
          <PlaceholderIcon type={type} />
          <span>{placeholderText}</span>
        </div>
      )}
      <video
        ref={ref}
        autoPlay
        muted={muted}
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          opacity: hasStream ? 1 : 0,
        }}
      />
      {onFullscreen && hasStream && (
        <button
          onClick={onFullscreen}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            fontSize: 12,
            fontFamily: 'var(--mono)',
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)',
            padding: '5px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          ⛶ fullscreen
        </button>
      )}
    </div>
  )
})
