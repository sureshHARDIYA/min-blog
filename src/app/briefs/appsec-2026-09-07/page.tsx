import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AppSec Brief — 7 September 2026 | Suresh Kumar Mukhiya',
  description:
    'Consequential application-security and software supply-chain developments for Rust, Python, React, PostgreSQL, and Microsoft SQL Server teams.',
  alternates: {
    canonical: '/briefs/appsec-2026-09-07',
  },
};

const actions = [
  'Re-run dependency inventory and SBOM generation for every production service; reconcile Dependency-Track findings against runtime exposure.',
  'Search Python dependency trees for Scrapy and pypdf. Upgrade affected packages before the next release and prioritize any service that processes untrusted URLs, S3 objects, or PDFs.',
  'Treat script or expression features as remote-code-execution surfaces: require authorization, constrain inputs, isolate execution, and add negative security tests.',
  'Require lockfile integrity, immutable action references, minimal CI permissions, and artifact provenance on release workflows.',
  'For AI-assisted changes, keep a human security review for authentication, authorization, deserialization, file handling, and dependency updates.',
];

export default function AppSecBriefPage() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] px-6 py-20 text-[#F5F5F5]">
      <article className="mx-auto max-w-3xl">
        <a className="text-sm text-cyan-400 hover:underline" href="/">
          ← Suresh Kumar Mukhiya
        </a>

        <header className="mt-10 border-b border-white/10 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Weekly AppSec Brief
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Secure the execution boundary, then prove the supply chain
          </h1>
          <p className="mt-5 text-lg text-white/65">7 September 2026 · Rust, Python, React and data platforms</p>
        </header>

        <section className="mt-12 space-y-10 text-lg leading-8 text-white/80">
          <div>
            <h2 className="text-2xl font-semibold text-white">What matters this week</h2>
            <p className="mt-4">
              Two newly published Python advisories reinforce a familiar engineering lesson: ordinary data-handling
              paths can become security boundaries. Scrapy disclosed a high-severity issue in which its S3 download
              handler could send signed requests over plaintext HTTP by default. pypdf disclosed a possible infinite
              loop while inserting tree children, creating a denial-of-service concern when hostile PDFs reach a
              processing pipeline.
            </p>
            <p className="mt-4">
              A recent Rust IoT platform advisory illustrates the more severe version of the same failure pattern:
              an unauthenticated endpoint accepted stored scripts that were later evaluated without sandboxing. The
              specific project may not be in your estate, but the design smell is broadly relevant to rules engines,
              workflow automation and AI-generated expressions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">Tech-lead decisions</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6">
              {actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
            <h2 className="text-2xl font-semibold text-white">Concrete deliverable</h2>
            <p className="mt-3">
              By Friday, produce one exception report joining the current SBOM with internet-facing services. For
              every critical or high finding, record the deployed version, reachability, owner, remediation date and
              accepted-risk approver. A scanner count is not the outcome; an owned decision is.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">Sources</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-base">
              <li><a className="text-cyan-400 hover:underline" href="https://github.com/advisories/GHSA-j4r7-rp8f-vhp4">GitHub Advisory: unauthenticated script execution in rust-iot-platform</a></li>
              <li><a className="text-cyan-400 hover:underline" href="https://github.com/advisories?query=CVE-2026-84366">GitHub Advisory Database: Scrapy CVE-2026-84366</a></li>
              <li><a className="text-cyan-400 hover:underline" href="https://github.com/advisories?query=CVE-2026-84309">GitHub Advisory Database: pypdf CVE-2026-84309</a></li>
            </ul>
          </div>
        </section>
      </article>
    </main>
  );
}
