'use client'

import { useEffect, useRef, useState } from 'react'

export interface ListenSegment { id: string; text: string; url: string; duration?: number }
export function ArticleListen({ segments }: { segments: ListenSegment[] }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const continuePlaying = useRef(false)
  useEffect(() => { if (continuePlaying.current && audio.current) { continuePlaying.current = false; void audio.current.play().catch(() => setPlaying(false)) } }, [index])
  const active = segments[index]
  useEffect(() => {
    document.querySelectorAll('[data-listen-active]').forEach(el => el.removeAttribute('data-listen-active'))
    if (!playing || !active) return
    const el = document.getElementById(active.id)
    el?.setAttribute('data-listen-active', 'true')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return () => { el?.removeAttribute('data-listen-active') }
  }, [index, playing, active])
  if (!segments.length) return null
  const play = async () => {
    if (!audio.current) return
    if (playing) { audio.current.pause(); return }
    try { await audio.current.play() } catch { setPlaying(false) }
  }
  const seek = (seconds: number) => {
    if (!audio.current) return
    audio.current.currentTime = Math.max(0, Math.min(audio.current.duration || 0, audio.current.currentTime + seconds))
  }
  return <div className='article-listen' aria-label='Listen to this article'>
    <audio ref={audio} src={active.url} preload='none' playbackRate={rate}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onTimeUpdate={e => setPosition(e.currentTarget.currentTime)}
      onLoadedMetadata={e => { setDuration(e.currentTarget.duration); e.currentTarget.playbackRate = rate }}
      onEnded={() => { if (index < segments.length - 1) { continuePlaying.current = true; setIndex(i => i + 1) } else { setPlaying(false); setIndex(0) } }}
    />
    <div className='article-listen-controls'>
      <span className='article-listen-label'>LISTEN TO ARTICLE</span>
      <button type='button' onClick={play} aria-label={playing ? 'Pause narration' : 'Play narration'}>{playing ? 'Ⅱ Pause' : '▶ Play'}</button>
      <button type='button' onClick={() => seek(-15)} aria-label='Back 15 seconds'>↶ 15s</button>
      <button type='button' onClick={() => seek(15)} aria-label='Forward 15 seconds'>15s ↷</button>
      <select aria-label='Playback speed' value={rate} onChange={e => { const r = Number(e.target.value); setRate(r); if (audio.current) audio.current.playbackRate = r }}>
        {[0.75,1,1.25,1.5,2].map(n => <option value={n} key={n}>{n}×</option>)}
      </select>
    </div>
    <input aria-label='Section progress' type='range' min={0} max={duration || 1} step={0.1} value={position}
      onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value) }} />
    <span className='article-listen-status'>Section {index + 1} of {segments.length} · Highlight follows narrated sections</span>
  </div>
}
