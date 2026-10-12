---
title: 'AppSec Lead Brief: recheck JWT and agent execution boundaries'
seoTitle: 'fast-jwt, Docling and Dependency-Track 5.2 | AppSec Brief'
description: 'JWT verification failures, Docling local-file disclosure, vm2 sandbox breaks, and Dependency-Track 5.2 identity improvements.'
seoDescription: 'AppSec briefing for 12 October 2026 covering fast-jwt verification bugs, Docling file disclosure, vm2 sandbox risks and Dependency-Track 5.2.'
date: '2026-10-12'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, jwt, python, ai-security, software-supply-chain, dependency-track'
---

## Executive summary

This week’s most useful engineering decision is to verify authentication and sandbox assumptions from the running configuration, not only from package names. Four `fast-jwt` flaws show how an empty key, raw JWK data, infinite clock tolerance or caching can turn otherwise ordinary verifier options into signature or expiry bypasses. Docling and `vm2` separately reinforce that AI ingestion and code execution need operating-system boundaries when inputs are untrusted. Dependency-Track 5.2 offers a practical improvement: replace long-lived CI API keys with workload identity federation and give automation its own auditable identity.

## Risk at a glance

- **Act now if present — `fast-jwt`:** versions below **6.3.4** can be affected by one or more verifier flaws, depending on configuration and token shape. No active exploitation is confirmed in the cited advisories. **Owner:** application identity lead.
- **Act now if exposed — Docling:** `docling` or `docling-slim` **2.82.0/2.92.0 through 2.118.0**, when untrusted HTML is rendered from a filesystem path with Playwright. Local files can be captured in the rendered page image. **Owner:** AI/document-ingestion owner.
- **Act now if present — `vm2`:** versions before **3.11.7** have host-memory and `NodeVM` escape paths; later advisories make **3.12.2 or newer** the sensible inventory target. Treat an in-process sandbox as only one layer. **Owner:** agent/runtime platform lead.
- **Plan — Dependency-Track 5.2:** service accounts, workload identity federation, signed webhooks and outbound connection controls reduce standing secrets and improve attribution. **Owner:** DevSecOps/SBOM platform owner.
- **Watch if present — `noyalib`:** Rust versions before **0.0.53** do not enforce configured budgets on the typed deserialization path. **Owner:** Rust service owner.

## `fast-jwt`: several safe-looking options weaken verification

**What changed.** Four related advisories entered the GitHub Advisory Database on 8 October. Their common lesson is that the verifier’s effective security depends on key type, option values, token claims and caching—not merely on calling a verification function.

**Evidence.** The vendor advisories describe these distinct conditions:

- [CVE-2026-107720 / GHSA-8wpc-h4q6-8fxv](https://github.com/nearform/fast-jwt/security/advisories/GHSA-8wpc-h4q6-8fxv): `createVerifier` can accept an unsigned token when a synchronous key provider returns `''` or `null` and an algorithms allowlist is configured. Versions through 6.3.0 are affected; **6.3.1** fixes it.
- [CVE-2026-107724 / GHSA-g3jj-5cmm-3hxx](https://github.com/nearform/fast-jwt/security/advisories/GHSA-g3jj-5cmm-3hxx): serialized JWK or JWKS JSON can be treated as an HMAC secret, enabling an HS256 forgery. Versions from 6.2.4 through 6.2.x are affected; **6.3.0** fixes it.
- [CVE-2026-107721 / GHSA-687g-22h4-j4w4](https://github.com/nearform/fast-jwt/security/advisories/GHSA-687g-22h4-j4w4): `clockTolerance: Infinity` disables `exp` and `nbf` enforcement, including for cached verification. Versions before **6.3.0** are affected.
- [CVE-2026-107719 / GHSA-x937-hj6v-793p](https://github.com/nearform/fast-jwt/security/advisories/GHSA-x937-hj6v-793p): with caching enabled, a signed token containing `exp` but no `iat` can remain accepted after expiry. Versions through 6.3.3 are affected; **6.3.4** fixes it.

**Why it matters to this stack.** A Next.js API, Node.js backend or identity adapter can receive a valid-looking claims object while the signature or lifetime check has failed. This is especially serious when the claims select a tenant, authorize an administrative API or trigger an agent tool. It does not mean Microsoft Entra ID, NextAuth or every JavaScript JWT library is affected; the vulnerable package and conditions must be present.

**Exposure check.** Search every npm lockfile and built image for `fast-jwt`, including transitive use. Run `pnpm why fast-jwt` or the equivalent for the repository’s package manager. Then inspect verifier creation for nullable or empty key fallbacks, raw JWK/JWKS strings, `clockTolerance`, caching, accepted algorithms and whether issued tokens always contain `iat`.

**Recommended response.** Resolve `fast-jwt` to **6.3.4 or later**, rebuild and deploy. Add negative tests for `alg: none`, HS256 with serialized JWKS data, expired tokens without `iat`, future `nbf`, and unavailable key resolution. Record both the resolved dependency tree and the test results; a manifest edit alone does not prove that production is fixed.

## Docling: untrusted HTML can disclose local files during rendering

**What changed.** [CVE-2026-105750 / GHSA-q43m-vhcp-mhvm](https://github.com/docling-project/docling/security/advisories/GHSA-q43m-vhcp-mhvm), reviewed on 6 October, covers a local-file disclosure in Docling’s HTML rendering path.

**Evidence.** A crafted HTML file can reference `file://` resources. When `HTMLBackendOptions(render_page=True)` is used, Playwright is installed and the untrusted document is passed as a filesystem `Path`, local content may be embedded in the rendered page image. `docling` **2.82.0 through 2.118.0** and `docling-slim` **2.92.0 through 2.118.0** are affected; [version 2.118.1](https://github.com/docling-project/docling/releases/tag/v2.118.1) contains the fix. The advisory says the default `render_page=False`, stream inputs, the CLI and `docling-serve` are not affected by this path. No active exploitation is reported.

**Why it matters to this stack.** Document-to-vector and RAG pipelines often process tenant-supplied files beside cloud credentials, source checkouts or other tenants’ temporary data. An image produced by the converter can become an indirect exfiltration channel and may later be stored, indexed or returned to an agent.

**Exposure check.** Inspect Python lockfiles and the ingestion code together. Confirm the resolved Docling package, whether Playwright is installed, whether untrusted HTML arrives as a path, and whether page rendering is enabled. Trace where rendered images are stored and who can retrieve them.

**Recommended response.** Upgrade both packages to **2.118.1 or later**. Until then, disable page rendering for untrusted HTML or use the documented stream path. Run conversion in a container with no ambient cloud credentials, no host mounts containing secrets, per-job temporary storage, restricted egress and explicit resource limits. Verify the fix with a harmless fixture that references a non-sensitive sentinel file.

## `vm2`: do not make an in-process sandbox the final boundary

**What changed and evidence.** Two `vm2` advisories added to the GitHub Advisory Database on 5 October illustrate different escape routes. [CVE-2026-92947 / GHSA-fcqc-726x-5wfc](https://github.com/advisories/GHSA-fcqc-726x-5wfc) allows sandboxed code to read or alter host-realm memory through Node.js’s shared `Buffer` pool. [CVE-2026-92946 / GHSA-j3hm-6rg5-mchv](https://github.com/advisories/GHSA-j3hm-6rg5-mchv) allows code execution outside `NodeVM` when external `require` is enabled without an explicit `require.root`. Both affect versions before **3.11.7**.

**Why it matters to this stack.** Coding agents, workflow products and user-script features sometimes execute generated JavaScript with the assumption that a library sandbox is a complete trust boundary. Memory sharing and module loading are enough to invalidate that assumption, even when application-level APIs appear restricted.

**Exposure check.** Search lockfiles and runtime images for `vm2`, then identify every path where tenant or agent-generated code reaches `VM` or `NodeVM`. Record module-loading options, mounted files, environment variables, network access, runtime identity and resource limits.

**Recommended response.** Reconcile the complete advisory set and resolve to the current maintained line—[3.12.2 was released on 8 September](https://github.com/patriksimek/vm2/releases/tag/3.12.2)—rather than stopping at the first fixed version named above. More importantly, move hostile execution into a separate disposable process or container with no ambient credentials, a read-only or empty filesystem, network allowlists and CPU/memory/time limits. Retain `vm2` as defense in depth, not as the only barrier.

## Supply-chain watch

### Dependency-Track 5.2 improves machine identity and outbound control

[Dependency-Track 5.2.0](https://github.com/DependencyTrack/dependency-track/releases/tag/5.2.0), released 8 October, adds service accounts with their own permissions, audit identity and expiring API keys. It can exchange GitHub Actions, GitLab or Kubernetes workload tokens through OAuth 2.0 token exchange, removing the need to store a long-lived Dependency-Track key in CI. The release also adds HMAC-signed webhooks and a central outbound connection policy that blocks calls to the server itself and cloud metadata endpoints unless explicitly allowed.

**Plan:** test the upgrade, create one least-privileged service account per publishing workload and prefer federation where the CI platform supports it. Verify the token subject, audience and expiration in a staging upload before removing the old secret. Inventory legitimate outbound integrations before enforcing the new connection policy, then test that metadata and loopback destinations are denied. Sign webhooks and verify signatures at the receiver.

Teams remaining on 5.1 should at least assess [5.1.2](https://github.com/DependencyTrack/dependency-track/releases/tag/5.1.2), released 5 October. It includes PEP 503 PyPI name normalization, npm version-comparison fixes and Trivy PURL-qualifier matching that can change component or finding visibility.

### Rust and package-ecosystem watch

[RUSTSEC-2026-0333](https://rustsec.org/advisories/RUSTSEC-2026-0333.html), issued 8 October, reports that `noyalib` before **0.0.53** does not enforce configured resource budgets on its typed deserialization path. Default document-length, depth and alias controls still apply, so this is not an unlimited-parser claim. If hostile YAML reaches typed deserialization and your service relies on tighter budgets, update and retain a limit test.

No fresh malicious npm, PyPI or Cargo campaign met this brief’s primary-source verification threshold. No new CycloneDX specification announcement was identified in the window; Dependency-Track 5.2 is the material SBOM-platform change.

No consequential new core React/Next.js, FastAPI/Starlette, PostgreSQL, SQL Server or Azure/Entra advisory was verified between the previous brief and 12 October. That is a review result, not a clean bill of health, and it does not remove earlier patch obligations.

## AI-assisted development watch

This week’s issues converge on two review questions. First, can generated configuration weaken an authentication primitive—for example, by introducing a permissive algorithm list, empty-key fallback or infinite tolerance? Second, can untrusted input cross from a document or code runner into files, memory, credentials or another tenant’s data?

Require code review for changes to token verification and agent execution boundaries. For document ingestion, keep conversion workers isolated from application and cloud credentials. For code execution, use disposable OS-level isolation and a task-scoped identity even after library patches. Treat agent output as untrusted until tests prove the negative cases, and never give a coding agent production tokens merely so it can run a validation step.

## Developer checklist

### Today

- [ ] Run `pnpm why fast-jwt` (or the repository equivalent) across Node.js services; retain output proving **6.3.4+** or documented non-presence.
- [ ] If `fast-jwt` is present, locate verifier configuration and retain passing negative tests for unsigned, wrong-algorithm and expired-without-`iat` tokens.
- [ ] Inventory Docling versions and the `render_page`/Playwright/path-input combination; retain a **2.118.1+** lockfile or a documented unreachable-path result.
- [ ] Inventory `vm2` and every untrusted-code entry point; retain the resolved version and a diagram or configuration record of its process/container boundary.

### This week

- [ ] Rebuild and deploy patched Node.js or Python artifacts; record image digests and runtime dependency evidence rather than only merged lockfiles.
- [ ] Test document and code workers with non-sensitive sentinel files and denied network destinations; retain logs proving the isolation controls blocked access.
- [ ] Run `cargo audit` and check `noyalib`; retain **0.0.53+**, a compensating limit, or evidence that hostile YAML cannot reach typed deserialization.

### Backlog

- [ ] Pilot Dependency-Track 5.2 workload identity with a least-privileged staging service account; completion evidence is a successful SBOM upload without a stored long-lived API key.
- [ ] Enable signed Dependency-Track webhooks and outbound destination controls in staging; retain a valid delivery plus rejected bad-signature and metadata-destination tests.

## Copy this prompt

```text
Perform a read-only AppSec assessment of <REPOSITORY> for <DEPLOYMENT_ENVIRONMENT>, owned by <APP_OWNER>.

Inspect repository manifests, resolved lockfiles, build files, deployment configuration and reachable code paths before drawing conclusions. Do not modify code, dependencies, lockfiles, infrastructure or access policies without explicit approval. Do not expose secrets or upload proprietary code.

Check for:
1. fast-jwt below 6.3.4, including transitive use. If present, inspect nullable or empty signing-key fallbacks, raw JWK/JWKS strings, allowed algorithms, clockTolerance, verifier caching, and tokens with exp but no iat.
2. docling or docling-slim below 2.118.1. Determine whether untrusted HTML is passed as a filesystem Path while Playwright and HTMLBackendOptions(render_page=True) are active, and what local files the worker can read.
3. vm2 use in any tenant, plugin or agent-generated JavaScript path. Record the resolved version, VM/NodeVM options, external require/root settings, process or container boundary, credentials, mounts, network access and resource limits.
4. Rust noyalib below 0.0.53 where hostile YAML reaches typed deserialization and configured resource budgets are relied upon.
5. Dependency-Track CI integration using long-lived shared API keys, unsigned webhooks or unrestricted outbound destinations; assess whether 5.2 service accounts and workload identity federation fit the existing platform.

For every finding, cite exact files, dependency paths, configuration and reachability evidence. Classify urgency as Act now, Plan, Watch or No action, and confidence as high, medium or low. State “not affected” when evidence proves absence or non-reachability; state “unknown” when evidence is insufficient.

Propose the smallest remediation and the exact verification commands or tests. Include negative JWT tests, safe sentinel-file checks and isolation-policy tests where applicable. Do not execute exploit payloads against production or access real secrets.
```

## Monday action plan

1. **Application identity lead:** prove whether `fast-jwt` is deployed and close any exposure with version, configuration and negative-test evidence.
2. **AI platform owner:** map Docling input modes and `vm2` execution boundaries; patch reachable vulnerable paths and record rebuilt image digests.
3. **Platform security:** verify workers have no ambient credentials or unnecessary mounts and that egress restrictions block metadata services.
4. **Rust service owners:** run `cargo audit` and document the `noyalib` outcome for services accepting YAML.
5. **DevSecOps:** open a Dependency-Track 5.2 pilot with workload-federation, signed-webhook and outbound-policy acceptance tests.

## References

- NearForm, [fast-jwt unsigned-token advisory, GHSA-8wpc-h4q6-8fxv](https://github.com/nearform/fast-jwt/security/advisories/GHSA-8wpc-h4q6-8fxv), published 7 October 2026; GitHub Advisory Database publication 8 October 2026.
- NearForm, [fast-jwt serialized-JWK advisory, GHSA-g3jj-5cmm-3hxx](https://github.com/nearform/fast-jwt/security/advisories/GHSA-g3jj-5cmm-3hxx), published 7 October 2026; GitHub Advisory Database publication 8 October 2026.
- NearForm, [fast-jwt clock-tolerance advisory, GHSA-687g-22h4-j4w4](https://github.com/nearform/fast-jwt/security/advisories/GHSA-687g-22h4-j4w4), published 7 October 2026; GitHub Advisory Database publication 8 October 2026.
- NearForm, [fast-jwt cache-expiry advisory, GHSA-x937-hj6v-793p](https://github.com/nearform/fast-jwt/security/advisories/GHSA-x937-hj6v-793p), published 7 October 2026; GitHub Advisory Database publication 8 October 2026.
- Docling, [local-file disclosure advisory, GHSA-q43m-vhcp-mhvm](https://github.com/docling-project/docling/security/advisories/GHSA-q43m-vhcp-mhvm), reviewed 6 October 2026.
- Docling, [release 2.118.1](https://github.com/docling-project/docling/releases/tag/v2.118.1), 6 October 2026.
- GitHub Advisory Database, [`vm2` shared-buffer advisory, GHSA-fcqc-726x-5wfc](https://github.com/advisories/GHSA-fcqc-726x-5wfc), published 5 October 2026.
- GitHub Advisory Database, [`vm2` external-require advisory, GHSA-j3hm-6rg5-mchv](https://github.com/advisories/GHSA-j3hm-6rg5-mchv), published 5 October 2026.
- Dependency-Track, [Dependency-Track 5.2 announcement](https://www.dependencytrack.org/news/dependency-track-5-2/), 8 October 2026.
- OWASP Dependency-Track, [release 5.2.0](https://github.com/DependencyTrack/dependency-track/releases/tag/5.2.0), 8 October 2026.
- OWASP Dependency-Track, [release 5.1.2](https://github.com/DependencyTrack/dependency-track/releases/tag/5.1.2), 5 October 2026.
- RustSec, [`noyalib` advisory RUSTSEC-2026-0333](https://rustsec.org/advisories/RUSTSEC-2026-0333.html), 8 October 2026.
