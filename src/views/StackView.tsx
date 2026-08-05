import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTechStack, fetchSystemMetrics } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const StackView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const { t } = useLanguage();
  const { theme } = useTheme();

  const { data: categories, isLoading: isStackLoading } = useQuery({
    queryKey: ['tech-stack'],
    queryFn: fetchTechStack,
  });

  const { data: metrics, refetch: pingSystem, isFetching: isPinging } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: fetchSystemMetrics,
    refetchInterval: 10000,
  });

  return (
    <div className="pt-[100px] pb-16 px-6 max-w-[1120px] mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Header */}
      <header className={`mb-12 border-b pb-8 ${
        theme === 'light' ? 'border-slate-300' : 'border-white/10'
      }`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className={`font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-1 ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              {t.stack.tag}
            </span>
            <h1 className={`font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.stack.title}
            </h1>
            <p className={`font-body-lg text-lg mt-2 marker-line pl-6 font-light ${
              theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/70'
            }`}>
              {t.stack.subtitle}
            </p>
          </div>

          {/* Telemetry Badge */}
          <div className={`border p-4 font-code text-xs space-y-1.5 shadow-xl min-w-[260px] ${
            theme === 'light'
              ? 'bg-white border-[#008822]/40 text-slate-900'
              : 'bg-[#141414] border-[#00FF41]/40 text-[#F5F5F5]'
          }`}>
            <div className={`flex justify-between items-center border-b pb-1.5 ${
              theme === 'light' ? 'border-slate-200' : 'border-white/10'
            }`}>
              <span className={`uppercase tracking-wider text-[10px] ${
                theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
              }`}>{t.stack.telemetryState}</span>
              <span className={`inline-flex items-center gap-1.5 font-bold ${
                theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
                }`}></span>
                {metrics?.status || 'ONLINE'}
              </span>
            </div>
            <div className={`flex justify-between text-[11px] ${
              theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
            }`}>
              <span>{t.stack.uptime}</span>
              <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>{metrics?.uptime || '99.99%'}</span>
            </div>
            <div className={`flex justify-between text-[11px] ${
              theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
            }`}>
              <span>{t.stack.pingLatency}</span>
              <span className={`font-bold ${theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}`}>{metrics?.latencyMs || 14} ms</span>
            </div>
            <button
              onClick={() => pingSystem()}
              disabled={isPinging}
              className={`mt-2 w-full py-1.5 font-bold transition-colors cursor-pointer text-[10px] uppercase tracking-widest ${
                theme === 'light'
                  ? 'bg-[#008822] text-white hover:bg-slate-900'
                  : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
              }`}
            >
              {isPinging ? t.stack.pinging : t.stack.pingBtn}
            </button>
          </div>
        </div>
      </header>

      {/* Stack Explorer */}
      {isStackLoading ? (
        <div className={`h-64 border animate-pulse ${
          theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-[#141414] border-white/10'
        }`}></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Category Tabs Column */}
          <div className="md:col-span-4 flex flex-col gap-3">
            {categories?.map((cat, idx) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(idx)}
                className={`text-left p-5 border transition-all cursor-pointer ${
                  activeCategory === idx
                    ? theme === 'light'
                      ? 'bg-[#008822] text-white border-[#008822] font-bold shadow-lg'
                      : 'bg-[#00FF41] text-[#0C0C0C] border-[#00FF41] font-bold shadow-lg'
                    : theme === 'light'
                      ? 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                      : 'bg-[#141414] text-[#F5F5F5] border-white/10 hover:border-white/30'
                }`}
              >
                <div className={`font-code text-[10px] uppercase tracking-widest mb-1 ${
                  activeCategory === idx
                    ? theme === 'light' ? 'text-white/80 font-bold' : 'text-[#0C0C0C]/70 font-bold'
                    : theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                }`}>
                  MODULE 0{idx + 1}
                </div>
                <h3 className="font-black text-xl leading-tight uppercase tracking-tight">
                  {cat.category}
                </h3>
              </button>
            ))}
          </div>

          {/* Detail Skills Column */}
          <div className={`md:col-span-8 border p-8 shadow-xl ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-[#141414] border-white/10 text-[#F5F5F5]'
          }`}>
            {categories && categories[activeCategory] && (
              <div>
                <div className={`border-b pb-4 mb-6 ${
                  theme === 'light' ? 'border-slate-200' : 'border-white/10'
                }`}>
                  <h3 className={`font-black text-2xl mb-2 uppercase tracking-tight ${
                    theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
                  }`}>
                    {categories[activeCategory].category}
                  </h3>
                  <p className={`font-body-md text-sm font-light ${
                    theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
                  }`}>
                    {categories[activeCategory].description}
                  </p>
                </div>

                <div className="space-y-6">
                  {categories[activeCategory].skills.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className={`font-black text-lg tracking-tight ${
                            theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
                          }`}>
                            {skill.name}
                          </span>
                          <span className={`ml-3 font-code text-xs ${
                            theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
                          }`}>
                            ({skill.note})
                          </span>
                        </div>
                        <span className={`font-code text-xs font-bold border px-2.5 py-1 ${
                          theme === 'light'
                            ? 'bg-slate-100 border-slate-300 text-[#007A1E]'
                            : 'bg-[#0C0C0C] border-white/10 text-[#00FF41]'
                        }`}>
                          {skill.proficiency}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className={`w-full h-2 border overflow-hidden ${
                        theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#0C0C0C] border-white/10'
                      }`}>
                        <div
                          className={`h-full transition-all duration-500 ${
                            theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
                          }`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
