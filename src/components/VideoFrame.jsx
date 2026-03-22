import React, { forwardRef } from 'react'

const PlaceholderIcon = ({ type, size = 44 }) =>
  type === 'screen' ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.25 }}>
      <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h6l-2 3v1h8v-1l-2-3h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.25 }}>
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  )

export const VideoFrame = forwardRef(function VideoFrame(
  { hasStream, placeholderText, type = 'screen', muted = false, onFullscreen, tvMode = false },
  ref
) {
  return (
    <div
      style={{
        background: '#000',
        borderRadius: tvMode ? 14 : 10,
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
            gap: 16,
            color: 'var(--text3)',
            fontSize: tvMode ? 18 : 13,
            fontFamily: 'var(--mono)',
            pointerEvents: 'none',
          }}
        >
          <PlaceholderIcon type={type} size={tvMode ? 64 : 44} />
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
            bottom: tvMode ? 16 : 10,
            right: tvMode ? 16 : 10,
            fontSize: tvMode ? 16 : 12,
            fontFamily: 'var(--mono)',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.8)',
            padding: tvMode ? '10px 18px' : '5px 10px',
            borderRadius: tvMode ? 10 : 6,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          ⛶ {tvMode ? 'tela cheia' : 'fullscreen'}
        </button>
      )}
    </div>
  )
})