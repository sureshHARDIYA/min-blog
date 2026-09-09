import React from 'react';

import activity from '../generated/github-activity.json';
import { useTheme } from '../context/ThemeContext';

const CHART_COLORS = ['#00FF41', '#22D3EE', '#A78BFA', '#FB7185', '#FBBF24', '#34D399', '#60A5FA', '#F97316'];

interface ChartItem {
  label: string;
  value: number;
}

function DonutChart({ title, items }: { title: string; items: ChartItem[] }) {
  const visibleItems = items.filter(({ value }) => value > 0).slice(0, 8);
  const total = visibleItems.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const gradient = visibleItems.map((item, index) => {
    const start = cursor;
    cursor += total ? (item.value / total) * 100 : 0;
    return `${CHART_COLORS[index]} ${start}% ${cursor}%`;
  }).join(', ');

  return (
    <article className="min-w-0">
      <h3 className="font-code text-xs font-bold uppercase tracking-[0.15em]">{title}</h3>
      <div className="mt-5 grid grid-cols-[minmax(110px,150px)_1fr] items-center gap-5">
        <div
          aria-label={`${title} donut chart`}
          className="aspect-square w-full rounded-full"
          role="img"
          style={{
            background: total
              ? `radial-gradient(circle, var(--chart-center) 0 44%, transparent 45%), conic-gradient(${gradient})`
              : 'rgba(148, 163, 184, 0.2)',
          }}
        />
        <ul className="min-w-0 space-y-2 font-code text-[10px]">
          {visibleItems.map((item, index) => (
            <li className="flex min-w-0 items-center gap-2" key={item.label}>
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: CHART_COLORS[index] }} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="tabular-nums opacity-55">
                {total ? `${Math.round((item.value / total) * 100)}%` : '0%'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ActivityLine() {
  const width = 720;
  const height = 150;
  const chart = activity.activityWeeks;
  const max = Math.max(...chart.map(({ commits }) => commits), 1);
  const points = chart.map(({ commits }, index) => {
    const x = (index / Math.max(chart.length - 1, 1)) * width;
    const y = height - (commits / max) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h3 className="font-code text-xs font-bold uppercase tracking-[0.15em]">Commits over the last 90 days</h3>
        <span className="font-code text-[10px] opacity-50">PUBLIC REPOSITORIES</span>
      </div>
      <svg aria-label="Weekly public commit activity" className="mt-4 h-44 w-full overflow-visible" preserveAspectRatio="none" role="img" viewBox={`0 0 ${width} ${height}`}>
        {[0.25, 0.5, 0.75, 1].map((position) => (
          <line className="stroke-current opacity-10" key={position} x1="0" x2={width} y1={height * position} y2={height * position} />
        ))}
        <polyline fill="none" points={points} stroke="#00FF41" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        {chart.map(({ commits, start }, index) => {
          const x = (index / Math.max(chart.length - 1, 1)) * width;
          const y = height - (commits / max) * (height - 20) - 10;
          return <circle cx={x} cy={y} fill="#0C0C0C" key={start} r="4" stroke="#00FF41" />;
        })}
      </svg>
      <div className="flex justify-between font-code text-[9px] opacity-45">
        <span>{chart.at(0)?.label}</span>
        <span>{chart.at(Math.floor(chart.length / 2))?.label}</span>
        <span>{chart.at(-1)?.label}</span>
      </div>
    </div>
  );
}

export const GitHubTechnologyMap: React.FC = () => {
  const { theme } = useTheme();
  const generatedDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(activity.generatedAt));
  const joinedYear = new Date(activity.profile.joinedAt).getUTCFullYear();
  const languageItems = activity.languages.map((language) => ({ label: language.name, value: language.percentage }));
  const technologyItems = activity.technologies.map((technology) => ({ label: technology.name, value: technology.repositories }));
  const commitItems = activity.repositories.map((repository) => ({ label: repository.name, value: repository.recentCommits }));

  return (
    <section
      aria-labelledby="github-activity-title"
      className={`mb-14 border p-6 md:p-8 ${theme === 'light' ? '[--chart-center:#fff] border-slate-200 bg-white text-slate-900 shadow-xl' : '[--chart-center:#101510] border-white/10 bg-[#101510] text-[#F5F5F5]'}`}
    >
      <header className="grid gap-8 border-b border-current/10 pb-8 lg:grid-cols-[260px_1fr] lg:items-center">
        <div className="flex items-center gap-4">
          <img alt="Suresh Kumar Mukhiya" className="h-20 w-20 rounded-full border border-current/15 object-cover" height="80" src={activity.profile.avatarUrl} width="80" />
          <div>
            <p className="text-lg font-black">{activity.profile.name}</p>
            <a className={`font-code text-xs ${theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}`} href={activity.profile.profileUrl} rel="noreferrer" target="_blank">
              @{activity.username} ↗
            </a>
            <p className="mt-2 font-code text-[10px] opacity-50">ON GITHUB SINCE {joinedYear}</p>
          </div>
        </div>
        <ActivityLine />
      </header>

      <div className="grid gap-8 border-b border-current/10 py-8 md:grid-cols-3">
        <DonutChart items={languageItems} title="Code by language" />
        <DonutChart items={technologyItems} title="Repositories by technology" />
        <DonutChart items={commitItems} title="Recent commits by repository" />
      </div>

      <div className="grid gap-8 pt-8 lg:grid-cols-[1fr_280px]">
        <div>
          <h3 className="font-code text-xs font-bold uppercase tracking-[0.15em]">Recently pushed repositories</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {activity.repositories.slice(0, 8).map((repository) => (
              <a
                className={`group flex items-center justify-between gap-3 border px-4 py-3 transition-colors ${theme === 'light' ? 'border-slate-200 hover:border-[#008822]' : 'border-white/10 hover:border-[#00FF41]'}`}
                href={repository.url}
                key={repository.name}
                rel="noreferrer"
                target="_blank"
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold">{repository.name}</span>
                  <span className="mt-1 block truncate font-code text-[9px] opacity-45">{repository.languages.join(' · ') || 'Repository metadata'}</span>
                </span>
                <span className={`shrink-0 font-code text-xs opacity-50 group-hover:opacity-100 ${theme === 'light' ? 'group-hover:text-[#008822]' : 'group-hover:text-[#00FF41]'}`}>
                  {repository.recentCommits} ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        <aside className="border-l border-current/10 pl-6">
          <p className={`font-code text-[10px] font-bold uppercase tracking-[0.18em] ${theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}`}>Snapshot</p>
          <dl className="mt-4 space-y-4">
            <div><dt className="font-code text-[10px] opacity-45">PUBLIC REPOSITORIES</dt><dd className="mt-1 text-2xl font-black">{activity.profile.publicRepositories || activity.repositoriesAnalyzed}</dd></div>
            <div><dt className="font-code text-[10px] opacity-45">ANALYZED</dt><dd className="mt-1 text-2xl font-black">{activity.repositoriesAnalyzed}</dd></div>
            <div><dt className="font-code text-[10px] opacity-45">UPDATED</dt><dd className="mt-1 font-code text-sm font-bold">{generatedDate}</dd></div>
          </dl>
          <p className="mt-6 text-xs leading-5 opacity-50">Public, original repositories only. The charts describe visible activity, not skill level. Private work, commit messages and source contents are excluded.</p>
        </aside>
      </div>
    </section>
  );
};
