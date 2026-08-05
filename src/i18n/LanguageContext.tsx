'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LANGUAGES, translations, LanguageOption } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Try restoring saved language preference
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && ['en', 'no', 'ne'].includes(saved)) {
      setLanguageState(saved);
    } else {
      // Auto detect browser language if Norwegian or Nepali
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('no') || browserLang.startsWith('nb') || browserLang.startsWith('nn')) {
        setLanguageState('no');
      } else if (browserLang.startsWith('ne')) {
        setLanguageState('ne');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
