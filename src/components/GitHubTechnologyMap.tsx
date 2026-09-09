import React from 'react';

import activity from '../generated/github-activity.json';
import { useTheme } from '../context/ThemeContext';

interface Technology {
  name: string;
  category: string;
  repositories: number;
  recentCommits: number;
}

const categoryOrder = ['Frontend', 'Backend', 'Data', 'Data & AI', 'Platform'];

function technologyWeight(technology: Technology) {
  return technology.repositories * 3 + Math.min(technology.recentCommits, 12);
}

export const GitHubTechnologyMap: React.FC = () => {
  const { theme } = useTheme();
  const technologies = activity.technologies as Technology[];
  const maxWeight = Math.max(...technologies.map(technologyWeight), 1);
  const categories = [...new Set(technologies.map(({ category }) => category))].sort(
    (left, right) => {
      const leftIndex = categoryOrder.indexOf(left);
      const rightIndex = categoryOrder.indexOf(right);
      return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex);
    },
  );
  const generatedDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(activity.generatedAt));

  return (
    <section
      aria-labelledby="github-technology-map-title"
      className={`mb-14 overflow-hidden border ${
        theme === 'light'
          ? 'border-slate-200 bg-white shadow-xl'
          : 'border-white/10 bg-[#111511]'
      }`}
    >
      <div className="grid gap-6 border-b border-inherit p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
        <div>
          <p
            className={`font-code text-[10px] font-bold uppercase tracking-[0.22em] ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}
          >
            Public GitHub signal
          </p>
          <h2
            className={`mt-2 text-3xl font-black tracking-tight md:text-4xl ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}
            id="github-technology-map-title"
          >
            What I have been building with
          </h2>
          <p
            className={`mt-3 max-w-3xl leading-7 ${
              theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/65'
            }`}
          >
            A weekly snapshot of my public, original repositories. Larger names appear across more
            repositories or have more activity in the last {activity.windowDays} days.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-5 font-code text-xs md:text-right">
          <div>
            <dt className={theme === 'light' ? 'text-slate-500' : 'text-white/45'}>REPOS</dt>
            <dd className="mt-1 text-xl font-bold">{activity.repositoriesAnalyzed}</dd>
          </div>
          <div>
            <dt className={theme === 'light' ? 'text-slate-500' : 'text-white/45'}>COMMITS</dt>
            <dd className="mt-1 text-xl font-bold">{activity.recentCommits}</dd>
          </div>
          <div>
            <dt className={theme === 'light' ? 'text-slate-500' : 'text-white/45'}>UPDATED</dt>
            <dd className="mt-1 whitespace-nowrap font-bold">{generatedDate}</dd>
          </div>
        </dl>
      </div>

      <div className="dot-grid p-6 md:p-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {categories.map((category) => (
            <article
              className={`border p-5 ${
                theme === 'light'
                  ? 'border-slate-200 bg-white/95'
                  : 'border-white/10 bg-[#0C0C0C]/90'
              }`}
              key={category}
            >
              <h3
                className={`font-code text-[10px] font-bold uppercase tracking-[0.2em] ${
                  theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                }`}
              >
                {category}
              </h3>
              <div className="mt-5 flex min-h-24 flex-wrap items-center gap-x-5 gap-y-4">
                {technologies
                  .filter((technology) => technology.category === category)
                  .map((technology) => {
                    const emphasis = technologyWeight(technology) / maxWeight;
                    return (
                      <div
                        className="group relative"
                        key={`${category}-${technology.name}`}
                        title={`${technology.repositories} public repositories · ${technology.recentCommits} commits in the activity window`}
                      >
                        <span
                          className={`font-black tracking-tight transition-colors ${
                            theme === 'light'
                              ? 'text-slate-700 group-hover:text-[#008822]'
                              : 'text-white/75 group-hover:text-[#00FF41]'
                          }`}
                          style={{ fontSize: `${1 + emphasis * 1.15}rem` }}
                        >
                          {technology.name}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`ml-1 align-top font-code text-[9px] ${
                            theme === 'light' ? 'text-slate-400' : 'text-white/35'
                          }`}
                        >
                          {technology.repositories}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h3 className="font-code text-[10px] font-bold uppercase tracking-[0.2em]">
              Recently pushed public repositories
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {activity.repositories.slice(0, 6).map((repository) => (
                <a
                  className={`border px-3 py-2 font-code text-xs transition-colors ${
                    theme === 'light'
                      ? 'border-slate-300 text-slate-700 hover:border-[#008822] hover:text-[#008822]'
                      : 'border-white/15 text-white/70 hover:border-[#00FF41] hover:text-[#00FF41]'
                  }`}
                  href={repository.url}
                  key={repository.name}
                  rel="noreferrer"
                  target="_blank"
                >
                  {repository.name} ↗
                </a>
              ))}
            </div>
          </div>
          <p
            className={`max-w-md text-xs leading-5 lg:text-right ${
              theme === 'light' ? 'text-slate-500' : 'text-white/45'
            }`}
          >
            Public repositories only. This is evidence of recent activity, not a proficiency score.
            Forks, archived projects, private work and commit contents are excluded.
          </p>
        </div>
      </div>
    </section>
  );
};
