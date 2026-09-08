import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = 'https://skmukhiya.com.np';
const pageUrl = `${siteUrl}/security`;

const capabilities = [
  {
    title: 'Secure architecture and threat modelling',
    description:
      'Identify assets, trust boundaries, abuse cases and security controls before implementation. Translate threats into architecture decisions teams can act on.',
    evidence: 'STRIDE · attack paths · trust boundaries · security ADRs',
  },
  {
    title: 'API security, OAuth 2.0, OIDC and Entra ID',
    description:
      'Design authentication and authorization for browser, service-to-service, Power Platform and partner integrations without confusing identity with access control.',
    evidence: 'OAuth 2.0 · OIDC · Microsoft Entra ID · APIM · Zero Trust',
  },
  {
    title: 'Secure SDLC and security requirements',
    description:
      'Make security part of planning, design, pull requests, delivery and operations through testable requirements and proportionate assurance.',
    evidence: 'OWASP ASVS · abuse cases · acceptance criteria · security gates',
  },
  {
    title: 'Software supply-chain security',
    description:
      'Connect dependency and SBOM findings to deployed services, runtime exposure, ownership and explicit remediation decisions.',
    evidence: 'CycloneDX · Dependency-Track · provenance · CI/CD hardening',
  },
  {
    title: 'Security-focused code review',
    description:
      'Review authorization, input handling, data access, file processing, secrets, error paths and dependency changes in modern application stacks.',
    evidence: 'Rust · Python/FastAPI · React/Next.js · PostgreSQL · MS SQL',
  },
  {
    title: 'Cloud and platform security',
    description:
      'Design practical cloud controls around identity, private connectivity, secrets, observability, workload isolation and incident readiness.',
    evidence: 'Azure · Key Vault · WAF · private endpoints · security telemetry',
  },
  {
    title: 'AI-assisted development security',
    description:
      'Establish boundaries for coding agents and AI-enabled applications, including tool permissions, data exposure, prompt injection and human review.',
    evidence: 'least privilege · tool isolation · audit trails · review policy',
  },
];

const workflow = [
  {
    number: '01',
    title: 'Understand',
    text: 'Clarify the system, business constraints, sensitive assets, actors and realistic threat scenarios.',
  },
  {
    number: '02',
    title: 'Design',
    text: 'Select proportional controls and document decisions, ownership, trade-offs and verification criteria.',
  },
  {
    number: '03',
    title: 'Verify',
    text: 'Use ASVS-aligned requirements, automated checks, focused testing and evidence-based review.',
  },
  {
    number: '04',
    title: 'Improve',
    text: 'Turn findings, incidents and dependency intelligence into owned engineering work and reusable controls.',
  },
];

const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  name: 'Application Security and Secure Software Architecture',
  url: pageUrl,
  description:
    'Application security, secure software architecture and DevSecOps expertise in Bergen, Norway.',
  mainEntity: {
    '@type': 'Person',
    name: 'Suresh Kumar Mukhiya',
    honorificSuffix: 'PhD',
    url: siteUrl,
    jobTitle: 'Tech Lead and Secure Software Architect',
    homeLocation: {
      '@type': 'Place',
      name: 'Bergen, Norway',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bergen',
        addressCountry: 'NO',
      },
    },
    knowsAbout: capabilities.map(({ title }) => title),
    sameAs: [
      'https://github.com/sureshHARDIYA',
      'https://www.linkedin.com/in/sureshhardiya/',
      'https://scholar.google.com/citations?user=9-fxxeMAAAAJ',
    ],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Application Security',
      item: pageUrl,
    },
  ],
};

export const metadata: Metadata = {
  title: 'Application Security Expert in Norway',
  description:
    'Suresh Kumar Mukhiya is a Bergen-based specialist in application security, secure software architecture, API security, DevSecOps and supply-chain security.',
  keywords: [
    'application security expert Norway',
    'cybersecurity expert Norway',
    'application security Bergen',
    'secure software architect Norway',
    'AppSec consultant Norway',
    'DevSecOps Norway',
    'API security architect',
    'software supply chain security',
    'OWASP ASVS',
    'Microsoft Entra ID security',
    'Rust security',
    'Python application security',
    'React security',
    'Azure security architecture',
    'applikasjonssikkerhet Norge',
    'sikker programvarearkitektur',
  ],
  authors: [{ name: 'Suresh Kumar Mukhiya', url: siteUrl }],
  alternates: {
    canonical: '/security',
  },
  openGraph: {
    type: 'profile',
    url: pageUrl,
    title: 'Application Security & Secure Software Architecture',
    description:
      'Application security, API security, DevSecOps and secure cloud architecture expertise in Bergen, Norway.',
    siteName: 'Suresh Kumar Mukhiya, PhD',
    locale: 'en_NO',
    images: [
      {
        url: '/favicon-192x192.png',
        width: 192,
        height: 192,
        alt: 'Suresh Kumar Mukhiya, application security and software architecture',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Application Security & Secure Software Architecture',
    description:
      'Application security, API security, DevSecOps and secure cloud architecture expertise in Norway.',
    images: ['/favicon-192x192.png'],
  },
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] text-[#F5F5F5]">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
            Application security specialist · Bergen, Norway
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
              Discuss security work
            </a>
            <Link
              className="border border-white/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:border-[#00FF41] hover:text-[#00FF41]"
              href="/blogs"
            >
              Read AppSec briefs
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20" id="capabilities">
        <div className="mx-auto max-w-[1120px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]">
            Security capabilities
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
            Security that engineering teams can implement and verify
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
                  {capability.evidence}
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
              Verification standard
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Beyond awareness checklists
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg leading-8 text-white/75">
              My application-security verification work is grounded in the{' '}
              <a
                className="font-semibold text-[#00FF41] hover:underline"
                href="https://owasp.org/www-project-application-security-verification-standard/"
                rel="noreferrer"
                target="_blank"
              >
                OWASP Application Security Verification Standard
              </a>
              . ASVS turns security expectations into testable requirements for web applications
              and APIs. It supports clearer scope, stronger engineering acceptance criteria and
              evidence-based assurance.
            </p>
            <p className="mt-5 text-lg leading-8 text-white/75">
              The OWASP Top 10 is valuable for awareness. ASVS is the more useful foundation when a
              team needs to specify what must be secure and verify whether the controls work.
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
            From business risk to engineering evidence
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
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]">
              Local and international
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Application security expertise in Norway
            </h2>
            <p className="mt-5 leading-7 text-white/70">
              Based in Bergen, I combine software engineering, technical leadership and academic
              research to make security decisions understandable and actionable across product,
              development and platform teams.
            </p>
          </div>
          <div lang="no">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]">
              Applikasjonssikkerhet i Norge
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Sikker programvarearkitektur i Bergen
            </h2>
            <p className="mt-5 leading-7 text-white/70">
              Jeg hjelper utviklingsteam med sikker API-arkitektur, trusselmodellering,
              programvareforsyningskjeder, DevSecOps og praktiske sikkerhetskrav for moderne
              skybaserte løsninger.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#00FF41] px-6 py-16 text-[#071008]">
        <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em]">
              Secure systems are designed, verified and improved
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
              Need an engineering-led security perspective?
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
