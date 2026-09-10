'use client'

import { useLanguage } from '../i18n/LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useLanguage()

  return (
    <div aria-label='Language / Språk' className='flex items-center gap-1' role='group'>
      {availableLanguages.map((option) => (
        <button
          aria-pressed={language === option.code}
          className={`border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
            language === option.code
              ? 'border-[#00FF41] bg-[#00FF41] text-[#0C0C0C]'
              : 'border-white/20 text-white/65 hover:border-white/50 hover:text-white'
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
