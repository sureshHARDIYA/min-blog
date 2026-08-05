import React from 'react';
import { NavTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { useTheme } from '../context/ThemeContext';
import { downloadCV } from '../utils/downloadCV';

interface FooterProps {
  setActiveTab?: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const { theme } = useTheme();

  return (
    <footer className={`w-full mt-auto border-t relative z-10 transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-slate-100 border-slate-300 text-slate-800'
        : 'bg-[#0C0C0C] border-white/10 text-[#F5F5F5]'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 py-10 max-w-[1120px] mx-auto items-start">
        <div className="col-span-1 md:col-span-2 space-y-3">
          <span className={`font-black text-sm tracking-widest block uppercase ${
            theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
          }`}>
            Suresh Kumar Mukhiya, PhD
          </span>
          <p className={`font-body-md text-xs leading-relaxed ${
            theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/60'
          }`}>
            {t.footer.rights}
          </p>

          <div className="pt-2">
            <a
              href="/Suresh_Kumar_Mukhiya_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Suresh_Kumar_Mukhiya_CV.pdf"
              className={`inline-flex items-center gap-2 px-4 py-2.5 font-code text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 cursor-pointer shadow-sm ${
                theme === 'light'
                  ? 'bg-[#008822] text-white hover:bg-slate-900'
                  : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
              }`}
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>{t.footer.downloadCV}</span>
            </a>
          </div>
        </div>

        <div className="col-span-1">
          <span className={`font-code text-[10px] uppercase tracking-[0.2em] block mb-3 font-bold ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}>
            {t.footer.networks}
          </span>
          <nav className="flex flex-col gap-2 font-body-md text-xs">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors duration-200 inline-flex items-center gap-1 font-mono ${
                theme === 'light'
                  ? 'text-slate-700 hover:text-[#008822]'
                  : 'text-[#F5F5F5]/70 hover:text-[#00FF41]'
              }`}
            >
              <span>GitHub</span>
              <span className="material-symbols-outlined text-xs">north_east</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors duration-200 inline-flex items-center gap-1 font-mono ${
                theme === 'light'
                  ? 'text-slate-700 hover:text-[#008822]'
                  : 'text-[#F5F5F5]/70 hover:text-[#00FF41]'
              }`}
            >
              <span>LinkedIn</span>
              <span className="material-symbols-outlined text-xs">north_east</span>
            </a>
          </nav>
        </div>

        <div className="col-span-1">
          <span className={`font-code text-[10px] uppercase tracking-[0.2em] block mb-3 font-bold ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}>
            {t.footer.contact}
          </span>
          <nav className="flex flex-col gap-2 font-body-md text-xs">
            <a
              href="mailto:itsmeskm99@gmail.com"
              className={`transition-colors duration-200 font-mono ${
                theme === 'light'
                  ? 'text-slate-800 hover:text-[#008822]'
                  : 'text-[#F5F5F5]/80 hover:text-[#00FF41]'
              }`}
            >
              itsmeskm99@gmail.com
            </a>
            <span className={`text-xs font-code ${
              theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
            }`}>
              Oslo &amp; Bergen, Norway
            </span>
          </nav>
        </div>
      </div>

      {/* Language Selector Footer Bar */}
      <div className={`border-t py-4 px-6 ${
        theme === 'light' ? 'border-slate-300/80 bg-slate-200/60' : 'border-white/10 bg-[#080808]'
      }`}>
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-code text-xs">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-sm ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              language
            </span>
            <span className={`font-bold uppercase tracking-wider text-[11px] ${
              theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
            }`}>
              Language / Språk:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableLanguages.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-[#008822] text-white border-[#008822] shadow-sm'
                        : 'bg-[#00FF41] text-[#0C0C0C] border-[#00FF41] shadow-sm'
                      : theme === 'light'
                        ? 'bg-white text-slate-700 border-slate-300 hover:border-[#008822] hover:text-[#008822]'
                        : 'bg-[#141414] text-[#F5F5F5]/70 border-white/20 hover:border-[#00FF41] hover:text-[#00FF41]'
                  }`}
                  title={`Switch language to ${lang.name}`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};
