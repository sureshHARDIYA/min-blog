import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrajectory } from '../services/api';
import { TrajectoryItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const TrajectoryView: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { t } = useLanguage();
  const { theme } = useTheme();

  const { data: trajectoryList, isLoading } = useQuery({
    queryKey: ['trajectory'],
    queryFn: fetchTrajectory,
  });

  const allTags = Array.from(
    new Set(trajectoryList?.flatMap((item) => item.tags) || [])
  );

  const filteredItems = selectedTag
    ? trajectoryList?.filter((item) => item.tags.includes(selectedTag))
    : trajectoryList;

  return (
    <div className="pt-24 pb-16 px-6 max-w-[1120px] mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <section className={`mt-8 mb-12 border-b pb-8 ${
        theme === 'light' ? 'border-slate-300' : 'border-white/10'
      }`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className={`font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-1 ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              {t.trajectory.tag}
            </span>
            <h1 className={`font-black text-4xl md:text-6xl uppercase tracking-tighter ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.trajectory.title}
            </h1>
            <p className={`font-body-lg text-lg mt-2 marker-line pl-6 font-light ${
              theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/70'
            }`}>
              {t.trajectory.subtitle}
            </p>
            <div className="pl-6 mt-4">
              <a
                href="/Suresh_Kumar_Mukhiya_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Suresh_Kumar_Mukhiya_CV.pdf"
                className={`inline-flex items-center gap-2 px-3.5 py-2 font-code text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 shadow-sm ${
                  theme === 'light'
                    ? 'bg-[#008822] text-white hover:bg-slate-900'
                    : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                <span>Download CV (PDF)</span>
              </a>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-code text-xs uppercase mr-2 font-bold ${
              theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
            }`}>
              {t.trajectory.domainFilter}
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`font-code text-xs px-3 py-1 rounded-xs border transition-colors cursor-pointer uppercase font-bold tracking-wider ${
                selectedTag === null
                  ? theme === 'light'
                    ? 'bg-[#008822] text-white border-[#008822]'
                    : 'bg-[#00FF41] text-[#0C0C0C] border-[#00FF41]'
                  : theme === 'light'
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:border-[#008822]'
                    : 'bg-[#141414] text-[#F5F5F5]/70 border-white/10 hover:border-[#00FF41]/50 hover:text-[#F5F5F5]'
              }`}
            >
              {t.trajectory.all}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`font-code text-xs px-3 py-1 rounded-xs border transition-colors cursor-pointer uppercase font-bold tracking-wider ${
                  selectedTag === tag
                    ? theme === 'light'
                      ? 'bg-[#008822] text-white border-[#008822]'
                      : 'bg-[#00FF41] text-[#0C0C0C] border-[#00FF41]'
                    : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 border-slate-300 hover:border-[#008822]'
                      : 'bg-[#141414] text-[#F5F5F5]/70 border-white/10 hover:border-[#00FF41]/50 hover:text-[#F5F5F5]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-10 relative">
        {/* Global Vertical Axis Line (Desktop) */}
        <div className={`hidden md:block absolute left-0 top-0 bottom-0 w-px transform translate-x-1/2 ml-[24%] ${
          theme === 'light' ? 'bg-slate-300' : 'bg-white/10'
        }`}></div>

        {isLoading ? (
          <div className="col-span-12 space-y-8 py-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-32 border animate-pulse ${
                theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-[#141414] border-white/10'
              }`}></div>
            ))}
          </div>
        ) : (
          filteredItems?.map((item: TrajectoryItem) => (
            <React.Fragment key={item.id}>
              {/* Timeline Period & Company Column */}
              <div className="col-span-1 md:col-span-3 text-left md:text-right md:pr-8 relative">
                <div className="sticky top-[100px]">
                  <span className={`font-code text-xs font-bold block mb-1 uppercase tracking-widest ${
                    theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                  }`}>
                    {item.period}
                  </span>
                  <h2 className={`font-black text-2xl tracking-tight ${
                    theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
                  }`}>
                    {item.company}
                  </h2>
                </div>
              </div>

              {/* Timeline Role Description Column */}
              <div className={`col-span-1 md:col-span-9 relative border-l md:border-l-0 pl-6 md:pl-8 pb-12 marker-line ${
                theme === 'light' ? 'border-slate-300' : 'border-white/10'
              }`}>
                <h3 className={`font-black text-2xl md:text-3xl mb-3 tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
                }`}>
                  {item.role}
                </h3>
                <p className={`font-body-lg text-base max-w-3xl mb-6 leading-relaxed font-light ${
                  theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
                }`}>
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tTag) => (
                    <span
                      key={tTag}
                      className={`font-code text-xs border px-3 py-1 rounded-xs font-bold ${
                        theme === 'light'
                          ? 'bg-slate-100 border-slate-300 text-[#007A1E]'
                          : 'bg-[#141414] border-white/10 text-[#00FF41]'
                      }`}
                    >
                      {tTag}
                    </span>
                  ))}
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </section>
    </div>
  );
};
