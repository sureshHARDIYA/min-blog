import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = 'https://skmukhiya.com.np';
const pageUrl = `${siteUrl}/security`;

const capabilities = [
  {
    title: 'Secure architecture and threat modelling',
    description:
      'I start with the assets, people and trust boundaries that matter. The useful output is not a perfect diagram; it is a short list of risks and decisions the team can act on.',
    focus: 'STRIDE · attack paths · trust boundaries · security ADRs',
  },
  {
    title: 'API security, OAuth 2.0, OIDC and Entra ID',
    description:
      'Signing in and being allowed to perform an action are different problems. I design both, including tenant and resource-level checks that are easy to miss in APIs.',
    focus: 'OAuth 2.0 · OIDC · Microsoft Entra ID · APIM · Zero Trust',
  },
  {
    title: 'Secure SDLC and security requirements',
    description:
      'I prefer a few clear requirements in a story and pipeline over a large policy nobody reads. OWASP ASVS gives those requirements a testable foundation.',
    focus: 'OWASP ASVS · abuse cases · acceptance criteria · security gates',
  },
  {
    title: 'Software supply-chain security',
    description:
      'An SBOM is only useful when a finding can be connected to a deployed service, an owner and a decision. That connection is where I put most of the effort.',
    focus: 'CycloneDX · Dependency-Track · provenance · CI/CD hardening',
  },
  {
    title: 'Security-focused code review',
    description:
      'I pay particular attention to authorization, data access, file handling, error paths and the assumptions hidden between frontend and backend code.',
    focus: 'Rust · Python/FastAPI · React/Next.js · PostgreSQL · MS SQL',
  },
  {
    title: 'Cloud and platform security',
    description:
      'My focus is the path an identity, request or secret takes through the system: who can reach it, what they can do and what evidence remains afterwards.',
    focus: 'Azure · Key Vault · WAF · private endpoints · security telemetry',
  },
  {
    title: 'AI-assisted development security',
    description:
      'Coding agents make it cheaper to create code and easier to create risk at scale. I work on practical boundaries for tool access, data, review and auditability.',
    focus: 'least privilege · tool isolation · audit trails · review policy',
  },
];

const workflow = [
  {
    number: '01',
    title: 'Understand',
    text: 'Start with the system, its sensitive assets and the ways it could realistically fail or be abused.',
  },
  {
    number: '02',
    title: 'Decide',
    text: 'Choose proportionate controls and write down ownership, trade-offs and the reasons behind them.',
  },
  {
    number: '03',
    title: 'Verify',
    text: 'Combine ASVS requirements, automated checks and focused human testing. No single tool is enough.',
  },
  {
    number: '04',
    title: 'Learn',
    text: 'Use findings and incidents to improve the shared patterns, not only the application where they appeared.',
  },
];

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${pageUrl}#profile`,
  name: 'Application Security and Secure Software Architecture',
  url: pageUrl,
  description:
    'How Suresh Kumar Mukhiya approaches application security, secure software architecture and DevSecOps.',
  inLanguage: 'en',
  isPartOf: { '@id': `${siteUrl}/#website` },
  mainEntity: { '@id': `${siteUrl}/#person` },
};

export const metadata: Metadata = {
  title: 'Application Security and Secure Software Architecture',
  description:
    'How Suresh Kumar Mukhiya approaches secure APIs, threat modelling, DevSecOps and software-supply-chain risk from Bergen, Norway.',
  authors: [{ name: 'Suresh Kumar Mukhiya', url: siteUrl }],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: 'profile',
    url: pageUrl,
    title: 'Application Security and Secure Software Architecture',
    description:
      'Practical notes on secure APIs, threat modelling, DevSecOps and software-supply-chain risk.',
    siteName: 'Suresh Kumar Mukhiya, PhD',
    locale: 'en_NO',
  },
  twitter: {
    card: 'summary',
    title: 'Application Security and Secure Software Architecture',
    description:
      'Practical notes on secure APIs, threat modelling, DevSecOps and software-supply-chain risk.',
  },
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] text-[#F5F5F5]">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd).replaceAll('<', '\\u003c'),
        }}
        type="application/ld+json"
      />

      <nav
        aria-label="Security page navigation"
        className="sticky top-0 z-50 border-b border-white/10 bg-[#0C0C0C]/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4">
          <Link className="font-black uppercase tracking-tighter" href="/">
            Suresh K. Mukhiya <span className="font-mono text-xs text-[#00FF41]">.PhD</span>
          </Link>
          <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.15em]">
            <span className="hidden border-b-2 border-[#00FF41] pb-1 font-bold text-[#00FF41] sm:inline">
              Security
            </span>
            <Link className="text-white/65 hover:text-white" href="/blogs">
              Blogs
            </Link>
            <Link className="text-white/65 hover:text-white" href="/connect">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      <section className="border-b border-white/10 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-[1120px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#00FF41]">
            Application security · Bergen, Norway
          </p>
          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-tighter md:text-7xl">
            Application Security &amp; Secure Software Architecture
          </h1>
          <p className="mt-8 max-w-3xl text-xl font-light leading-8 text-white/75 md:text-2xl md:leading-9">
            I help engineering teams design secure APIs, manage software-supply-chain risk,
            implement practical DevSecOps controls, and build secure cloud applications using
            Rust, Python, React and Azure.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              className="bg-[#00FF41] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#0C0C0C] hover:bg-white"
              href="mailto:itsmeskm99@gmail.com?subject=Application%20security%20collaboration"
            >
              Discuss a security problem
            </a>
            <Link
              className="border border-white/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:border-[#00FF41] hover:text-[#00FF41]"
              href="/blogs"
            >
              Read my field notes
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20" id="capabilities">
        <div className="mx-auto max-w-[1120px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]">
            Where I work
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
            Security close to the engineering work
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {capabilities.map((capability) => (
              <article
                className="border border-white/10 bg-[#141414] p-7 transition-colors hover:border-[#00FF41]/60"
                key={capability.title}
              >
                <h3 className="text-xl font-bold">{capability.title}</h3>
                <p className="mt-4 leading-7 text-white/70">{capability.description}</p>
                <p className="mt-5 font-mono text-xs leading-5 text-[#00FF41]">
                  {capability.focus}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#101510] px-6 py-20">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]">
              Verification
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Requirements need evidence
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg leading-8 text-white/75">
              I use the{' '}
              <a
                className="font-semibold text-[#00FF41] hover:underline"
                href="https://owasp.org/www-project-application-security-verification-standard/"
                rel="noreferrer"
                target="_blank"
              >
                OWASP Application Security Verification Standard
              </a>{' '}
              to turn broad security goals into requirements a team can test. Some controls belong
              in CI; others need architecture review, code review or a deliberately awkward abuse
              test.
            </p>
            <p className="mt-5 text-lg leading-8 text-white/75">
              The OWASP Top 10 is useful for explaining common risks. ASVS is what I reach for when
              a team needs acceptance criteria and evidence that a control actually works.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1120px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]">
            Working method
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
            From a real risk to something we can verify
          </h2>
          <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-4">
            {workflow.map((step) => (
              <article className="bg-[#0C0C0C] p-6" key={step.number}>
                <span className="font-mono text-xs font-bold text-[#00FF41]">{step.number}</span>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-[860px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]">
            A practical perspective
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            I work at the boundary between architecture and delivery
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/70">
            My background spans hands-on software development, technical leadership and academic
            research. I am most useful when a security question crosses those boundaries: an Entra
            design that also has to work in an API, a dependency policy developers can live with,
            or an architecture decision that needs evidence rather than reassurance.
          </p>
        </div>
      </section>

      <section className="bg-[#00FF41] px-6 py-16 text-[#071008]">
        <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em]">
              Have a difficult security decision?
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
              Tell me what you are building and where the uncertainty is.
            </h2>
          </div>
          <a
            className="shrink-0 border-2 border-[#071008] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#071008] hover:text-[#00FF41]"
            href="mailto:itsmeskm99@gmail.com?subject=Application%20security%20collaboration"
          >
            Start a conversation
          </a>
        </div>
      </section>
    </main>
  );
}
