'use client'

import { useEffect, useRef, useState } from 'react'

export interface ListenSegment { id: string; text: string; url: string; duration?: number }
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}
export function ArticleListen({ segments }: { segments: ListenSegment[] }) {
  const audio = useRef<HTMLAudioElement>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const [compact, setCompact] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const continuePlaying = useRef(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState('')
  useEffect(() => {
    const update = () => { if (anchor.current) setCompact(anchor.current.getBoundingClientRect().top < -100) }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])
  const active = segments[index]
  const estimatedDuration = segments.reduce((sum, segment) => sum + (segment.duration || 0), 0)

  useEffect(() => {
    if (continuePlaying.current && audio.current) {
      continuePlaying.current = false
      void audio.current.play().catch(() => { setPlaying(false); setError('Audio could not be played. Please try again.') })
    }
  }, [index])
  useEffect(() => {
    document.querySelectorAll('[data-listen-active]').forEach(el => el.removeAttribute('data-listen-active'))
    if (!playing || !active) return
    const el = document.getElementById(active.id)
    el?.setAttribute('data-listen-active', 'true')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    return () => { el?.removeAttribute('data-listen-active') }
  }, [index, playing, active])

  if (!segments.length) return null
  const play = async () => {
    if (!audio.current) return
    if (playing) { audio.current.pause(); return }
    setError('')
    try { await audio.current.play() } catch { setPlaying(false); setError('Audio could not be played. Please try again.') }
  }
  const seek = (seconds: number) => {
    if (!audio.current || !Number.isFinite(audio.current.duration)) return
    audio.current.currentTime = Math.max(0, Math.min(audio.current.duration, audio.current.currentTime + seconds))
  }
  const selectSection = (next: number) => {
    if (next === index) return
    continuePlaying.current = playing
    setPlaying(false)
    setPosition(0)
    setDuration(0)
    setError('')
    setIndex(next)
  }
  const sectionLabel = (segment: ListenSegment, number: number) =>
    `Section ${number + 1}: ${segment.text.trim().slice(0, 65) || 'Narration'}`

  return <><div ref={anchor} className='article-listen-anchor' aria-hidden='true' /><section className={`article-listen${compact ? ' article-listen-compact' : ''}${expanded ? ' article-listen-expanded' : ''}`} aria-label='Listen to this article'>
    <audio ref={audio} src={active.url} preload='metadata'
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onTimeUpdate={e => setPosition(e.currentTarget.currentTime)}
      onLoadedMetadata={e => { setDuration(e.currentTarget.duration); e.currentTarget.playbackRate = rate; e.currentTarget.volume = volume }}
      onError={() => { setPlaying(false); setError('This audio segment is unavailable right now.') }}
      onEnded={() => { if (index < segments.length - 1) { continuePlaying.current = true; setPosition(0); setDuration(0); setIndex(i => i + 1) } else { setPlaying(false); setPosition(0); setIndex(0) } }}
    />
    {compact && <button type='button' className='article-listen-expand' onClick={() => setExpanded(value => !value)} aria-label={expanded ? 'Collapse audio player' : 'Expand audio player'} aria-expanded={expanded}>{expanded ? '⌃' : '⌄'}</button>}
    <div className='article-listen-header'>
      <div className='article-listen-heading'>
        <span className='article-listen-headphones' aria-hidden='true'>♫</span>
        <div><h2>Listen to this article</h2><p>A narrated version for easy, hands-free reading.</p></div>
      </div>
      <span className='article-listen-badge'>{segments.length} sections{estimatedDuration > 0 ? ` · ${Math.ceil(estimatedDuration / 60)} min` : ''}</span>
    </div>
    <div className='article-listen-main'>
      <div className='article-listen-transport'>
        <button className='article-listen-skip' type='button' onClick={() => seek(-15)} aria-label='Back 15 seconds'>↶<small>15</small></button>
        <button className='article-listen-play' type='button' onClick={play} aria-label={playing ? 'Pause narration' : 'Play narration'}>{playing ? 'Ⅱ' : '▶'}</button>
        <button className='article-listen-skip' type='button' onClick={() => seek(15)} aria-label='Forward 15 seconds'>↷<small>15</small></button>
      </div>
      <div className='article-listen-timeline'>
        <span className='article-listen-time'>{formatTime(position)}</span>
        <input aria-label='Seek within current section' type='range' min={0} max={duration || 1} step={0.1} value={Math.min(position, duration || 1)}
          style={{ background: `linear-gradient(to right, var(--article-accent) ${duration ? position / duration * 100 : 0}%, var(--article-border) 0%)` }}
          onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value) }} />
        <span className='article-listen-time'>{formatTime(duration)}</span>
      </div>
    </div>
    <div className='article-listen-footer'>
      <label className='article-listen-field'><span>Speed</span><select aria-label='Playback speed' value={rate} onChange={e => { const r = Number(e.target.value); setRate(r); if (audio.current) audio.current.playbackRate = r }}>
        {[0.75,1,1.25,1.5,2].map(n => <option value={n} key={n}>{n}×</option>)}
      </select></label>
      <label className='article-listen-field article-listen-section'><span>Section</span><select aria-label='Choose narration section' value={index} onChange={e => selectSection(Number(e.target.value))}>
        {segments.map((segment, i) => <option value={i} key={segment.id}>{sectionLabel(segment, i)}</option>)}
      </select></label>
      <label className='article-listen-field article-listen-volume'><span>Volume</span><input aria-label='Volume' type='range' min={0} max={1} step={0.05} value={volume} onChange={e => { const v = Number(e.target.value); setVolume(v); if (audio.current) audio.current.volume = v }} /></label>
    </div>
    <p className='article-listen-status'>Section {index + 1} of {segments.length} · Article highlights follow narration</p>
    {error && <p className='article-listen-error' role='alert'>{error}</p>}
  </section></>
}
