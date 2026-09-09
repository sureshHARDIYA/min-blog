import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTechStack } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { GitHubTechnologyMap } from '../components/GitHubTechnologyMap';

export const StackView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const { t } = useLanguage();
  const { theme } = useTheme();

  const { data: categories, isLoading: isStackLoading } = useQuery({
    queryKey: ['tech-stack'],
    queryFn: fetchTechStack,
  });

  return (
    <div className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-[1120px] px-6 pb-16 pt-[100px]">
      <header
        className={`mb-12 border-b pb-8 ${
          theme === 'light' ? 'border-slate-300' : 'border-white/10'
        }`}
      >
        <span
          className={`mb-1 block font-mono text-xs font-bold uppercase tracking-[0.25em] ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}
        >
          {t.stack.tag}
        </span>
        <h1
          className={`text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl ${
            theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
          }`}
        >
          {t.stack.title}
        </h1>
        <p
          className={`marker-line mt-2 max-w-3xl pl-6 text-lg font-light ${
            theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/70'
          }`}
        >
          {t.stack.subtitle}
        </p>
      </header>

      <GitHubTechnologyMap />

      <section aria-labelledby="experience-map-title">
        <div className="mb-7">
          <p
            className={`font-code text-[10px] font-bold uppercase tracking-[0.22em] ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}
          >
            Broader experience
          </p>
          <h2
            className={`mt-2 text-3xl font-black tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}
            id="experience-map-title"
          >
            Technologies used across projects and roles
          </h2>
          <p className={`mt-2 ${theme === 'light' ? 'text-slate-600' : 'text-white/55'}`}>
            This section includes professional experience that cannot be inferred from public GitHub
            activity alone.
          </p>
        </div>

        {isStackLoading ? (
          <div
            className={`h-64 animate-pulse border ${
              theme === 'light'
                ? 'border-slate-300 bg-slate-200'
                : 'border-white/10 bg-[#141414]'
            }`}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="flex flex-col gap-3 md:col-span-4">
              {categories?.map((category, index) => (
                <button
                  className={`cursor-pointer border p-5 text-left transition-all ${
                    activeCategory === index
                      ? theme === 'light'
                        ? 'border-[#008822] bg-[#008822] font-bold text-white shadow-lg'
                        : 'border-[#00FF41] bg-[#00FF41] font-bold text-[#0C0C0C] shadow-lg'
                      : theme === 'light'
                        ? 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                        : 'border-white/10 bg-[#141414] text-[#F5F5F5] hover:border-white/30'
                  }`}
                  key={category.category}
                  onClick={() => setActiveCategory(index)}
                  type="button"
                >
                  <div
                    className={`mb-1 font-code text-[10px] uppercase tracking-widest ${
                      activeCategory === index
                        ? theme === 'light'
                          ? 'font-bold text-white/80'
                          : 'font-bold text-[#0C0C0C]/70'
                        : theme === 'light'
                          ? 'text-[#008822]'
                          : 'text-[#00FF41]'
                    }`}
                  >
                    AREA 0{index + 1}
                  </div>
                  <h3 className="text-xl font-black uppercase leading-tight tracking-tight">
                    {category.category}
                  </h3>
                </button>
              ))}
            </div>

            <div
              className={`border p-8 shadow-xl md:col-span-8 ${
                theme === 'light'
                  ? 'border-slate-200 bg-white text-slate-900'
                  : 'border-white/10 bg-[#141414] text-[#F5F5F5]'
              }`}
            >
              {categories && categories[activeCategory] && (
                <div>
                  <div
                    className={`mb-6 border-b pb-4 ${
                      theme === 'light' ? 'border-slate-200' : 'border-white/10'
                    }`}
                  >
                    <h3 className="mb-2 text-2xl font-black uppercase tracking-tight">
                      {categories[activeCategory].category}
                    </h3>
                    <p
                      className={`text-sm font-light ${
                        theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
                      }`}
                    >
                      {categories[activeCategory].description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {categories[activeCategory].skills.map((skill) => (
                      <div className="space-y-2" key={skill.name}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className="text-lg font-black tracking-tight">{skill.name}</span>
                            <span
                              className={`ml-3 font-code text-xs ${
                                theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
                              }`}
                            >
                              ({skill.note})
                            </span>
                          </div>
                          <span
                            className={`shrink-0 border px-2.5 py-1 font-code text-xs font-bold ${
                              theme === 'light'
                                ? 'border-slate-300 bg-slate-100 text-[#007A1E]'
                                : 'border-white/10 bg-[#0C0C0C] text-[#00FF41]'
                            }`}
                          >
                            {skill.proficiency}
                          </span>
                        </div>

                        <div
                          className={`h-2 w-full overflow-hidden border ${
                            theme === 'light'
                              ? 'border-slate-300 bg-slate-100'
                              : 'border-white/10 bg-[#0C0C0C]'
                          }`}
                        >
                          <div
                            className={`h-full transition-all duration-500 ${
                              theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
                            }`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
