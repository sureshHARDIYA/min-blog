'use client'

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'

import './article-listen.css'
import {
  clearListenProgress,
  readListenProgress,
  saveListenProgress
} from './listenProgress'
import {
  forgetAudioSyncMode,
  useAudioBeats,
  useAudioSyncMode
} from './useAudioBeats'

export interface ListenSegment {
  id: string
  text: string
  url: string
  duration?: number
}

interface ArticleListenProps {
  segments: ListenSegment[]
  /** Section headings indexed like the `listen-section-N` ids on the page. */
  titles?: string[]
}

interface ListenTrack extends ListenSegment {
  label: string
  sectionOrdinal: number
}

type IconName =
  | 'back'
  | 'forward'
  | 'play'
  | 'pause'
  | 'previous'
  | 'next'
  | 'volume'
  | 'muted'

const RATES = [0.75, 1, 1.25, 1.5, 2]
const SKIP_SECONDS = 15
const CORS_QUERY = '?cors=1'
const SAVE_INTERVAL_SECONDS = 5
/** Start fetching the next section this long before the current one ends. */
const PRELOAD_LEAD_SECONDS = 30
const BEAT_COUNT = 32
const MINI_BEAT_COUNT = 4
const PLAY_ERROR = 'Audio could not be played. Please try again.'
const LOAD_ERROR = 'This audio segment is unavailable right now.'

/** Deterministic pseudo-random bar shapes so server and client markup match. */
const BEATS: CSSProperties[] = Array.from(
  { length: BEAT_COUNT },
  (_, i) =>
    ({
      '--h': (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7))).toFixed(2),
      '--t': `${(0.55 + ((i * 37) % 9) * 0.07).toFixed(2)}s`,
      '--d': `${(-((i * 53) % 11) * 0.09).toFixed(2)}s`
    }) as CSSProperties
)

const ICONS: Record<IconName, ReactNode> = {
  back: (
    <>
      <path d='M3 11a9 9 0 1 1 2.4 6.1' />
      <path d='M3 4v7h7' />
      <text
        x='12.5'
        y='15.5'
        fontSize='7.5'
        textAnchor='middle'
        stroke='none'
        fill='currentColor'
        fontWeight='700'
      >
        15
      </text>
    </>
  ),
  forward: (
    <>
      <path d='M21 11a9 9 0 1 0-2.4 6.1' />
      <path d='M21 4v7h-7' />
      <text
        x='11.5'
        y='15.5'
        fontSize='7.5'
        textAnchor='middle'
        stroke='none'
        fill='currentColor'
        fontWeight='700'
      >
        15
      </text>
    </>
  ),
  play: (
    <path
      d='M8 5.2v13.6a1 1 0 0 0 1.5.8l11-6.8a1 1 0 0 0 0-1.6l-11-6.8A1 1 0 0 0 8 5.2z'
      fill='currentColor'
      stroke='none'
    />
  ),
  pause: (
    <>
      <rect
        x='6'
        y='5'
        width='4.2'
        height='14'
        rx='1.2'
        fill='currentColor'
        stroke='none'
      />
      <rect
        x='13.8'
        y='5'
        width='4.2'
        height='14'
        rx='1.2'
        fill='currentColor'
        stroke='none'
      />
    </>
  ),
  previous: (
    <>
      <path d='M18 6v12l-9-6z' fill='currentColor' />
      <path d='M6 6v12' />
    </>
  ),
  next: (
    <>
      <path d='M6 6v12l9-6z' fill='currentColor' />
      <path d='M18 6v12' />
    </>
  ),
  volume: (
    <>
      <path d='M11 5 6 9H3v6h3l5 4z' />
      <path d='M15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12' />
    </>
  ),
  muted: (
    <>
      <path d='M11 5 6 9H3v6h3l5 4z' />
      <path d='m16 9 5 6M21 9l-5 6' />
    </>
  )
}

function Icon({
  name,
  size = 20
}: Readonly<{ name: IconName; size?: number }>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      {ICONS[name]}
    </svg>
  )
}

/** Equalizer bars: animated only while audio is actually producing sound. */
function Beats({
  live,
  synced,
  count = BEAT_COUNT,
  className = ''
}: Readonly<{
  live: boolean
  synced: boolean
  count?: number
  className?: string
}>) {
  return (
    <span
      className={`listen-beats ${className}`}
      data-live={live}
      data-synced={synced}
      aria-hidden='true'
    >
      {BEATS.slice(0, count).map((style, i) => (
        <i key={i} style={style} />
      ))}
    </span>
  )
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

/** Long sections are synthesized in several chunks that share one section id. */
function buildTracks(
  segments: ListenSegment[],
  titles: string[]
): ListenTrack[] {
  const totals = new Map<string, number>()
  segments.forEach((segment) =>
    totals.set(segment.id, (totals.get(segment.id) ?? 0) + 1)
  )
  const seen = new Map<string, number>()
  const ordinals = new Map<string, number>()
  return segments.map((segment) => {
    const part = (seen.get(segment.id) ?? 0) + 1
    seen.set(segment.id, part)
    if (!ordinals.has(segment.id)) ordinals.set(segment.id, ordinals.size + 1)
    const sectionIndex = Number(/(\d+)$/.exec(segment.id)?.[1] ?? Number.NaN)
    const title =
      titles[sectionIndex]?.trim() ||
      (sectionIndex === 0
        ? 'Introduction'
        : segment.text.trim().slice(0, 60) || 'Narration')
    const label =
      (totals.get(segment.id) ?? 1) > 1 ? `${title} (part ${part})` : title
    return { ...segment, label, sectionOrdinal: ordinals.get(segment.id) ?? 1 }
  })
}

export function ArticleListen({
  segments,
  titles = []
}: Readonly<ArticleListenProps>) {
  const audio = useRef<HTMLAudioElement>(null)
  const playerSection = useRef<HTMLElement>(null)
  const continuePlaying = useRef(false)
  const [portalTarget, setPortalTarget] = useState<Element | null>(null)
  const [compact, setCompact] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [live, setLive] = useState(false)
  const [rate, setRate] = useState(1)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState('')
  // With durations in the manifest nothing is fetched until the reader shows intent.
  const hasDurations = segments.every((segment) => (segment.duration ?? 0) > 0)
  const hasStarted = useRef(false)
  const [useCors, setUseCors] = useState(false)
  const syncMode = useAudioSyncMode(segments[0]?.url, true)
  const { connect, isSynced } = useAudioBeats(audio, useCors, live, compact)

  // Switch to CORS loading only before playback starts: media already fetched
  // without CORS would be silenced by the analyser.
  useEffect(() => {
    if (syncMode === 'cors' && !hasStarted.current) setUseCors(true)
  }, [syncMode])
  const isFirstCorsRender = useRef(true)
  useEffect(() => {
    if (isFirstCorsRender.current) isFirstCorsRender.current = false
    else audio.current?.load() // re-fetch with the new crossOrigin setting
  }, [useCors])

  // CORS and plain requests use different URLs so a cached plain response is
  // never reused for the analyser, which would silence it.
  const sourceUrl = (url: string) => (useCors ? `${url}${CORS_QUERY}` : url)

  const tracks = useMemo(
    () => buildTracks(segments, titles),
    [segments, titles]
  )
  const sectionCount = useMemo(
    () => new Set(segments.map((segment) => segment.id)).size,
    [segments]
  )
  const lastIndex = tracks.length - 1
  const active = tracks[index]

  // Restore where the reader stopped last time. Nothing is saved until they press play.
  const pendingSeek = useRef(0)
  const lastSavedAt = useRef(0)
  const [isResumed, setIsResumed] = useState(false)
  useEffect(() => {
    const saved = readListenProgress(tracks.length)
    if (!saved) return
    pendingSeek.current = saved.seconds
    setIndex(saved.index)
    setPosition(saved.seconds)
    setIsResumed(true)
  }, [tracks.length])

  // Warm the next section shortly before the current one ends to shorten the gap.
  const warmed = useRef<HTMLAudioElement | null>(null)
  useEffect(
    () => () => {
      warmed.current?.removeAttribute('src')
      warmed.current?.load()
    },
    []
  )
  const trackProgress = (el: HTMLAudioElement) => {
    const seconds = el.currentTime
    setPosition(seconds)
    if (Math.abs(seconds - lastSavedAt.current) >= SAVE_INTERVAL_SECONDS) {
      lastSavedAt.current = seconds
      saveListenProgress({ index, seconds })
    }
    const next = tracks[index + 1]
    const isNearEnd = el.duration - seconds < PRELOAD_LEAD_SECONDS
    if (next && isNearEnd && warmed.current?.src !== sourceUrl(next.url)) {
      const preload = new Audio()
      if (useCors) preload.crossOrigin = 'anonymous'
      preload.preload = 'auto'
      preload.src = sourceUrl(next.url)
      warmed.current = preload
    }
  }

  // The mini player is portaled inside the article theme scope so its colour tokens resolve.
  useEffect(() => {
    setPortalTarget(
      playerSection.current?.closest('.blog-article-page') ?? document.body
    )
    const header = document.querySelector('header')
    if (!header) return
    const measure = () => setHeaderHeight(header.offsetHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  // Show the mini player only once the full player has scrolled up behind the fixed header.
  useEffect(() => {
    const section = playerSection.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) =>
        setCompact(
          !entry.isIntersecting && entry.boundingClientRect.top < headerHeight
        ),
      { rootMargin: `-${headerHeight}px 0px 0px 0px` }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [headerHeight])

  // Resume automatically after a section change that happened during playback.
  useEffect(() => {
    if (!continuePlaying.current || !audio.current) return
    continuePlaying.current = false
    audio.current.play().catch(() => {
      setPlaying(false)
      setError(PLAY_ERROR)
    })
  }, [index])

  // Highlight the section being narrated and, when narration moves on to a new
  // section, bring that section into view. Pressing play never scrolls the page.
  const lastNarratedId = useRef<string | null>(null)
  useEffect(() => {
    if (!playing || !active) return
    const el = document.getElementById(active.id)
    if (!el) return
    el.dataset.listenActive = 'true'
    const hasMovedOn =
      lastNarratedId.current !== null && lastNarratedId.current !== active.id
    lastNarratedId.current = active.id
    if (hasMovedOn) {
      const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({
        behavior: isReduced ? 'auto' : 'smooth',
        block: 'start'
      })
    }
    return () => {
      delete el.dataset.listenActive
    }
  }, [playing, active])

  const goTo = (next: number, keepPlaying = playing) => {
    if (next === index || next < 0 || next > lastIndex) return
    continuePlaying.current = keepPlaying
    pendingSeek.current = 0
    lastSavedAt.current = 0
    setIsResumed(false)
    setLive(false)
    setPosition(0)
    setDuration(0)
    setError('')
    setIndex(next)
    if (hasStarted.current) saveListenProgress({ index: next, seconds: 0 })
  }
  const toggle = () => {
    const el = audio.current
    if (!el) return
    if (!el.paused) {
      el.pause()
      return
    }
    hasStarted.current = true
    connect()
    setError('')
    el.play().catch(() => {
      setPlaying(false)
      setError(PLAY_ERROR)
    })
  }
  const seekTo = (seconds: number) => {
    const el = audio.current
    if (!el || !Number.isFinite(el.duration)) return
    const next = Math.max(0, Math.min(el.duration, seconds))
    el.currentTime = next
    setPosition(next)
  }
  const skip = (delta: number) =>
    seekTo((audio.current?.currentTime ?? 0) + delta)
  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
    setRate(next)
    if (audio.current) {
      audio.current.defaultPlaybackRate = next
      audio.current.playbackRate = next
    }
  }
  const changeVolume = (next: number) => {
    setVolume(next)
    setMuted(next === 0)
    if (audio.current) {
      audio.current.volume = next
      audio.current.muted = next === 0
    }
  }
  const toggleMuted = () => {
    const next = !muted
    setMuted(next)
    if (audio.current) audio.current.muted = next
  }

  // Lock-screen / hardware media keys.
  const controls = useRef({ toggle, skip, goTo, index })
  controls.current = { toggle, skip, goTo, index }
  useEffect(() => {
    if (!active || !('mediaSession' in navigator)) return
    const session = navigator.mediaSession
    session.metadata = new MediaMetadata({
      title: active.label,
      artist: document.title,
      album: 'Article narration'
    })
    const handlers: [MediaSessionAction, () => void][] = [
      ['play', () => controls.current.toggle()],
      ['pause', () => controls.current.toggle()],
      ['seekbackward', () => controls.current.skip(-SKIP_SECONDS)],
      ['seekforward', () => controls.current.skip(SKIP_SECONDS)],
      [
        'previoustrack',
        () => controls.current.goTo(controls.current.index - 1)
      ],
      ['nexttrack', () => controls.current.goTo(controls.current.index + 1)]
    ]
    handlers.forEach(([action, handler]) => {
      try {
        session.setActionHandler(action, handler)
      } catch {
        /* action unsupported by this browser */
      }
    })
    return () =>
      handlers.forEach(([action]) => {
        try {
          session.setActionHandler(action, null)
        } catch {
          /* action unsupported by this browser */
        }
      })
  }, [active])

  if (!active) return null

  const shownDuration = duration || active.duration || 0
  const totalSeconds = hasDurations
    ? segments.reduce((sum, segment) => sum + (segment.duration ?? 0), 0)
    : 0
  const progress = shownDuration
    ? Math.min(100, (position / shownDuration) * 100)
    : 0
  const progressStyle = { '--listen-progress': `${progress}%` } as CSSProperties
  const idleEyebrow = isResumed
    ? 'Continue listening'
    : 'Listen to this article'
  const eyebrow = playing ? 'Now playing' : idleEyebrow
  const playLabel = playing ? 'Pause narration' : 'Play narration'
  const scrubber = (
    <input
      className='listen-scrubber'
      style={progressStyle}
      aria-label='Seek within current section'
      aria-valuetext={`${formatTime(position)} of ${formatTime(shownDuration)}`}
      type='range'
      min={0}
      max={duration || 1}
      step={0.1}
      value={Math.min(position, duration || 1)}
      disabled={!duration}
      onChange={(e) => seekTo(Number(e.target.value))}
    />
  )

  return (
    <>
      <section
        ref={playerSection}
        className='article-listen'
        data-playing={playing}
        aria-label='Listen to this article'
      >
        <audio
          ref={audio}
          src={sourceUrl(active.url)}
          crossOrigin={useCors ? 'anonymous' : undefined}
          preload={hasDurations ? 'none' : 'metadata'}
          onPlay={() => {
            hasStarted.current = true
            setPlaying(true)
          }}
          onPlaying={() => setLive(true)}
          onWaiting={() => setLive(false)}
          onPause={(e) => {
            setLive(false)
            if (!e.currentTarget.ended)
              saveListenProgress({
                index,
                seconds: e.currentTarget.currentTime
              })
            if (!(e.currentTarget.ended && index < lastIndex)) setPlaying(false)
          }}
          onTimeUpdate={(e) => trackProgress(e.currentTarget)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration)
            if (pendingSeek.current > 0) {
              e.currentTarget.currentTime = Math.min(
                pendingSeek.current,
                Math.max(0, e.currentTarget.duration - 1)
              )
              pendingSeek.current = 0
            }
            e.currentTarget.defaultPlaybackRate = rate
            e.currentTarget.playbackRate = rate
          }}
          onError={() => {
            setPlaying(false)
            setLive(false)
            // A cached "CORS allowed" verdict went stale: fall back to plain loading.
            if (useCors && !isSynced) {
              forgetAudioSyncMode()
              hasStarted.current = true
              setUseCors(false)
              return
            }
            setError(LOAD_ERROR)
          }}
          onEnded={() => {
            if (index < lastIndex) goTo(index + 1, true)
            else {
              clearListenProgress()
              setPlaying(false)
              setLive(false)
              setPosition(0)
              setIndex(0)
            }
          }}
        />

        <div className='listen-top'>
          <button
            className='listen-play'
            type='button'
            data-live={live}
            onClick={toggle}
            aria-label={playLabel}
          >
            <Icon name={playing ? 'pause' : 'play'} size={28} />
          </button>
          <div className='listen-now'>
            <p className='listen-eyebrow'>{eyebrow}</p>
            <h2 className='listen-title'>{active.label}</h2>
            <p className='listen-meta'>
              Section {active.sectionOrdinal} of {sectionCount}
              {totalSeconds > 0
                ? ` · ${Math.max(1, Math.round(totalSeconds / 60))} min listen`
                : ''}{' '}
              · Highlights follow narration
            </p>
          </div>
          <Beats live={live} synced={isSynced} className='listen-visualizer' />
        </div>

        <div className='listen-timeline'>
          <span className='listen-time'>{formatTime(position)}</span>
          {scrubber}
          <span className='listen-time'>{formatTime(shownDuration)}</span>
        </div>

        <div className='listen-controls'>
          <div
            className='listen-transport'
            role='group'
            aria-label='Playback controls'
          >
            <button
              className='listen-icon-button'
              type='button'
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label='Previous section'
            >
              <Icon name='previous' />
            </button>
            <button
              className='listen-icon-button'
              type='button'
              onClick={() => skip(-SKIP_SECONDS)}
              aria-label={`Back ${SKIP_SECONDS} seconds`}
            >
              <Icon name='back' size={22} />
            </button>
            <button
              className='listen-icon-button'
              type='button'
              onClick={() => skip(SKIP_SECONDS)}
              aria-label={`Forward ${SKIP_SECONDS} seconds`}
            >
              <Icon name='forward' size={22} />
            </button>
            <button
              className='listen-icon-button'
              type='button'
              onClick={() => goTo(index + 1)}
              disabled={index === lastIndex}
              aria-label='Next section'
            >
              <Icon name='next' />
            </button>
          </div>
          <button
            className='listen-rate'
            type='button'
            onClick={cycleRate}
            aria-label={`Playback speed ${rate}×. Change speed`}
          >
            {rate}×
          </button>
          <label className='listen-section-picker'>
            <span className='listen-visually-hidden'>
              Choose narration section
            </span>
            <select
              value={index}
              onChange={(e) => goTo(Number(e.target.value))}
            >
              {tracks.map((track, i) => (
                <option value={i} key={track.url}>
                  {track.sectionOrdinal}. {track.label}
                </option>
              ))}
            </select>
          </label>
          <div className='listen-volume'>
            <button
              className='listen-icon-button'
              type='button'
              onClick={toggleMuted}
              aria-pressed={muted}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              <Icon name={muted ? 'muted' : 'volume'} />
            </button>
            <input
              className='listen-scrubber'
              style={
                {
                  '--listen-progress': `${muted ? 0 : volume * 100}%`
                } as CSSProperties
              }
              aria-label='Volume'
              type='range'
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
            />
          </div>
        </div>
        {error && (
          <p className='listen-error' role='alert'>
            {error}
          </p>
        )}
      </section>

      {portalTarget &&
        compact &&
        createPortal(
          <aside
            className='article-listen-floating'
            style={{ top: headerHeight }}
            aria-label='Mini audio player'
          >
            <button
              className='listen-play listen-play-small'
              type='button'
              onClick={toggle}
              aria-label={playLabel}
            >
              <Icon name={playing ? 'pause' : 'play'} size={18} />
            </button>
            <Beats
              live={live}
              synced={isSynced}
              count={MINI_BEAT_COUNT}
              className='listen-mini-beats'
            />
            <p className='listen-mini-title'>{active.label}</p>
            <span className='listen-time'>
              {formatTime(position)} / {formatTime(shownDuration)}
            </span>
            <button
              className='listen-icon-button'
              type='button'
              onClick={() => skip(-SKIP_SECONDS)}
              aria-label={`Back ${SKIP_SECONDS} seconds`}
            >
              <Icon name='back' />
            </button>
            <button
              className='listen-icon-button'
              type='button'
              onClick={() => skip(SKIP_SECONDS)}
              aria-label={`Forward ${SKIP_SECONDS} seconds`}
            >
              <Icon name='forward' />
            </button>
            <button
              className='listen-rate listen-mini-rate'
              type='button'
              onClick={cycleRate}
              aria-label={`Playback speed ${rate}×. Change speed`}
            >
              {rate}×
            </button>
            {scrubber}
          </aside>,
          portalTarget
        )}
    </>
  )
}
