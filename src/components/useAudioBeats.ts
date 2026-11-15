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

/**
 * Web Audio taints cross-origin media that is served without CORS headers, which would mute playback.
 * Probe once so the analyser is only used when the storage bucket allows this origin.
 * Touch devices keep plain playback so lock-screen and background listening keep working.
 */
export function useAudioSyncMode(probeUrl: string | undefined): AudioSyncMode {
  const [mode, setMode] = useState<AudioSyncMode>('pending')
  useEffect(() => {
    const isEligible = Boolean(probeUrl)
      && typeof AudioContext !== 'undefined'
      && matchMedia('(hover: hover) and (pointer: fine)').matches
      && !matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isEligible || !probeUrl) { setMode('plain'); return }
    const probe = new Audio()
    probe.crossOrigin = 'anonymous'
    probe.preload = 'metadata'
    probe.onloadedmetadata = () => setMode('cors')
    probe.onerror = () => setMode('plain')
    probe.src = probeUrl
    return () => { probe.onloadedmetadata = null; probe.onerror = null; probe.removeAttribute('src'); probe.load() }
    // Probe only once per page: every segment is served by the same bucket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return mode
}

/**
 * Drives every `.listen-beats` bar from the live frequency spectrum of the audio element.
 * `connect` must be called from a user gesture (the play button) to satisfy autoplay policies.
 */
export function useAudioBeats(audio: RefObject<HTMLAudioElement | null>, isEnabled: boolean, isLive: boolean, layoutKey: unknown) {
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
        graph.current = { context, analyser, data: new Uint8Array(analyser.frequencyBinCount) }
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
    const groups = Array.from(document.querySelectorAll<HTMLElement>(BAR_SELECTOR), group => Array.from(group.children) as HTMLElement[])
    let frame = 0
    const draw = () => {
      current.analyser.getByteFrequencyData(current.data)
      for (const bars of groups) {
        const span = SPEECH_BINS / bars.length
        bars.forEach((bar, i) => {
          const start = Math.floor(i * span)
          const end = Math.max(start + 1, Math.floor((i + 1) * span))
          let peak = 0
          for (let bin = start; bin < end; bin++) peak = Math.max(peak, current.data[bin])
          bar.style.transform = `scaleY(${Math.max(MIN_BAR_SCALE, peak / 255).toFixed(3)})`
        })
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      groups.flat().forEach(bar => { bar.style.transform = '' })
    }
  }, [isLive, isSynced, layoutKey])

  useEffect(() => () => { void graph.current?.context.close() }, [])

  return { connect, isSynced }
}
