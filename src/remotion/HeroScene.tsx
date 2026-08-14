import React from 'react'
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig
} from 'remotion'

export interface HeroSceneProps {
  theme: 'light' | 'dark'
  nodeLabel: string
  name: string
  title: string
}

const BOOT_LINES = [
  '> init bergen_node --secure',
  '> loading adaptive_systems.rs',
  '> zero-trust handshake ... ok',
  '> agentic workflows ... armed'
]

export const HeroScene: React.FC<HeroSceneProps> = ({
  theme,
  nodeLabel,
  name,
  title
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()

  const accent = theme === 'light' ? '#008822' : '#00FF41'
  const bg = theme === 'light' ? '#EDF1F4' : '#0C0C0C'
  const panel = theme === 'light' ? '#FFFFFF' : '#141414'
  const fg = theme === 'light' ? '#0F172A' : '#F5F5F5'
  const dim =
    theme === 'light' ? 'rgba(15,23,42,0.55)' : 'rgba(245,245,245,0.55)'
  const line =
    theme === 'light' ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.12)'

  // Portrait reveal sweep, top -> bottom
  const revealY = interpolate(frame, [0.4 * fps, 2 * fps], [0, height], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1)
  })

  // Idle drift so the loop never looks frozen
  const idleShift = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0, 6, 0],
    { easing: Easing.inOut(Easing.sin) }
  )

  const bootCharCount = Math.floor(
    interpolate(
      frame,
      [0.2 * fps, 2.4 * fps],
      [0, BOOT_LINES.join('').length],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    )
  )

  let remaining = bootCharCount
  const typedLines = BOOT_LINES.map((l) => {
    const shown = l.slice(0, Math.max(0, remaining))
    remaining -= l.length
    return shown
  })

  const cursorOn = Math.floor(frame / (fps * 0.4)) % 2 === 0

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
      }}
    >
      {/* Dot grid backdrop */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${line} 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
          opacity: interpolate(frame, [0, 1 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          }),
          translate: `0px ${idleShift}px`
        }}
      />

      {/* Portrait panel */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 64,
          right: 64,
          bottom: 210,
          backgroundColor: panel,
          border: `1px solid ${line}`,
          overflow: 'hidden',
          opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          }),
          scale: interpolate(frame, [0.2 * fps, 1.2 * fps], [0.96, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1)
          })
        }}
      >
        <Img
          src='/suresh-portrait.png'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(1) contrast(1.25)',
            opacity: 0.9,
            clipPath: `inset(0px 0px ${Math.max(0, height - revealY)}px 0px)`
          }}
        />

        {/* Scanline that trails the reveal */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 3,
            backgroundColor: accent,
            boxShadow: `0 0 24px ${accent}`,
            opacity: interpolate(
              frame,
              [0.4 * fps, 2 * fps, 2.2 * fps],
              [1, 1, 0],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp'
              }
            ),
            translate: `0px ${Math.min(revealY, height - 274)}px`
          }}
        />

        {/* Inner frame */}
        <div
          style={{
            position: 'absolute',
            inset: 10,
            border: `1px solid ${accent}`,
            opacity: interpolate(frame, [1.6 * fps, 2.4 * fps], [0, 0.45], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            }),
            pointerEvents: 'none'
          }}
        />

        {/* Node label chip */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            padding: '6px 12px',
            border: `1px solid ${accent}`,
            backgroundColor:
              theme === 'light'
                ? 'rgba(255,255,255,0.92)'
                : 'rgba(12,12,12,0.9)',
            color: accent,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            opacity: interpolate(frame, [2.2 * fps, 2.7 * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            }),
            translate: `0px ${interpolate(
              frame,
              [2.2 * fps, 2.7 * fps],
              [12, 0],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.16, 1, 0.3, 1)
              }
            )}px`
          }}
        >
          {nodeLabel} · ONLINE
        </div>

        {/* Status dot */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 10,
            height: 10,
            borderRadius: 10,
            backgroundColor: accent,
            opacity: interpolate(
              frame,
              [
                0,
                durationInFrames / 4,
                durationInFrames / 2,
                (durationInFrames / 4) * 3,
                durationInFrames
              ],
              [1, 0.25, 1, 0.25, 1],
              { easing: Easing.inOut(Easing.sin) }
            ),
            boxShadow: `0 0 12px ${accent}`
          }}
        />
      </div>

      {/* Boot terminal */}
      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 56,
          height: 132,
          color: dim,
          fontSize: 17,
          lineHeight: '26px',
          opacity: interpolate(frame, [0.1 * fps, 0.5 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}
      >
        {typedLines.map((l, i) =>
          l.length > 0 ? (
            <div key={i} style={{ whiteSpace: 'pre' }}>
              {l}
              {i === typedLines.filter((x) => x.length > 0).length - 1 &&
              frame < 2.4 * fps ? (
                <span style={{ color: accent }}>▌</span>
              ) : null}
            </div>
          ) : null
        )}
        {frame >= 2.4 * fps ? (
          <div style={{ color: fg, fontWeight: 700 }}>
            <span style={{ color: accent }}>&gt; </span>
            {name}{' '}
            <span style={{ color: dim, fontWeight: 400 }}>// {title}</span>
            {cursorOn ? <span style={{ color: accent }}>▌</span> : null}
          </div>
        ) : null}
      </div>

      {/* Corner brackets */}
      {(
        [
          {
            top: 40,
            left: 40,
            borderTop: `2px solid ${accent}`,
            borderLeft: `2px solid ${accent}`
          },
          {
            top: 40,
            right: 40,
            borderTop: `2px solid ${accent}`,
            borderRight: `2px solid ${accent}`
          },
          {
            bottom: 40,
            left: 40,
            borderBottom: `2px solid ${accent}`,
            borderLeft: `2px solid ${accent}`
          },
          {
            bottom: 40,
            right: 40,
            borderBottom: `2px solid ${accent}`,
            borderRight: `2px solid ${accent}`
          }
        ] as React.CSSProperties[]
      ).map((c, i) => (
        <div
          key={i}
          style={{
            ...c,
            position: 'absolute',
            width: 34,
            height: 34,
            opacity: interpolate(frame, [0, 0.6 * fps], [0, 0.8], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            }),
            scale: interpolate(frame, [0, 0.8 * fps], [1.4, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1)
            })
          }}
        />
      ))}
    </AbsoluteFill>
  )
}
