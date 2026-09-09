import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: 'How this website handles optional analytics and necessary browser storage.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] px-6 py-20 text-[#F5F5F5]">
      <article className="mx-auto max-w-3xl">
        <a className="font-code text-xs text-[#00FF41] hover:underline" href="/">
          ← Home
        </a>
        <p className="mt-12 font-code text-xs font-bold uppercase tracking-[0.24em] text-[#00FF41]">
          Privacy
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Privacy notice</h1>
        <p className="mt-4 text-sm text-white/50">Last updated 9 September 2026</p>

        <div className="mt-12 space-y-10 text-base leading-8 text-white/75">
          <section>
            <h2 className="text-2xl font-bold text-white">Optional analytics</h2>
            <p className="mt-3">
              This website uses Google Analytics 4 only after you select “Accept analytics.” It helps identify which
              pages are useful and how visitors navigate the site. If you select “Necessary only,” the Google
              Analytics script is not loaded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Information processed</h2>
            <p className="mt-3">
              When analytics is accepted, Google Analytics may process page addresses, approximate location,
              browser and device information, interaction events and online identifiers. This site does not send
              form contents, private repository information or authentication credentials to Google Analytics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Your choice</h2>
            <p className="mt-3">
              Your analytics preference is stored locally in your browser. You can withdraw or reset the choice by
              clearing this site&apos;s browser storage, then revisiting the site and selecting a new option.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Other services</h2>
            <p className="mt-3">
              Contact forms may use security controls such as reCAPTCHA to prevent abuse. External links, including
              GitHub and LinkedIn, are governed by the privacy practices of those services when you follow them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Contact</h2>
            <p className="mt-3">
              For questions about this notice or personal data associated with this website, use the{' '}
              <a className="text-[#00FF41] underline underline-offset-4" href="/connect">
                contact page
              </a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
