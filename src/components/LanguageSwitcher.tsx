'use client'

import { useLanguage } from '../i18n/LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useLanguage()

  return (
    <div
      aria-label='Language / Språk'
      className='flex items-center gap-1'
      role='group'
    >
      {availableLanguages.map((option) => (
        <button
          aria-pressed={language === option.code}
          className={`border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
            language === option.code
              ? 'border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41] [html.light_&]:border-[#008822] [html.light_&]:bg-[#008822]/10 [html.light_&]:text-[#007A1E]'
              : 'border-white/20 text-white/65 hover:border-white/50 hover:text-white [html.light_&]:border-slate-300 [html.light_&]:text-slate-600 [html.light_&]:hover:border-slate-500 [html.light_&]:hover:text-slate-900'
          }`}
          key={option.code}
          onClick={() => setLanguage(option.code)}
          type='button'
        >
          {option.nativeName}
        </button>
      ))}
    </div>
  )
}
