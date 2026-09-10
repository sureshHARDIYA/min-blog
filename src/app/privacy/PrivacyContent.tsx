'use client'

import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { useLanguage } from '../../i18n/LanguageContext'

const copy = {
  en: {
    home: 'Home', label: 'Privacy', title: 'Privacy notice', updated: 'Last updated 9 September 2026',
    sections: [
      ['Optional analytics', 'This website uses Google Analytics 4 only after you select “Accept analytics.” It helps identify which pages are useful and how visitors navigate the site. If you select “Necessary only,” the Google Analytics script is not loaded.'],
      ['Information processed', 'When analytics is accepted, Google Analytics may process page addresses, approximate location, browser and device information, interaction events and online identifiers. This site does not send form contents, private repository information or authentication credentials to Google Analytics.'],
      ['Your choice', 'Your analytics preference is stored locally in your browser. You can withdraw or reset the choice by clearing this site’s browser storage, then revisiting the site and selecting a new option.'],
      ['Other services', 'Contact forms may use security controls such as reCAPTCHA to prevent abuse. External links, including GitHub and LinkedIn, are governed by the privacy practices of those services when you follow them.'],
      ['Contact', 'For questions about this notice or personal data associated with this website, use the contact page.'],
    ],
  },
  no: {
    home: 'Hjem', label: 'Personvern', title: 'Personvernerklæring', updated: 'Sist oppdatert 9. september 2026',
    sections: [
      ['Valgfri analyse', 'Dette nettstedet bruker Google Analytics 4 bare etter at du velger «Godta analyse». Det hjelper med å identifisere hvilke sider som er nyttige og hvordan besøkende navigerer. Velger du «Kun nødvendige», lastes ikke Google Analytics.'],
      ['Opplysninger som behandles', 'Når analyse er godtatt, kan Google Analytics behandle sideadresser, omtrentlig plassering, nettleser- og enhetsinformasjon, samhandlingshendelser og nettidentifikatorer. Nettstedet sender ikke skjemainnhold, informasjon fra private kodearkiver eller påloggingsopplysninger til Google Analytics.'],
      ['Ditt valg', 'Analysevalget lagres lokalt i nettleseren. Du kan trekke tilbake eller nullstille valget ved å slette nettstedets nettleserdata, besøke siden på nytt og velge et nytt alternativ.'],
      ['Andre tjenester', 'Kontaktskjemaer kan bruke sikkerhetskontroller som reCAPTCHA for å hindre misbruk. Eksterne lenker, blant annet GitHub og LinkedIn, følger personvernpraksisen til den aktuelle tjenesten når du åpner dem.'],
      ['Kontakt', 'Har du spørsmål om erklæringen eller personopplysninger knyttet til nettstedet, kan du bruke kontaktsiden.'],
    ],
  },
} as const

export function PrivacyContent() {
  const { language } = useLanguage()
  const text = copy[language]
  return <main className='min-h-screen bg-[#0C0C0C] px-6 py-20 text-[#F5F5F5]'><article className='mx-auto max-w-3xl'>
    <div className='flex items-center justify-between gap-4'><a className='font-code text-xs text-[#00FF41] hover:underline' href='/'>← {text.home}</a><LanguageSwitcher /></div>
    <p className='mt-12 font-code text-xs font-bold uppercase tracking-[0.24em] text-[#00FF41]'>{text.label}</p><h1 className='mt-3 text-4xl font-black tracking-tight md:text-6xl'>{text.title}</h1><p className='mt-4 text-sm text-white/50'>{text.updated}</p>
    <div className='mt-12 space-y-10 text-base leading-8 text-white/75'>{text.sections.map(([title, body]) => <section key={title}><h2 className='text-2xl font-bold text-white'>{title}</h2><p className='mt-3'>{body}</p></section>)}</div>
  </article></main>
}
