---
title: 'AppSec Lead Brief: check your cache and sandbox boundaries'
seoTitle: 'Next.js Cache Leaks and Wasmtime Sandbox Fix | AppSec Brief'
description: 'Next.js patches, a critical Wasmtime sandbox flaw, and practical checks for tenant isolation and developer tooling.'
date: '2026-10-05'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, nextjs, rust, software-supply-chain, multi-tenancy, ai-security'
---

## Executive summary

This week, check the boundaries your application relies on: shared caches, server-side image fetching and WebAssembly isolation. Next.js has shipped its September security release; teams should assess the actual configurations behind its findings and deploy the appropriate patch. Wasmtime embedders accepting untrusted components have a separate critical fix to prioritize. This brief covers developments published or materially updated from 28 September through 5 October 2026; the cited advisories do not establish active exploitation of these Next.js or Wasmtime flaws.

## Risk at a glance

- **Act now — Next.js image optimization:** vulnerable 16.x deployments with attacker-controlled, allow-listed image hosts; vendor-rated High SSRF. Target the published 16.3.8 release. **Owner:** web/platform lead.
- **Act now if exposed — Next.js caches:** Cache Components with nested root-parameter reads or draft-dependent cached content; maintainer-confirmed disclosure conditions. **Owner:** application and tenant-isolation owners.
- **Act now if present — Wasmtime:** affected component-model-async embeddings; critical sandbox-escape advisory, fixed in 48.0.4 and 49.0.2. **Owner:** Rust/runtime lead.
- **Plan — Next.js development tooling:** the development-only MCP endpoint can disclose local project information to a malicious website. **Owner:** developer experience.
- **Watch — deferred Next.js fixes:** one Critical and one High issue were postponed; their details are not grounds for inventing exposure or remediation. **Owner:** AppSec.

## Next.js: the patch is available, but scope still matters

**What changed and evidence.** The [30 September release announcement](https://nextjs.org/blog/september-2026-security-release) names **16.3.8 and 15.5.27**, covering seven issues: one High, five Medium and one Low. It says one Critical and one High fix were postponed because of upstream delays. This supersedes the previous brief's advance-notice figures of 16.3.7 and nine issues.

**Response.** Upgrade within the appropriate supported release line, rebuild and verify the deployed version. The findings have different prerequisites; a clean assessment of one does not clear the others. Some GitHub advisory version fields still contain `16.3.?`; this brief uses the release announcement for patch targets and does not silently fill in uncertain affected ranges.

### Image optimization can reach unintended destinations

[CVE-2026-94483 / GHSA-cjq9-62q9-8jv4](https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4), published 30 September, concerns server-side request forgery: an allow-listed image URL controlled by an attacker can cause a request to private addresses. The advisory identifies the 16.x line, but its upper-version field remains incomplete.

**Why it matters.** For Azure-hosted applications, assess what the image-processing server can reach internally; do not assume this finding proves a token or database compromise.

**Exposure check.** Inspect `images.remotePatterns`, URL sources and control of the permitted hosts' DNS. The advisory explicitly excludes applications without configured remote patterns.

**Recommended response.** Patch and remove unnecessary or untrusted image hosts. Verify approved images still load and use controlled test destinations to check network restrictions. Do not probe real internal services as an exposure test.

### Caching can cross an application boundary

[GHSA-h694-7cp9-m8p3](https://github.com/vercel/next.js/security/advisories/GHSA-h694-7cp9-m8p3), published 30 September, lists 16.3.0 as affected and 16.3.8 as patched. With Cache Components enabled, an outer cached function can omit a root parameter read by a nested cached function. Content generated for one parameter value can then be reused for another; the attacker cannot choose which value leaks.

**Why it matters and exposure check.** If your tenant boundary uses that parameter, inspect the nested call path and test two tenants with distinct fixtures. That is a possible application consequence, not a claim that every multi-tenant Next.js deployment is affected. **Response:** patch and retain a regression test proving separation.

A separate [Draft Mode finding, CVE-2026-94544](https://github.com/vercel/next.js/security/advisories/GHSA-3w37-wq28-93x7), also published 30 September, describes overlapping draft and ordinary requests sharing an unfinished cache fill. Unpublished content can reach an unauthenticated request and may persist in a generated page. Its affected field lists 16.3.0; the release announcement supplies the completed patch target.

**Exposure check and response.** Find cached functions whose results depend on Draft Mode. After patching, overlap an editor preview with an anonymous request using synthetic draft content; verify that the public response and subsequently generated page contain none of it. Authentication around the editor alone is not evidence that the shared cache is safe.

## Wasmtime: prioritize untrusted component execution

**What changed and evidence.** On 2 October, [GHSA-32h6-97mm-8q3c](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-32h6-97mm-8q3c) disclosed a native stack overflow in async component callbacks. Maintainers recommend treating it as an arbitrary-code-execution sandbox escape. Affected ranges are `>=39.0.0,<48.0.4` and `>=49.0.0,<49.0.2`; fixes are **48.0.4 and 49.0.2**.

**Why it matters.** This is relevant to services executing tenant plugins or untrusted agent-generated components, not to Rust applications merely because they use Rust.

**Exposure check and response.** Inspect `Cargo.lock`, embedding configuration and the source of executed components. Patch affected runtimes; disabling `component-model-async` is a documented workaround where compatible. Record a rebuilt artifact and passing legitimate-component tests. Do not run a sandbox-escape payload in production.

The same day's [tag-import advisory](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-cfhf-m2cr-62wj) covers GC heap corruption when WebAssembly exceptions are enabled. It affects `>=47.0.0,<48.0.4` and `>=49.0.0,<49.0.2`, with the same fixes. Check enabled proposals before concluding that disabling async components closes every finding.

## AI-assisted development watch

**Plan:** include local development tooling in the Next.js upgrade. [CVE-2026-94486 / GHSA-39w2-rjm5-chcv](https://github.com/vercel/next.js/security/advisories/GHSA-39w2-rjm5-chcv), published 30 September, reports missing origin validation on the `next dev` MCP endpoint. A malicious website visited by the developer can read project paths, error snippets, routes and logs. The advisory lists versions from 16.0.0, with an incomplete patched-version field; use the published security release above. Production does not serve this endpoint.

Check developer lockfiles as well as deployed images. Restart development servers after the upgrade and verify their resolved version. In reviews of AI-generated code, ask for evidence that tenant identity participates in cache behavior and that new local tool endpoints reject untrusted origins. These are controls derived from this week's findings, not claims of a separate incident affecting every coding agent.

## Supply-chain and stack watch

No new Dependency-Track release was found after the previously covered 5.1.1 release, and no consequential new CycloneDX specification announcement was identified in this window. The useful follow-through is to make the next SBOM reflect the rebuilt artifact, so an old vulnerable runtime does not remain deployed after a lockfile update.

Xygeni's **30 September research recap** reports malicious npm/PyPI packages, but its listed discovery dates are earlier in September. It is a newly published summary of older activity, not evidence of a fresh registry-wide compromise this week. No additional package, registry or CI compromise met this brief's verification threshold.

No consequential new core Python/FastAPI, PostgreSQL, SQL Server or Azure/Entra advisory was verified for this window. This is a review limit, not a clean bill of health for those ecosystems. Microsoft build-list snapshots differed, so no new SQL Server patch target is asserted here. Existing patch obligations remain.

## Developer checklist

### Today

- [ ] Record the deployed Next.js version and relevant image/cache configuration; close confirmed exposure with a patched deployment record.
- [ ] Inventory Wasmtime embeddings, enabled proposals and component sources; record an applicable fix or documented non-exposure.

### This week

- [ ] Run a two-tenant cache-isolation test and a draft-versus-anonymous overlap test where applicable; retain responses containing only the expected synthetic data.
- [ ] Update and restart Next.js development environments; retain resolved-version evidence for the MCP endpoint fix.
- [ ] Regenerate the affected application's SBOM from its rebuilt artifact and upload it to Dependency-Track; retain the artifact digest, BOM identifier and analysis result.

### Backlog

- [ ] Add the applicable cache-isolation regression to CI; demonstrate that a deliberately shared fixture fails the test without using customer data.

## Copy this prompt

```text
Assess <REPOSITORY> and <DEPLOYMENT_ENVIRONMENT> for the 5 October 2026 AppSec brief. Identify <APP_OWNER> where supplied. Begin in read-only assessment mode. Do not modify code, dependencies, infrastructure, access policies or lockfiles without explicit user approval.

Inspect repository manifests, resolved lockfiles, deployment configuration and SBOMs before drawing conclusions. Establish installed and deployed versions separately.

Check Next.js image remotePatterns and who controls allowed URL/DNS inputs; nested use-cache functions reading root parameters; cached Draft Mode results; and development-only MCP exposure. Use the 30 September Next.js release and linked advisories, noting incomplete version fields rather than guessing.

Check Wasmtime presence, version, component-model-async, WebAssembly exceptions and whether untrusted components can reach the runtime. Consult GHSA-32h6-97mm-8q3c and GHSA-cfhf-m2cr-62wj. Do not infer exposure from Rust alone.

Cite exact files, line locations and evidence for each finding. Classify urgency as Act now, Plan, Watch or No action and confidence as high, medium or low. State "not affected" when evidence supports it and "unknown" when evidence is insufficient. Separate confirmed facts from inference.

Propose minimal remediations and verification commands/tests, including synthetic tenant/draft fixtures where relevant. Do not execute exploit payloads, expose secrets or upload proprietary code. Report missing deployment evidence and stop for approval before making changes.
```

## Monday action plan

1. **Web lead:** deliver the Next.js version/configuration assessment and patch record.
2. **Rust lead:** resolve each Wasmtime inventory match with runtime-feature evidence and a remediation decision.
3. **Application owner:** retain passing synthetic cache-isolation tests for applicable routes.
4. **Developer-experience lead:** confirm development-server upgrades and restarts.
5. **AppSec:** reconcile rebuilt-artifact SBOMs and track the deferred Next.js advisories separately.

## References

- Next.js, **30 September 2026**: [security release](https://nextjs.org/blog/september-2026-security-release).
- Next.js, **30 September 2026**: [image SSRF](https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4), [root-parameter cache leak](https://github.com/vercel/next.js/security/advisories/GHSA-h694-7cp9-m8p3), [Draft Mode leak](https://github.com/vercel/next.js/security/advisories/GHSA-3w37-wq28-93x7), [development MCP disclosure](https://github.com/vercel/next.js/security/advisories/GHSA-39w2-rjm5-chcv).
- Bytecode Alliance, **2 October 2026**: [async callback overflow](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-32h6-97mm-8q3c), [tag-import validation](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-cfhf-m2cr-62wj).
- Xygeni, **30 September 2026**, original research recap: [September malicious-package digest](https://xygeni.io/blog/malicious-code-digest-monthly-recap-september-2026/).
- Rolling primary sources checked **5 October 2026**: [Dependency-Track releases](https://github.com/DependencyTrack/dependency-track/releases), [CycloneDX newsroom](https://cyclonedx.org/news/), [PyPI blog](https://blog.pypi.org/archive/2026/), [PostgreSQL security news](https://www.postgresql.org/about/newsarchive/security/), [SQL Server update history](https://learn.microsoft.com/sql/database-engine/install-windows/latest-updates-for-microsoft-sql-server).
