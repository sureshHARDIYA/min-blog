import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

export type AudioSyncMode = 'pending' | 'cors' | 'plain'

interface AudioGraph {
  context: AudioContext
  analyser: AnalyserNode
  data: Uint8Array<ArrayBuffer>
}

const FFT_SIZE = 256
/** Bins 0..SPEECH_BINS cover roughly 0–6 kHz, where narration energy lives. */
const SPEECH_BINS = 32
const MIN_BAR_SCALE = 0.08
const BAR_SELECTOR = '.listen-beats'

const SYNC_CACHE_KEY = 'article-listen-sync'

function readCachedMode(origin: string): AudioSyncMode | null {
  try {
    const [cachedOrigin, mode] = (
      sessionStorage.getItem(SYNC_CACHE_KEY) ?? ''
    ).split('|')
    return cachedOrigin === origin && (mode === 'cors' || mode === 'plain')
      ? mode
      : null
  } catch {
    return null // storage blocked: probe again
  }
}

function cacheMode(origin: string, mode: AudioSyncMode | null) {
  try {
    if (mode) sessionStorage.setItem(SYNC_CACHE_KEY, `${origin}|${mode}`)
    else sessionStorage.removeItem(SYNC_CACHE_KEY)
  } catch {
    // storage blocked: the probe simply runs again next time
  }
}

/** Forget a cached "cors" verdict, e.g. after the bucket's CORS policy was removed. */
export function forgetAudioSyncMode() {
  cacheMode('', null)
}

/**
 * Web Audio taints cross-origin media that is served without CORS headers, which would mute playback.
 * Probe once the reader shows intent (`isArmed`) so the analyser is only used when the storage
 * bucket allows this origin; the verdict is cached for the browser session.
 * Touch devices keep plain playback so lock-screen and background listening keep working.
 */
export function useAudioSyncMode(
  probeUrl: string | undefined,
  isArmed: boolean
): AudioSyncMode {
  const [mode, setMode] = useState<AudioSyncMode>('pending')
  useEffect(() => {
    if (mode !== 'pending') return
    const isEligible =
      Boolean(probeUrl) &&
      typeof AudioContext !== 'undefined' &&
      matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isEligible || !probeUrl) {
      setMode('plain')
      return
    }
    const origin = new URL(probeUrl).origin
    const cached = readCachedMode(origin)
    if (cached) {
      setMode(cached)
      return
    }
    if (!isArmed) return
    const settle = (next: AudioSyncMode) => {
      cacheMode(origin, next)
      setMode(next)
    }
    const probe = new Audio()
    probe.crossOrigin = 'anonymous'
    probe.preload = 'metadata'
    probe.onloadedmetadata = () => settle('cors')
    probe.onerror = () => settle('plain')
    probe.src = `${probeUrl}?cors=1`
    return () => {
      probe.onloadedmetadata = null
      probe.onerror = null
      probe.removeAttribute('src')
      probe.load()
    }
  }, [probeUrl, isArmed, mode])
  return mode
}

/**
 * Drives every `.listen-beats` bar from the live frequency spectrum of the audio element.
 * `connect` must be called from a user gesture (the play button) to satisfy autoplay policies.
 */
export function useAudioBeats(
  audio: RefObject<HTMLAudioElement | null>,
  isEnabled: boolean,
  isLive: boolean,
  layoutKey: unknown
) {
  const graph = useRef<AudioGraph | null>(null)
  const [isSynced, setIsSynced] = useState(false)

  const connect = useCallback(() => {
    if (!isEnabled || !audio.current) return
    if (!graph.current) {
      try {
        const context = new AudioContext()
        const analyser = context.createAnalyser()
        analyser.fftSize = FFT_SIZE
        analyser.smoothingTimeConstant = 0.72
        context.createMediaElementSource(audio.current).connect(analyser)
        analyser.connect(context.destination)
        graph.current = {
          context,
          analyser,
          data: new Uint8Array(analyser.frequencyBinCount)
        }
        setIsSynced(true)
      } catch {
        return // Web Audio unavailable: the CSS animation remains as the fallback.
      }
    }
    void graph.current.context.resume()
  }, [audio, isEnabled])

  useEffect(() => {
    const current = graph.current
    if (!isLive || !isSynced || !current) return
    const groups = Array.from(
      document.querySelectorAll<HTMLElement>(BAR_SELECTOR),
      (group) => Array.from(group.children) as HTMLElement[]
    )
    let frame = 0
    const draw = () => {
      current.analyser.getByteFrequencyData(current.data)
      for (const bars of groups) {
        const span = SPEECH_BINS / bars.length
        bars.forEach((bar, i) => {
          const start = Math.floor(i * span)
          const end = Math.max(start + 1, Math.floor((i + 1) * span))
          let peak = 0
          for (let bin = start; bin < end; bin++)
            peak = Math.max(peak, current.data[bin])
          bar.style.transform = `scaleY(${Math.max(MIN_BAR_SCALE, peak / 255).toFixed(3)})`
        })
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      groups.flat().forEach((bar) => {
        bar.style.transform = ''
      })
    }
  }, [isLive, isSynced, layoutKey])

  useEffect(
    () => () => {
      void graph.current?.context.close()
    },
    []
  )

  return { connect, isSynced }
}
