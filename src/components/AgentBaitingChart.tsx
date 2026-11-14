'use client'

import { useState } from 'react'

const counts = [
  { label: 'All FakeGit repositories', short: 'All repositories', count: 7600, display: '~7,600', note: 'Campaign-wide reported repository count; not infected organizations.' },
  { label: 'AI-themed repositories', short: 'AI-themed', count: 1400, display: '~1,400', note: 'AI-themed repositories are part of the 7,600 total, not additional repositories.' },
  { label: 'Fake Skills / MCP servers', short: 'Skills / MCP', count: 800, display: '800+', note: 'Conservative lower bound: the original report says more than 800. It is nested within the AI-themed subset.' }
] as const

type View = 'count' | 'share'
const maximum = 7600
const format = (value: number) => new Intl.NumberFormat('en-US').format(value)

export function AgentBaitingChart() {
  const [view, setView] = useState<View>('count')
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const active = hovered ?? selected
  const x0 = 170
  const chartWidth = 550
  const chartTop = 34
  const barGap = 96

  return (
    <figure className='agentbaiting-chart' aria-labelledby='agentbaiting-chart-title'>
      <figcaption className='agentbaiting-chart-title' id='agentbaiting-chart-title'>Explore the reported FakeGit campaign</figcaption>
      <p className='agentbaiting-chart-source'>Researcher-reported counts, July 2026 · Interactive comparison, not live telemetry</p>
      <div className='agentbaiting-chart-stats'>
        {counts.map((item, index) => (
          <button
            type='button'
            aria-pressed={selected === index}
            className={selected === index ? 'agentbaiting-stat is-active' : 'agentbaiting-stat'}
            key={item.label}
            onClick={() => setSelected(index)}
          >
            <strong>{item.display}</strong><span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className='mt-6 flex flex-wrap gap-2' role='group' aria-label='Graph display mode'>
        <button type='button' aria-pressed={view === 'count'} onClick={() => setView('count')} className={view === 'count' ? 'rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950' : 'rounded-md border border-slate-500 px-4 py-2 text-sm text-inherit'}>Reported counts</button>
        <button type='button' aria-pressed={view === 'share'} onClick={() => setView('share')} className={view === 'share' ? 'rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950' : 'rounded-md border border-slate-500 px-4 py-2 text-sm text-inherit'}>Share of campaign</button>
      </div>
      <div className='mt-5 w-full overflow-x-auto'>
        <svg viewBox='0 0 790 370' className='w-full min-w-[310px]' role='img' aria-label={view === 'count' ? 'Interactive horizontal bar chart of three overlapping FakeGit repository counts' : 'Interactive horizontal bar chart showing percentages of 7,600 campaign repositories'}>
          {[0, .25, .5, .75, 1].map((tick) => {
            const x = x0 + chartWidth * tick
            return <g key={tick}>
              <line x1={x} x2={x} y1={20} y2={326} stroke='currentColor' strokeOpacity='.16' strokeDasharray='4 5' />
              <text x={x} y={352} textAnchor='middle' fill='currentColor' fontSize='15'>{view === 'count' ? format(maximum * tick) : `${Math.round(tick * 100)}%`}</text>
            </g>
          })}
          {counts.map((item, index) => {
            const y = chartTop + index * barGap
            const percent = item.count / maximum
            const isActive = active === index
            return <g key={item.label} tabIndex={0} role='button' aria-label={`${item.label}: ${item.display}, about ${(percent * 100).toFixed(1)} percent of campaign repositories`} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(index) } }} style={{ cursor: 'pointer', outline: 'none' }}>
              <text x={x0 - 14} y={y + 31} textAnchor='end' fill='currentColor' fontSize='17' fontWeight={isActive ? 700 : 400}>{item.short}</text>
              <rect x={x0} y={y} width={chartWidth} height={48} rx={7} fill='currentColor' fillOpacity='.09' />
              <rect x={x0} y={y} width={chartWidth * percent} height={48} rx={7} fill={isActive ? '#67e8f9' : '#0891b2'} style={{ transition: 'fill .2s ease' }} />
              <text x={Math.min(x0 + chartWidth * percent + 12, 750)} y={y + 31} fill='currentColor' fontSize='17' fontWeight='bold'>{view === 'count' ? item.display : `${(percent * 100).toFixed(1)}%`}</text>
              <rect x={0} y={y - 6} width={780} height={60} fill='transparent' />
            </g>
          })}
        </svg>
      </div>
      <div aria-live='polite' className='agentbaiting-chart-note'>
        <strong>{counts[active].label}: {view === 'count' ? counts[active].display : `${(counts[active].count / maximum * 100).toFixed(1)}%`}</strong>
        <span className='block mt-1'>{counts[active].note}</span>
      </div>
      <div className='mt-4 overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <caption className='sr-only'>Accessible source values for the interactive chart</caption>
          <thead><tr><th scope='col' className='py-2 pr-4'>Category</th><th scope='col' className='py-2 pr-4'>Reported</th><th scope='col' className='py-2'>Approx. share</th></tr></thead>
          <tbody>{counts.map((item) => <tr key={item.label}><th scope='row' className='py-2 pr-4 font-normal'>{item.label}</th><td className='py-2 pr-4'>{item.display}</td><td className='py-2'>{(item.count / maximum * 100).toFixed(1)}%</td></tr>)}</tbody>
        </table>
      </div>
      <p className='agentbaiting-chart-source mt-4'>Source: Island Security, July 2026. Counts are approximate and overlapping. 800 is a conservative lower bound for “800+”; percentages are illustrative. No time series or infection rate is inferred.</p>
    </figure>
  )
}
