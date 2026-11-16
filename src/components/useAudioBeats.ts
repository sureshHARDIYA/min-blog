import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

export type AudioSyncMode = 'pending' | 'cors' | 'plain'

interface AudioGraph {
  context: AudioContext
  analyser: AnalyserNode
  data: Uint8Array<ArrayBuffer>
}

const FFT_SIZE = 256
/** Bins 1..SPEECH_BINS cover roughly 200 Hz–3.5 kHz, where a narrator's voice carries its energy. */
const SPEECH_BINS = 18
const MIN_BAR_SCALE = 0.08
/** Loudness window in dB mapped onto the bars: quiet speech near the bottom, loud near the top. */
const MIN_DECIBELS = -88
const MAX_DECIBELS = -22
/** Widens the gap between quiet and loud so pauses and emphasis are visible. */
const CONTRAST = 1.7
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
        analyser.smoothingTimeConstant = 0.6
        analyser.minDecibels = MIN_DECIBELS
        analyser.maxDecibels = MAX_DECIBELS
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
        // Mirror the spectrum around the centre: the strongest voice bands sit in
        // the middle and the quieter, higher bands fan out to both edges.
        const middle = (bars.length - 1) / 2 || 1
        bars.forEach((bar, i) => {
          const distance = Math.abs(i - middle) / middle
          const bin = 1 + Math.round(distance * (SPEECH_BINS - 1))
          const peak = Math.max(current.data[bin], current.data[bin + 1] ?? 0)
          const level = Math.pow(peak / 255, CONTRAST)
          bar.style.transform = `scaleY(${Math.max(MIN_BAR_SCALE, level).toFixed(3)})`
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
