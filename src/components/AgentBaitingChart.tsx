'use client'

import { useState } from 'react'

const counts = [
  { label: 'All FakeGit repositories', count: 7600, display: '~7,600' },
  { label: 'AI-themed repositories', count: 1400, display: '~1,400' },
  { label: 'Fake Skills / MCP servers', count: 800, display: '800+' }
]

export function AgentBaitingChart() {
  const [selected, setSelected] = useState(0)

  return (
    <figure aria-label='Reported FakeGit repository counts, with overlapping subsets' className='agentbaiting-chart'>
      <figcaption className='agentbaiting-chart-title'>Reported repository scale</figcaption>
      <div className='agentbaiting-chart-stats'>
        {counts.map((item, index) => (
          <button
            aria-pressed={selected === index}
            className={selected === index ? 'agentbaiting-stat is-active' : 'agentbaiting-stat'}
            key={item.label}
            onClick={() => setSelected(index)}
            type='button'
          >
            <strong>{item.display}</strong>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div aria-label='Horizontal bar chart' className='agentbaiting-bars' role='img'>
        {counts.map((item, index) => (
          <div className='agentbaiting-bar-row' key={item.label}>
            <div className='agentbaiting-bar-heading'><span>{item.label}</span><strong>{item.display}</strong></div>
            <div className='agentbaiting-track'><div className={selected === index ? 'agentbaiting-fill is-active' : 'agentbaiting-fill'} style={{ width: `${item.count / 7600 * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <p className='agentbaiting-chart-note'>
        {selected === 0
          ? 'Campaign-wide reported count. This is not the number of infected organizations.'
          : selected === 1
            ? 'AI-themed repositories are a subset of the campaign total, not an additional population.'
            : 'At least 800 fake AI skills and MCP servers are a subset of AI-themed repositories.'}
      </p>
      <p className='agentbaiting-chart-source'>Source: Island Security, July 2026. Approximate, overlapping campaign counts; not independently measured.</p>
    </figure>
  )
}
