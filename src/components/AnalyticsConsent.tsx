'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { useLanguage } from '../i18n/LanguageContext';

const CONSENT_KEY = 'skm-analytics-consent';
const GOOGLE_ANALYTICS_ID = 'G-BYWD5740TT';

type ConsentChoice = 'accepted' | 'declined' | null;

export function AnalyticsConsent() {
  const { language } = useLanguage();
  const [choice, setChoice] = useState<ConsentChoice>(null);
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    const savedChoice = window.localStorage.getItem(CONSENT_KEY);
    if (savedChoice === 'accepted' || savedChoice === 'declined') {
      setChoice(savedChoice);
      setHasChosen(true);
    }
  }, []);

  const saveChoice = (nextChoice: Exclude<ConsentChoice, null>) => {
    window.localStorage.setItem(CONSENT_KEY, nextChoice);
    setChoice(nextChoice);
    setHasChosen(true);
  };

  return (
    <>
      {choice === 'accepted' ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ANALYTICS_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {!hasChosen ? (
        <aside
          aria-label={language === 'no' ? 'Samtykke til analyse' : 'Analytics consent'}
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl border border-white/15 bg-[#101510]/95 p-4 text-[#F5F5F5] shadow-2xl backdrop-blur-md md:flex md:items-center md:gap-6 md:p-5"
        >
          <p className="text-sm leading-6 text-white/75">
            {language === 'no' ? 'Dette nettstedet bruker valgfri Google Analytics for å forstå hvilke sider som er nyttige. Analyseverktøyet lastes bare hvis du godtar det. Les ' : 'This site uses optional Google Analytics to understand which pages are useful. Analytics loads only if you accept. Read the '}
            <a className="text-[#00FF41] underline underline-offset-4" href="/privacy">{language === 'no' ? 'personvernerklæringen' : 'privacy notice'}</a>.
          </p>
          <div className="mt-4 flex shrink-0 gap-3 md:mt-0">
            <button
              className="border border-white/25 px-4 py-2 font-code text-[10px] font-bold uppercase tracking-wider transition-colors hover:border-white/60"
              onClick={() => saveChoice('declined')}
              type="button"
            >
              {language === 'no' ? 'Kun nødvendige' : 'Necessary only'}
            </button>
            <button
              className="bg-[#00FF41] px-4 py-2 font-code text-[10px] font-bold uppercase tracking-wider text-[#0C0C0C] transition-colors hover:bg-white"
              onClick={() => saveChoice('accepted')}
              type="button"
            >
              {language === 'no' ? 'Godta analyse' : 'Accept analytics'}
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
