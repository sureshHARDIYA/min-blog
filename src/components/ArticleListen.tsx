'use client'

import { useEffect, useRef, useState } from 'react'

function PlayerIcon({ name, size = 20 }: { name: 'headphones' | 'back' | 'forward' | 'play' | 'pause' | 'volume' | 'list' | 'chevron'; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    headphones: <><path d="M3 14v-3a9 9 0 0 1 18 0v3"/><rect x="2" y="13" width="4" height="8" rx="2"/><rect x="18" y="13" width="4" height="8" rx="2"/></>,
    back: <><path d="M3 11a9 9 0 1 1 2.4 6.1"/><path d="M3 4v7h7"/><text x="12" y="16" fontSize="8" textAnchor="middle" stroke="none" fill="currentColor" fontWeight="700">15</text></>,
    forward: <><path d="M21 11a9 9 0 1 0-2.4 6.1"/><path d="M21 4v7h-7"/><text x="12" y="16" fontSize="8" textAnchor="middle" stroke="none" fill="currentColor" fontWeight="700">15</text></>,
    play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>,
    pause: <><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></>,
    volume: <><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12"/><path d="M3 6h.01M3 12h.01M3 18h.01" strokeWidth="3"/></>,
    chevron: <path d="m6 9 6 6 6-6"/>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
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
  const [headerBottom, setHeaderBottom] = useState(0)
  const continuePlaying = useRef(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  useEffect(() => {
    const update = () => {
      const bottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      setHeaderBottom(Math.max(0, bottom))
      if (anchor.current) setCompact(anchor.current.getBoundingClientRect().top < -bottom - 24)
    }
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
    // Do not scroll the document automatically when narration begins.
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

  return <><div ref={anchor} className='article-listen-anchor' aria-hidden='true' /><section className='article-listen' aria-label='Listen to this article'>
    <audio ref={audio} src={active.url} preload='metadata'
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onTimeUpdate={e => setPosition(e.currentTarget.currentTime)}
      onLoadedMetadata={e => { setDuration(e.currentTarget.duration); e.currentTarget.playbackRate = rate; e.currentTarget.volume = volume }}
      onError={() => { setPlaying(false); setError('This audio segment is unavailable right now.') }}
      onEnded={() => { if (index < segments.length - 1) { continuePlaying.current = true; setPosition(0); setDuration(0); setIndex(i => i + 1) } else { setPlaying(false); setPosition(0); setIndex(0) } }}
    />

    <div className='article-listen-header'>
      <div className='article-listen-heading'>
        <span className='article-listen-headphones'><PlayerIcon name='headphones' size={27} /></span>
        <div><h2>Listen to this article</h2><p>A narrated version for easy, hands-free reading.</p></div>
      </div>
      <span className='article-listen-badge'><span className='article-listen-wave' aria-hidden='true'>▂▅▇▅▂</span>{segments.length} sections{estimatedDuration > 0 ? ` · ${Math.ceil(estimatedDuration / 60)} min` : ''}</span>
    </div>
    <div className='article-listen-main'>
      <div className='article-listen-transport'>
        <button className='article-listen-skip' type='button' onClick={() => seek(-15)} aria-label='Back 15 seconds'><PlayerIcon name='back' size={24} /></button>
        <button className='article-listen-play' type='button' onClick={play} aria-label={playing ? 'Pause narration' : 'Play narration'}>{<PlayerIcon name={playing ? 'pause' : 'play'} size={26} />}</button>
        <button className='article-listen-skip' type='button' onClick={() => seek(15)} aria-label='Forward 15 seconds'><PlayerIcon name='forward' size={24} /></button>
      </div>
      <div className='article-listen-timeline'>
        <span className='article-listen-time'>{formatTime(position)}</span>
        <input aria-label='Seek within current section' type='range' min={0} max={duration || 1} step={0.1} value={Math.min(position, duration || 1)}
          style={{ background: `linear-gradient(to right, var(--article-accent) ${duration ? position / duration * 100 : 0}%, var(--article-border) 0%)` }}
          onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value) }} />
        <span className='article-listen-time'>{formatTime(duration)}</span>
      </div>
    </div>
    <button className='article-listen-mobile-options' type='button' aria-expanded={showOptions} onClick={() => setShowOptions(v => !v)}>{showOptions ? 'Hide options' : 'Playback options'} <PlayerIcon name='chevron' size={16} /></button>
    <div className={`article-listen-footer${showOptions ? ' article-listen-footer-open' : ''}`}>
      <label className='article-listen-field'><span>Speed</span><select aria-label='Playback speed' value={rate} onChange={e => { const r = Number(e.target.value); setRate(r); if (audio.current) audio.current.playbackRate = r }}>
        {[0.75,1,1.25,1.5,2].map(n => <option value={n} key={n}>{n}×</option>)}
      </select></label>
      <label className='article-listen-field article-listen-section'><span>Section</span><select aria-label='Choose narration section' value={index} onChange={e => selectSection(Number(e.target.value))}>
        {segments.map((segment, i) => <option value={i} key={segment.id}>{sectionLabel(segment, i)}</option>)}
      </select></label>
      <label className='article-listen-field article-listen-volume'><PlayerIcon name='volume' size={20} /><span className='article-listen-visually-hidden'>Volume</span><input aria-label='Volume' type='range' min={0} max={1} step={0.05} value={volume} onChange={e => { const v = Number(e.target.value); setVolume(v); if (audio.current) audio.current.volume = v }} /></label>
    </div>
    <p className='article-listen-status'>Section {index + 1} of {segments.length} · Highlights follow narration</p>
    {error && <p className='article-listen-error' role='alert'>{error}</p>}
  </section>
    {compact && <aside className='article-listen-floating' style={{ top: headerBottom }} aria-label='Floating audio controls'>
      <div className='article-listen-floating-row'>
        <button type='button' onClick={() => seek(-15)} aria-label='Back 15 seconds'><PlayerIcon name='back' size={20} /></button>
        <button type='button' className='article-listen-floating-play' onClick={play} aria-label={playing ? 'Pause narration' : 'Play narration'}><PlayerIcon name={playing ? 'pause' : 'play'} size={20} /></button>
        <button type='button' onClick={() => seek(15)} aria-label='Forward 15 seconds'><PlayerIcon name='forward' size={20} /></button>
        <span className='article-listen-floating-time'>{formatTime(position)}</span>
        <input type='range' aria-label='Seek within current section' min={0} max={duration || 1} step={0.1} value={Math.min(position, duration || 1)} onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value) }} />
        <span className='article-listen-floating-time'>{formatTime(duration)}</span>
        <button type='button' onClick={() => setExpanded(v => !v)} aria-label={expanded ? 'Hide player options' : 'Show player options'} aria-expanded={expanded}><PlayerIcon name='chevron' size={18} /></button>
      </div>
      {expanded && <div className='article-listen-floating-options'>
        <label>Speed <select aria-label='Floating playback speed' value={rate} onChange={e => { const next = Number(e.target.value); setRate(next); if (audio.current) audio.current.playbackRate = next }}>{[0.75,1,1.25,1.5,2].map(n => <option key={n} value={n}>{n}×</option>)}</select></label>
        <label>Section <select aria-label='Floating section selection' value={index} onChange={e => selectSection(Number(e.target.value))}>{segments.map((segment,i) => <option key={segment.id} value={i}>{sectionLabel(segment,i)}</option>)}</select></label>
      </div>}
    </aside>}
  </>
}
