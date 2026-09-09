import React from 'react';

import activity from '../generated/github-activity.json';
import { useTheme } from '../context/ThemeContext';

const CHART_COLORS = ['#00FF41', '#22D3EE', '#A78BFA', '#FB7185', '#FBBF24', '#34D399', '#60A5FA', '#F97316'];

interface ChartItem {
  label: string;
  value: number;
}

function DonutChart({
  title,
  items,
  valueSuffix,
}: Readonly<{ title: string; items: ChartItem[]; valueSuffix: string }>) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const visibleItems = items.filter(({ value }) => value > 0).slice(0, 8);
  const total = visibleItems.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const segments = visibleItems.map((item, index) => {
    const percentage = total ? (item.value / total) * 100 : 0;
    const segment = { ...item, color: CHART_COLORS[index], offset: cursor, percentage };
    cursor += percentage;
    return segment;
  });
  const hovered = hoveredIndex === null ? null : segments[hoveredIndex];

  return (
    <article className="min-w-0">
      <h3 className="font-code text-xs font-bold uppercase tracking-[0.15em]">{title}</h3>
      <div className="mt-5 grid grid-cols-[minmax(110px,150px)_1fr] items-center gap-5">
        <figure className="relative aspect-square w-full" aria-label={`${title} donut chart`}>
          <svg className="h-full w-full -rotate-90" role="img" viewBox="0 0 42 42">
            <circle cx="21" cy="21" fill="none" r="15.9" stroke="currentColor" strokeOpacity="0.12" strokeWidth="8" />
            {segments.map((segment, index) => (
              <circle
                aria-label={`${segment.label}: ${segment.value} ${valueSuffix}`}
                className="cursor-help transition-[stroke-width,opacity] duration-200 hover:opacity-80 focus:opacity-80"
                cx="21"
                cy="21"
                fill="none"
                key={segment.label}
                onBlur={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                pathLength="100"
                r="15.9"
                role="img"
                stroke={segment.color}
                strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                strokeDashoffset={-segment.offset}
                strokeWidth={hoveredIndex === index ? 10 : 8}
                tabIndex={0}
              >
                <title>{segment.label}: {segment.value} {valueSuffix}</title>
              </circle>
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center font-code">
            {hovered ? (
              <>
                <span className="max-w-full truncate text-[9px] opacity-60">{hovered.label}</span>
                <strong className="text-sm">{hovered.value} {valueSuffix}</strong>
              </>
            ) : (
              <span className="text-[9px] uppercase opacity-40">Hover</span>
            )}
          </div>
        </figure>
        <ul className="min-w-0 space-y-2 font-code text-[10px]">
          {segments.map((segment, index) => (
            <li
              className="flex min-w-0 cursor-help items-center gap-2 rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-1 focus-visible:ring-[#00FF41]"
              key={segment.label}
              onBlur={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              tabIndex={0}
            >
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: segment.color }} />
              <span className="min-w-0 flex-1 truncate">{segment.label}</span>
              <span className="tabular-nums opacity-55">{segment.value} {valueSuffix}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ActivityLine({ compact = false }: Readonly<{ compact?: boolean }>) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const width = 720;
  const height = 150;
  const chart = activity.activityWeeks;
  const max = Math.max(...chart.map(({ commits }) => commits), 1);
  const hoveredWeek = hoveredIndex === null ? null : chart[hoveredIndex];
  const points = chart
    .map(({ commits }, index) => {
      const x = (index / Math.max(chart.length - 1, 1)) * width;
      const y = height - (commits / max) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h3 className="font-code text-xs font-bold uppercase tracking-[0.15em]">Commits over the last 90 days</h3>
        <span className="font-code text-[10px] opacity-60">
          {hoveredWeek ? `${hoveredWeek.label}: ${hoveredWeek.commits} commits` : 'HOVER A POINT FOR DETAILS'}
        </span>
      </div>
      <svg
        aria-label="Weekly aggregate commit activity"
        className={`${compact ? 'h-32' : 'h-44'} mt-4 w-full overflow-visible`}
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        {[0.25, 0.5, 0.75, 1].map((position) => (
          <line
            className="stroke-current opacity-10"
            key={position}
            x1="0"
            x2={width}
            y1={height * position}
            y2={height * position}
          />
        ))}
        <polyline
          fill="none"
          points={points}
          stroke="#00FF41"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        {chart.map(({ commits, start }, index) => {
          const x = (index / Math.max(chart.length - 1, 1)) * width;
          const y = height - (commits / max) * (height - 20) - 10;
          return (
            <circle
              aria-label={`${chart[index].label}: ${commits} commits`}
              className="cursor-help outline-none transition-[r,fill] focus:fill-[#00FF41] hover:fill-[#00FF41]"
              cx={x}
              cy={y}
              fill="#0C0C0C"
              key={start}
              onBlur={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              r={hoveredIndex === index ? 6 : 4}
              role="img"
              stroke="#00FF41"
              tabIndex={0}
            >
              <title>{chart[index].label}: {commits} commits</title>
            </circle>
          );
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

interface GitHubTechnologyMapProps {
  compact?: boolean;
}

export const GitHubTechnologyMap: React.FC<GitHubTechnologyMapProps> = ({ compact = false }) => {
  const { theme } = useTheme();
  const generatedDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(activity.generatedAt));
  const joinedYear = new Date(activity.profile.joinedAt).getUTCFullYear();
  const languageItems = activity.languages.map((language) => ({
    label: language.name,
    value: language.percentage,
  }));
  const technologyItems = activity.technologies.map((technology) => ({
    label: technology.name,
    value: technology.repositories,
  }));
  const commitItems = activity.repositories.map((repository) => ({
    label: repository.name,
    value: repository.recentCommits,
  }));

  return (
    <section
      aria-labelledby="github-activity-title"
      className={`${compact ? 'mb-0 p-5 md:p-6' : 'mb-14 p-6 md:p-8'} border ${theme === 'light' ? '[--chart-center:#fff] border-slate-200 bg-white text-slate-900 shadow-xl' : '[--chart-center:#101510] border-white/10 bg-[#101510] text-[#F5F5F5]'}`}
    >
      <h2 className="sr-only" id="github-activity-title">GitHub engineering activity</h2>
      <header className="grid gap-8 border-b border-current/10 pb-8 lg:grid-cols-[260px_1fr] lg:items-center">
        <div className="flex items-center gap-4">
          <img
            alt="Suresh Kumar Mukhiya"
            className="h-20 w-20 rounded-full border border-current/15 object-cover"
            height="80"
            src={activity.profile.avatarUrl}
            width="80"
          />
          <div>
            <p className="text-lg font-black">{activity.profile.name}</p>
            <a
              className={`font-code text-xs ${theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}`}
              href={activity.profile.profileUrl}
              rel="noreferrer"
              target="_blank"
            >
              @{activity.username} ↗
            </a>
            <p className="mt-2 font-code text-[10px] opacity-50">ON GITHUB SINCE {joinedYear}</p>
          </div>
        </div>
        <ActivityLine compact={compact} />
      </header>

      <div className={`grid gap-8 ${compact ? 'pt-7' : 'border-b border-current/10 py-8'} md:grid-cols-3`}>
        <DonutChart items={languageItems} title="Code by language" valueSuffix="%" />
        <DonutChart items={technologyItems} title="Repositories by technology" valueSuffix="repos" />
        <DonutChart items={commitItems} title="Recent commits by scope" valueSuffix="commits" />
      </div>

      {!compact ? <div className="grid gap-8 pt-8 lg:grid-cols-[1fr_280px]">
        <div>
          <h3 className="font-code text-xs font-bold uppercase tracking-[0.15em]">Activity coverage</h3>
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
                  <span className="mt-1 block truncate font-code text-[9px] opacity-45">
                    {repository.languages.join(' · ') || 'Repository metadata'}
                  </span>
                </span>
                <span
                  className={`shrink-0 font-code text-xs opacity-50 group-hover:opacity-100 ${theme === 'light' ? 'group-hover:text-[#008822]' : 'group-hover:text-[#00FF41]'}`}
                >
                  {repository.recentCommits} commits ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        <aside className="border-l border-current/10 pl-6">
          <p
            className={`font-code text-[10px] font-bold uppercase tracking-[0.18em] ${theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}`}
          >
            Snapshot
          </p>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-code text-[10px] opacity-45">AUTHORIZED REPOSITORIES</dt>
              <dd className="mt-1 text-2xl font-black">
                {activity.repositoriesAnalyzed}
              </dd>
            </div>
            <div>
              <dt className="font-code text-[10px] opacity-45">ANALYZED</dt>
              <dd className="mt-1 text-2xl font-black">{activity.repositoriesAnalyzed}</dd>
            </div>
            <div>
              <dt className="font-code text-[10px] opacity-45">UPDATED</dt>
              <dd className="mt-1 font-code text-sm font-bold">{generatedDate}</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs leading-5 opacity-50">
            Private and organization work is represented only by aggregate totals. Repository names, descriptions,
            source, branches, paths and commit messages are excluded. Activity is not a proficiency score.
          </p>
        </aside>
      </div> : null}
    </section>
  );
};
