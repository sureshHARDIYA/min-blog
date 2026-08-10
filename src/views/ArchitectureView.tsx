import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPhilosophies } from '../services/api';
import { NavTab, Philosophy } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface ArchitectureViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ setActiveTab }) => {
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<Philosophy | null>(null);
  const { t } = useLanguage();
  const { theme } = useTheme();

  const { data: philosophies, isLoading } = useQuery({
    queryKey: ['philosophies'],
    queryFn: fetchPhilosophies,
  });

  return (
    <div className="dot-grid min-h-[calc(100vh-80px)]">
      <div className="pt-24 pb-16 flex flex-col gap-16 max-w-[1120px] mx-auto px-6 w-full">
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center mt-6">
          <div className="col-span-1 md:col-span-7 flex flex-col gap-6 z-10">
            <div className="space-y-2">
              <span className={`font-mono text-xs uppercase tracking-[0.3em] font-bold ${
                theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
              }`}>
                {t.hero.tag}
              </span>
              <h1 className={`font-black text-4xl sm:text-5xl md:text-6xl leading-[0.95] tracking-tighter uppercase ${
                theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
              }`}>
                {t.hero.titleLine1}<br />
                <span className={theme === 'light' ? 'text-[#008822]' : 'text-transparent text-stroke-white'}>
                  {t.hero.titleLine2}
                </span>
              </h1>
            </div>

            <div className={`border-l-4 pl-6 max-w-2xl py-1 ${
              theme === 'light' ? 'border-[#008822]' : 'border-[#00FF41]'
            }`}>
              <p className={`font-body-lg text-lg leading-relaxed font-light ${
                theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
              }`}>
                {t.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setActiveTab('trajectory')}
                className={`px-6 py-3 font-code text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center gap-2 group shadow-sm ${
                  theme === 'light'
                    ? 'bg-[#008822] text-white hover:bg-slate-900'
                    : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
                }`}
              >
                <span>{t.hero.btnExplore}</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button
                onClick={() => setActiveTab('connect')}
                className={`border px-6 py-3 font-code text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'border-slate-300 text-slate-800 hover:border-[#008822] hover:text-[#008822] bg-white'
                    : 'border-white/20 text-[#F5F5F5] hover:border-[#00FF41] hover:text-[#00FF41]'
                }`}
              >
                {t.hero.btnContact}
              </button>
            </div>
          </div>

          <div className={`col-span-1 md:col-span-5 relative h-96 md:h-[460px] border overflow-hidden group shadow-lg ${
            theme === 'light' ? 'border-slate-300 bg-slate-100' : 'border-white/10 bg-[#141414]'
          }`}>
            <img
              src="/suresh-portrait.png"
              alt="Suresh Kumar Mukhiya, PhD"
              loading="eager"
              decoding="async"
              className="object-cover w-full h-full grayscale opacity-85 contrast-125 group-hover:scale-105 transition-transform duration-700"
            />
            <div className={`absolute inset-0 border m-2 pointer-events-none ${
              theme === 'light' ? 'border-[#008822]/40' : 'border-[#00FF41]/30'
            }`}></div>
            <div className={`absolute bottom-4 left-4 backdrop-blur-md px-3 py-1 border text-[10px] font-mono uppercase tracking-widest font-bold ${
              theme === 'light'
                ? 'bg-white/90 border-slate-300 text-[#007A1E]'
                : 'bg-[#0C0C0C]/90 border-white/10 text-[#00FF41]'
            }`}>
              {t.hero.nodeLabel}
            </div>
          </div>
        </section>

        {/* Current Focus Section */}
        <section className={`grid grid-cols-1 md:grid-cols-12 gap-10 border-t pt-12 ${
          theme === 'light' ? 'border-slate-300' : 'border-white/10'
        }`}>
          <div className="col-span-1 md:col-span-4">
            <span className={`font-mono text-xs uppercase tracking-[0.2em] font-bold block mb-1 ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              {t.hero.directive}
            </span>
            <h2 className={`font-black text-2xl md:text-3xl uppercase tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.hero.enterpriseFocus}
            </h2>
          </div>
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            <div className={`border p-8 transition-colors duration-300 relative group shadow-sm ${
              theme === 'light'
                ? 'bg-white border-slate-200 hover:border-[#008822]'
                : 'bg-[#141414] border-white/10 hover:border-[#00FF41]/50'
            }`}>
              <span className={`font-code text-xs px-3 py-1 border inline-block mb-4 uppercase tracking-wider font-bold ${
                theme === 'light'
                  ? 'bg-[#008822]/10 border-[#008822]/30 text-[#007A1E]'
                  : 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]'
              }`}>
                {t.hero.companyTag}
              </span>
              <h3 className={`font-black text-2xl mb-3 tracking-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
              }`}>
                {t.hero.roleTitle}
              </h3>
              <p className={`font-body-md text-base leading-relaxed font-light ${
                theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/70'
              }`}>
                {t.hero.roleDesc}
              </p>
            </div>
          </div>
        </section>

        {/* Core Philosophies Section */}
        <section className={`border-t pt-12 mb-12 ${
          theme === 'light' ? 'border-slate-300' : 'border-white/10'
        }`}>
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className={`font-mono text-xs uppercase tracking-[0.2em] font-bold block mb-1 ${
                theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
              }`}>
                {t.hero.philosophyTag}
              </span>
              <h2 className={`font-black text-2xl md:text-3xl uppercase tracking-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
              }`}>
                {t.hero.philosophyTitle}
              </h2>
            </div>
            <span className={`font-code text-xs uppercase tracking-widest hidden sm:inline-block ${
              theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
            }`}>
              {t.hero.standardsCount}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`border p-8 h-64 animate-pulse ${
                  theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-[#141414] border-white/10'
                }`}></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {philosophies?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPhilosophy(item)}
                  className={`border p-8 h-64 flex flex-col justify-end transition-all relative overflow-hidden group cursor-pointer shadow-sm ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 hover:border-[#008822] hover:shadow-md'
                      : 'bg-[#141414] border-white/10 hover:border-[#00FF41]'
                  }`}
                >
                  <div className={`absolute top-4 right-4 font-code text-xs transition-colors font-bold ${
                    theme === 'light'
                      ? 'text-slate-400 group-hover:text-[#008822]'
                      : 'text-[#F5F5F5]/30 group-hover:text-[#00FF41]'
                  }`}>
                    {item.number}
                  </div>
                  <h3 className={`font-black text-xl marker-line pl-6 tracking-tight transition-colors ${
                    theme === 'light'
                      ? 'text-slate-900 group-hover:text-[#008822]'
                      : 'text-[#F5F5F5] group-hover:text-[#00FF41]'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`font-body-md text-xs mt-2 line-clamp-2 ${
                    theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/60'
                  }`}>
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Philosophy Details Modal */}
      {selectedPhilosophy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className={`border text-[#F5F5F5] w-full max-w-lg p-6 md:p-8 relative shadow-2xl ${
            theme === 'light'
              ? 'bg-white border-slate-300 text-slate-900'
              : 'bg-[#141414] border-[#00FF41]/40 text-[#F5F5F5]'
          }`}>
            <button
              onClick={() => setSelectedPhilosophy(null)}
              className={`absolute top-4 right-4 p-1 cursor-pointer ${
                theme === 'light' ? 'text-slate-500 hover:text-[#008822]' : 'text-[#F5F5F5]/60 hover:text-[#00FF41]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <span className={`font-code text-xs font-bold tracking-widest block mb-1 ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              PHILOSOPHY {selectedPhilosophy.number}
            </span>
            <h3 className={`font-black text-2xl mb-3 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {selectedPhilosophy.title}
            </h3>
            <p className={`font-body-md text-sm mb-4 leading-relaxed ${
              theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
            }`}>
              {selectedPhilosophy.summary}
            </p>
            <div className={`border p-4 mb-6 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0C0C0C] border-white/10'
            }`}>
              <h4 className={`font-code text-xs font-bold uppercase mb-2 tracking-wider ${
                theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
              }`}>
                {t.modal.archTenets}
              </h4>
              <ul className="space-y-2">
                {selectedPhilosophy.details.map((detail, idx) => (
                  <li key={idx} className={`font-body-md text-xs flex items-start gap-2 ${
                    theme === 'light' ? 'text-slate-800' : 'text-[#F5F5F5]/90'
                  }`}>
                    <span className={`material-symbols-outlined text-xs mt-0.5 ${
                      theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                    }`}>check_circle</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setSelectedPhilosophy(null)}
              className={`w-full font-bold py-2.5 font-code text-xs uppercase tracking-widest cursor-pointer transition-colors ${
                theme === 'light'
                  ? 'bg-[#008822] text-white hover:bg-slate-900'
                  : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
              }`}
            >
              {t.modal.closeStandard}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
