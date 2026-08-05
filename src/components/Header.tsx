import React, { useState } from 'react';
import { NAV_TAB_PATHS, NavTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'architecture', label: t.nav.architecture },
    { id: 'trajectory', label: t.nav.trajectory },
    { id: 'research', label: t.nav.research },
    { id: 'connect', label: t.nav.connect },
    { id: 'stack', label: t.nav.stack },
  ];

  const handleNavClick = (tab: NavTab) => {
    const nextPath = NAV_TAB_PATHS[tab];

    if (window.location.pathname !== nextPath || window.location.hash) {
      window.history.pushState({}, document.title, nextPath);
    }

    if (window.location.hash) {
      window.dispatchEvent(new Event('hashchange'));
    }

    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`backdrop-blur-md fixed top-0 w-full z-50 border-b transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
        : 'bg-[#0C0C0C]/90 border-white/10 text-[#F5F5F5]'
    }`}>
      <div className="flex justify-between items-center px-6 py-4 max-w-[1120px] mx-auto">
        <button
          onClick={() => handleNavClick('architecture')}
          className={`font-black text-lg md:text-xl tracking-tighter uppercase text-left transition-colors cursor-pointer flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900 hover:text-[#008822]' : 'text-[#F5F5F5] hover:text-[#00FF41]'
          }`}
        >
          <span>Suresh K. Mukhiya</span>
          <span className={`font-mono text-xs font-normal ${theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}`}>.PhD</span>
        </button>

        {/* Desktop Navigation & Theme Toggle */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-5 font-code text-[11px] uppercase tracking-[0.15em]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive
                      ? theme === 'light'
                        ? 'text-[#008822] font-bold border-b-2 border-[#008822] pb-1'
                        : 'text-[#00FF41] font-bold border-b-2 border-[#00FF41] pb-1'
                      : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* System Button - Toggles Light & Dark Theme */}
          <button
            onClick={toggleTheme}
            title={`Toggle Theme`}
            className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer select-none font-bold ${
              theme === 'light'
                ? 'border-[#008822]/40 bg-[#008822]/10 text-[#007A1E] hover:bg-[#008822]/20 hover:border-[#008822]'
                : 'border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41] hover:bg-[#00FF41]/20 hover:border-[#00FF41]'
            }`}
            aria-label="Toggle Theme"
          >
            <span>System</span>
            <span className="material-symbols-outlined text-xs">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>

        {/* Mobile Toggle Controls */}
        <div className="md:hidden flex items-center gap-3">
          {/* Quick Theme Toggle Mobile Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 font-mono text-xs border px-2.5 py-1 rounded cursor-pointer ${
              theme === 'light'
                ? 'border-slate-300 bg-slate-100 text-slate-800'
                : 'border-white/20 bg-[#141414] text-[#00FF41]'
            }`}
            title="Toggle Theme"
          >
            <span className="font-bold uppercase text-[10px]">
              System
            </span>
            <span className="material-symbols-outlined text-sm">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 focus:outline-none cursor-pointer ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-6 py-4 shadow-2xl animate-fadeIn ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'
        }`}>
          <nav className="flex flex-col gap-3 font-code text-xs uppercase tracking-widest mb-4">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left py-2.5 px-3 min-h-[44px] rounded flex items-center justify-between cursor-pointer ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-[#008822]/10 text-[#008822] font-bold border-l-4 border-[#008822]'
                        : 'bg-[#00FF41]/10 text-[#00FF41] font-bold border-l-4 border-[#00FF41]'
                      : theme === 'light'
                        ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-[#F5F5F5]/70 hover:bg-white/5 hover:text-[#F5F5F5]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-white/10 space-y-3 font-mono text-xs">
            {/* System Theme Toggle in Mobile Menu */}
            <button
              onClick={() => {
                toggleTheme();
              }}
              className={`w-full py-2.5 px-3 rounded flex items-center justify-between font-mono text-xs uppercase tracking-widest cursor-pointer font-bold border ${
                theme === 'light'
                  ? 'bg-[#008822]/10 text-[#007A1E] border-[#008822]/30'
                  : 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>System</span>
              </span>
              <span className="material-symbols-outlined text-base">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
