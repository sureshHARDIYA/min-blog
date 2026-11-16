---
title: 'AppSec Lead Brief: patch generated-code and tenant boundaries'
seoTitle: 'React RSC RCE, PostgreSQL security release and FastAPI codegen flaws'
description: 'React Server Components, PostgreSQL row security and FastAPI code generation show why generated execution paths need explicit trust boundaries.'
seoDescription: 'AppSec briefing for 16 November 2026 covering React Server Components RCE, PostgreSQL security fixes, FastAPI code generation flaws and Rust sandbox escapes.'
date: '2026-11-16'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, react, nextjs, fastapi, postgresql, rust, software-supply-chain, ai-security, multi-tenant'
---

## Executive summary

The most important decision this week is whether generated code, cached server output and database helpers are treated as executable trust boundaries. A materially updated React advisory confirms a critical, unauthenticated RCE path in rare React Server Components responses; PostgreSQL shipped a broad security release that includes a row-level-security disclosure relevant to multi-tenant systems; and three FastAPI code-generator flaws can turn OpenAPI data into Python execution. Patch first, then prove that untrusted values cannot cross from specifications, cache payloads or tenant queries into executable behavior.

## Risk at a glance

- **Act now if exposed — React Server Components RCE:** `react-server-dom-webpack`, `react-server-dom-parcel` and `react-server-dom-turbopack` are affected in React **19.0.0–19.0.8, 19.1.0–19.1.9, 19.2.0–19.2.8 and 19.3.0**. Next.js **16.0.0–16.4.0** is affected in the documented App Router and Cache Components case. Public proof-of-concept code exists, but no primary source reviewed for this brief reports active exploitation. **Owner:** React/Next.js platform lead.
- **Act now — PostgreSQL security release:** upgrade supported branches to **18.7, 17.12, 16.16, 15.20 or 14.25**. The release closes 52 security issues; the relevant multi-tenant check is CVE-2026-120154, an `INSERT ... ON CONFLICT` row-security disclosure. PostgreSQL 14 is now end-of-life. **Owner:** database platform lead.
- **Act now if used — FastAPI code generation:** `fastapi-code-generator` before **0.8.1** can emit attacker-controlled Python from OpenAPI paths, response keys or summaries. The project is no longer maintained; 0.8.1 fixes the reported sinks. **Owner:** Python/API tooling lead.
- **Act now if reachable — Rust filesystem sandbox escape:** `cap-primitives` before **3.4.6**, and **4.0.0–4.0.2**, can follow a trailing-slash symlink outside a sandbox on affected platforms and configurations. **Owner:** Rust runtime / agent platform lead.
- **Act now for corporate endpoints — exploited Outlook credential disclosure:** Microsoft reports exploitation of CVE-2026-124194. Opening a crafted message file can disclose authentication material to an attacker-controlled network location; the Preview Pane is not an attack vector. **Owner:** endpoint security.

## React Server Components: patch the rare path before proving reachability

**What changed.** GitHub materially updated [CVE-2026-126187 / GHSA-xqc2-xf4c-x3h3](https://github.com/advisories/GHSA-xqc2-xf4c-x3h3) on 10 November. Crafted payloads can cause unauthenticated remote code execution in frameworks that support React Server Components when a response transports multiple typed arrays and an attacker-controlled value.

**Evidence.** The affected React package ranges are **19.0.0–19.0.8, 19.1.0–19.1.9, 19.2.0–19.2.8 and 19.3.0**. Fixed releases are **19.0.9, 19.1.10, 19.2.9 and 19.3.1**. The corresponding [Next.js advisory](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr) covers **16.0.0 through 16.4.0**, fixed in **16.4.1**, for App Router applications using Cache Components and a `use cache` function that returns multiple typed arrays. React applications without a server, or without an RSC-capable framework, bundler or plugin, are not affected. Public proof-of-concept code exists; that is evidence of reproducibility, not evidence of exploitation in the wild.

**Why it matters to this stack.** Next.js makes server and client execution look like one programming model. That convenience can hide the serialization boundary where attacker-controlled values meet cached server output and Server Actions. Authorization inside a Server Action remains necessary even after the framework is patched.

**Exposure check.** Resolve the installed `react-server-dom-*`, React and Next.js versions from the lockfile and deployed image. Confirm whether App Router, Cache Components and `use cache` are enabled, then search cached functions for multiple typed arrays and attacker-controlled return values. Inventory Server Actions reachable from those pages and verify their authorization independently of UI reachability.

**Recommended response.** Upgrade the affected React packages to the fixed patch line and Next.js to **16.4.1 or later**, rebuild from a clean lockfile and deploy a new immutable image. Do not treat absence of the rare return pattern as a permanent workaround; the Next.js advisory says no known workaround exists for an affected function. Add negative authorization tests for Server Actions and retain request telemetry that can distinguish unusual cached RSC payloads.

## PostgreSQL: a minor-version update is a tenant-isolation release

**What changed.** PostgreSQL published **18.7, 17.12, 16.16, 15.20 and 14.25** on 12 November, closing 52 security issues and more than 140 bugs. Version 14.25 is the final PostgreSQL 14 release.

**Evidence.** [CVE-2026-120154](https://www.postgresql.org/support/security/CVE-2026-120154/) allows a role with `INSERT`, `UPDATE` and applicable `SELECT` privileges to iteratively use `INSERT ... ON CONFLICT DO UPDATE` to read rows that row-level-security policies should hide. It affects all supported branches before the new patch releases. The release also fixes several higher-scoring memory-safety and arbitrary-code-execution issues, but their prerequisites vary; the release announcement does not report active exploitation.

**Why it matters to this stack.** Multi-tenant applications often combine application predicates with PostgreSQL RLS as defense in depth. CVE-2026-120154 shows why a passing `SELECT` isolation test is insufficient: the write path and conflict-handling expressions need tenant-negative tests too. Managed PostgreSQL does not remove the need to verify the engine version and maintenance state.

**Exposure check.** Record the exact server version for every primary, replica and restore environment. Find tables where RLS protects tenant data and application roles have `INSERT`, `UPDATE` and `SELECT`. Search SQL and ORM output for upserts, then test whether a tenant-scoped role can infer a conflicting row belonging to another tenant. Check whether PostgreSQL 14 remains anywhere in production, CI or disaster-recovery images.

**Recommended response.** Schedule the supported minor update through the cloud provider or database platform, verify replicas and failover targets, and move PostgreSQL 14 to a supported major version. Re-run cross-tenant negative tests specifically through `ON CONFLICT DO UPDATE`; evidence should include the server version, policy definition, application role and rejected cross-tenant case.

## FastAPI code generation: OpenAPI is input, not inert documentation

**What changed.** GitHub reviewed three critical `fastapi-code-generator` advisories on 9 November: [CVE-2026-63469](https://github.com/advisories/GHSA-6xmv-cjr5-w3q8), [CVE-2026-63470](https://github.com/advisories/GHSA-h667-4jj2-cgv4) and [CVE-2026-63471](https://github.com/advisories/GHSA-p2mm-64f6-gmpp). All affect versions before **0.8.1**.

**Evidence.** Unescaped response status-code keys and route paths can inject Python expressions that execute when the generated module is imported. An unescaped operation summary can break out of a generated docstring and execute when the route handler is called. The flaws require an attacker-controlled or attacker-influenced OpenAPI document and generated code that is imported or served. Version **0.8.1** fixes the reported sinks; the project repository now states that it is no longer maintained and recommends migration to `datamodel-code-generator`, whose server-generation behavior is still experimental.

**Why it matters to this stack.** API specifications commonly arrive from partners, internal portals, AI agents and pull requests. A pipeline that automatically generates, formats, imports and tests Python gives specification data the privileges of the CI runner. Review of the generated diff is a security control, not a cosmetic step.

**Exposure check.** Search dependency files and CI workflows for `fastapi-code-generator`. Trace every OpenAPI source, including downloaded partner specifications and agent-generated files. Determine whether generation runs with repository, package-registry, cloud or signing credentials, and whether generated modules are imported during tests before human review.

**Recommended response.** Move to **0.8.1** immediately if the tool remains in use, then plan a tested migration because the project is unmaintained. Generate in a network-restricted, secret-free job; review the generated Python diff; compile it without importing application modules; and require explicit approval before promotion. Pin the generator and the input specification digest.

## Rust sandbox and supply-chain watch

[RUSTSEC-2026-0482](https://rustsec.org/advisories/RUSTSEC-2026-0482.html) affects `cap-primitives` before **3.4.6** and versions **4.0.0–4.0.2**. A path or symlink ending in `/` can bypass the last-component `O_NOFOLLOW` protection and permit reads, writes, renames or directory operations outside the sandbox. The vulnerable resolver is used on Windows and macOS, on FreeBSD without `O_RESOLVE_BENEATH`, and on Linux when `openat2` is unavailable or rejected by seccomp. Removing trailing slashes is not a safe workaround because the symlink target itself may end in `/`. Upgrade to **3.4.6** or **4.0.3+**, and test the deployed kernel/seccomp path rather than assuming Linux is unaffected.

[RUSTSEC-2026-0483](https://rustsec.org/advisories/RUSTSEC-2026-0483.html) records `lwd-uri-util` as malicious. Its build code exfiltrated SSH keys, AWS credentials and environment metadata. Eight versions were available for about 12 hours before removal; RustSec found no evidence of actual usage. Search `Cargo.lock`, local caches, build logs and historical SBOMs. If present, remove it, rotate credentials available to the build and investigate outbound destinations. A current clean lockfile is not sufficient evidence when a prior build could already have executed the crate.

No new CycloneDX specification or Dependency-Track release changed the recommended baseline during this review window. Dependency-Track **5.2.1** remains current. Upload SBOMs from resolved lockfiles and deployed images, but preserve historical BOMs and build attestations: they are what can prove whether a removed malicious package ever entered a build.

## Microsoft endpoint watch

Microsoft released [CVE-2026-124194](https://msrc.microsoft.com/security-guidance/advisory/CVE-2026-124194) on 10 November and marks exploitation as detected. An unauthenticated attacker must convince a user to open a crafted message file in an affected Outlook version; opening it can cause a connection to an attacker-controlled network location without the usual external-content warning and disclose authentication information, including an NTLMv2 hash. Apply the November security update through the managed endpoint channel, restrict outbound NTLM where operationally possible, and verify compliance from endpoint inventory rather than email-client self-reporting.

## AI-assisted development watch

Coding agents increase the number of artifacts that can cross from data into execution: generated OpenAPI, generated Python, cached RSC payloads, migration SQL and filesystem paths. The defensible pattern is a staged boundary: parse in a secret-free environment, validate against an allowlist or schema, produce a deterministic diff, and require approval before import, execution or deployment.

Do not ask an agent merely whether a package name appears. Require it to resolve the deployed version, configuration, reachable code path and privilege context. For multi-tenant code, require negative tests using a second tenant identity. For sandboxed agents, verify the operating-system primitive actually used under the deployed kernel and seccomp profile.

## Developer checklist

### Today

- [ ] **React/Next.js:** resolve React, `react-server-dom-*` and Next.js from lockfiles and deployed images; evidence is fixed React patch versions and Next.js **16.4.1+**, or a documented, code-backed “not affected” RSC path.
- [ ] **PostgreSQL:** inventory every server, replica and restore image; evidence is **18.7 / 17.12 / 16.16 / 15.20 / 14.25** plus an owner and date for leaving PostgreSQL 14.
- [ ] **FastAPI generation:** find `fastapi-code-generator` and every OpenAPI source; evidence is **0.8.1**, a pinned specification digest and confirmation that generation has no production secrets.
- [ ] **Outlook:** confirm the November 2026 update is deployed to managed endpoints; evidence is endpoint-management compliance for CVE-2026-124194.

### This week

- [ ] **Tenant isolation:** run `INSERT ... ON CONFLICT DO UPDATE` with two tenant identities against every RLS-protected upsert; evidence is a rejected cross-tenant test on the patched PostgreSQL server.
- [ ] **Server Actions:** test direct invocation without UI navigation and with a second tenant; evidence is a denied request for every sensitive action reachable from cached RSC pages.
- [ ] **Rust sandbox:** resolve `cap-primitives` and test trailing-slash symlinks under the deployed OS/kernel/seccomp profile; evidence is **3.4.6 / 4.0.3+** and a passing escape regression test.
- [ ] **Malicious crate check:** search current and historical Cargo.lock, SBOM, cache and build logs for `lwd-uri-util`; evidence is “not present” across history or a completed credential-rotation and egress investigation.

### Backlog

- [ ] **Generated-code governance:** isolate specification and agent-driven generators in a secret-free job with reviewed diffs; evidence is a workflow test proving generated code cannot be imported or promoted before approval.

## Copy this prompt

```text
Assess <REPOSITORY> and <DEPLOYMENT_ENVIRONMENT> for the verified issues in the 16 November 2026 AppSec brief. Begin in read-only assessment mode. Do not modify code, dependencies, lockfiles, generated output, infrastructure, access policies or credentials without explicit approval from <APP_OWNER>. Do not expose secrets or upload proprietary code.

Inspect source, workflows, resolved lockfiles, SBOMs, deployed image digests, runtime configuration, database versions and identity boundaries before drawing conclusions. Determine whether these are actually present and reachable:
- react-server-dom-webpack, react-server-dom-parcel or react-server-dom-turbopack in affected React 19 patch ranges; Next.js 16.0.0–16.4.0; App Router, Cache Components, use cache functions returning multiple typed arrays plus attacker-controlled values; and Server Actions reachable without independent authorization;
- PostgreSQL before 18.7, 17.12, 16.16, 15.20 or 14.25; RLS-protected tenant tables where application roles have INSERT, UPDATE and SELECT; and ON CONFLICT DO UPDATE paths that may expose another tenant's rows;
- fastapi-code-generator below 0.8.1; untrusted or agent-generated OpenAPI paths, response keys or summaries; generated Python imported in CI or runtime; and secrets or write permissions available to generation jobs;
- cap-primitives below 3.4.6 or 4.0.0–4.0.2; trailing-slash symlinks; and the actual OS, kernel, openat2 and seccomp behavior used in deployment;
- lwd-uri-util in current or historical lockfiles, SBOMs, caches and build logs;
- managed Outlook endpoints missing the vendor update for CVE-2026-124194.

For each finding, cite exact files, lines, resolved versions, image digests, server versions, configurations, identities and reachable paths. Classify urgency as Act now, Plan, Watch or No action and confidence as high, medium or low. State "not affected" when evidence supports it and "unknown" when evidence is insufficient. Do not infer exposure from a package name alone.

Propose the smallest remediation and verification commands or tests. Include direct Server Action authorization tests, two-tenant PostgreSQL upsert tests, generated-code diff and import controls, sandbox symlink regression tests, historical package searches and endpoint compliance evidence where relevant. Separate confirmed facts from inference.
```

## Monday action plan

1. **React platform lead:** patch the RSC and Next.js dependency chain; complete with resolved lockfiles, deployed image digests and direct Server Action authorization tests.
2. **Database platform lead:** apply the PostgreSQL minor release and plan PostgreSQL 14 exit; complete with server inventory, failover verification and a two-tenant upsert test.
3. **Python tooling lead:** update and isolate FastAPI code generation; complete with generator version, pinned spec digest, secret-free job and reviewed generated diff.
4. **Rust/agent platform lead:** patch `cap-primitives` and investigate `lwd-uri-util`; complete with historical evidence and a deployed-environment sandbox test.
5. **Endpoint security:** close CVE-2026-124194 exposure; complete with managed-device update compliance and an outbound-NTLM control decision.

## References

- [GitHub Advisory Database — CVE-2026-126187 / GHSA-xqc2-xf4c-x3h3, materially updated 10 November 2026](https://github.com/advisories/GHSA-xqc2-xf4c-x3h3)
- [Vercel Next.js advisory — GHSA-673q-mjm6-r5xr, published 14 October 2026](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)
- [PostgreSQL Global Development Group — 18.7, 17.12, 16.16, 15.20 and 14.25 release, 12 November 2026](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/)
- [PostgreSQL Global Development Group — CVE-2026-120154, published 12 November 2026](https://www.postgresql.org/support/security/CVE-2026-120154/)
- [GitHub Advisory Database — CVE-2026-63469 / GHSA-6xmv-cjr5-w3q8, reviewed 9 November 2026](https://github.com/advisories/GHSA-6xmv-cjr5-w3q8)
- [GitHub Advisory Database — CVE-2026-63470 / GHSA-h667-4jj2-cgv4, updated 9 November 2026](https://github.com/advisories/GHSA-h667-4jj2-cgv4)
- [GitHub Advisory Database — CVE-2026-63471 / GHSA-p2mm-64f6-gmpp, reviewed 9 November 2026](https://github.com/advisories/GHSA-p2mm-64f6-gmpp)
- [RustSec — RUSTSEC-2026-0482, issued 11 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0482.html)
- [RustSec — RUSTSEC-2026-0483, issued 11 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0483.html)
- [Microsoft Security Response Center — CVE-2026-124194, released 10 November 2026](https://msrc.microsoft.com/security-guidance/advisory/CVE-2026-124194)
- [OWASP Dependency-Track — release 5.2.1, published 25 October 2026](https://github.com/DependencyTrack/dependency-track/releases/tag/5.2.1)
