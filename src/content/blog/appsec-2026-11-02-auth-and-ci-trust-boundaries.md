---
title: 'AppSec Lead Brief: stop treating metadata as proof'
seoTitle: 'Authentication and CI trust boundaries | AppSec Brief'
description: 'Account takeover, signature bypass and CI trust flaws show why state, metadata and cached artifacts need explicit validation.'
seoDescription: 'AppSec briefing for 2 November 2026 covering Better Auth, Authlib, Python publishing, Rust CI risks and GitHub supply-chain controls.'
date: '2026-11-02'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, authentication, python, rust, github-actions, software-supply-chain, ai-security'
---

## Executive summary

The most important engineering decision this week is to stop treating protocol state and pipeline metadata as proof. Better Auth can confuse OAuth state with a magic-link token, while Authlib can accept a JWS JSON object with no signatures as verified. In delivery pipelines, an affected Python publishing action inherits a distrusted certificate path, a Rust build script can persist environment secrets into shared caches, and a portable test recording can execute code. Check real configurations and resolved versions first; the vulnerable package name alone is not enough to establish exposure.

## Risk at a glance

- **Act now if exposed — Better Auth account takeover:** `better-auth` **1.4.0-beta.18 through 1.7.6** is vulnerable only when specific Magic Link, OAuth and database-backed state settings overlap. Upgrade to **1.7.7+**. No active exploitation is reported. **Owner:** identity/application lead.
- **Act now if present — Authlib signature bypass:** `authlib <=1.8.0` can accept an empty JWS JSON `signatures` array as successfully verified. Upgrade to **1.9.0+** and find direct uses of `JsonWebSignature.deserialize_json()`. No active exploitation is reported. **Owner:** Python/API lead.
- **Act now if used — Python package publishing:** `pypa/gh-action-pypi-publish <=1.14.2` retained a distrusted emSign root in the certificate chain used by Sigstore-backed publishing and attestations. Move to **1.14.3+** and review published artifacts. **Owner:** release engineering.
- **Act now if exposed — Rust CI and caches:** `cargo-nextest 0.9.125–0.9.149` can execute code from an untrusted portable recording; `libz-sys 1.0.21–1.1.30` can write the build environment into `target/`. **Owner:** Rust platform lead.
- **Plan — GitHub Actions lockfiles and Dependabot reachability:** workflow dependency lockfiles are generally available, and JavaScript/TypeScript reachability analysis is in public preview. **Owner:** DevSecOps.
- **No action:** no consequential new core FastAPI, React/Next.js, PostgreSQL, SQL Server, Azure/Entra, CycloneDX or Dependency-Track release was verified in this review window.

## Better Auth: OAuth state is not proof of mailbox access

**What changed.** The Better Auth advisory for [CVE-2026-114607 / GHSA-965c-763c-88jm](https://github.com/advisories/GHSA-965c-763c-88jm) was materially updated on 27 October. A value created to protect an OAuth flow can also be accepted as a Magic Link token. An unauthenticated attacker who knows an email address can obtain a session without reading that mailbox or completing the OAuth callback.

**Evidence.** The affected range is **1.4.0-beta.18 through 1.7.6**; **1.7.7** is patched. Exposure requires Magic Link plus a social or Generic OAuth provider, database-backed OAuth state, and one of the affected token/identifier storage combinations described in the advisory. Cookie-backed state blocks this path except for the separately documented OAuth Proxy condition. GitHub rates the issue critical; the advisory does not report exploitation in the wild.

**Why it matters to this stack.** Next.js applications often compose authentication from plugins. In a multi-tenant application, a normal session can become cross-tenant access if tenant membership is inferred from email domain or if authorization trusts claims created at sign-in.

**Exposure check.** Inspect the resolved `better-auth` version and configuration for Magic Link, social/Generic OAuth, `account.storeStateStrategy`, `storeToken`, `verification.storeIdentifier` and OAuth Proxy. Trace what a newly created session can reach; do not infer exposure from `package.json` alone.

**Recommended response.** Upgrade to **1.7.7+**. Invalidate sessions created during the exposure window if the vulnerable configuration was internet-reachable. Add a negative integration test proving that an OAuth state value cannot complete a Magic Link flow, and require an explicit tenant membership record rather than an email-domain shortcut.

## Authlib: an empty signature list can pass verification

**What changed.** [CVE-2026-96760 / GHSA-6v38-4h7w-rj9h](https://github.com/advisories/GHSA-6v38-4h7w-rj9h), updated 27 October, covers a verification bypass in Authlib. `JsonWebSignature.deserialize_json()` initializes the result as valid; when a JWS JSON object supplies an empty `signatures` array, no cryptographic check runs and the payload is returned as verified.

**Evidence.** The affected range is **Authlib <=1.8.0** and the fix is **1.9.0**. This is specifically the JWS JSON deserialization API, not evidence that every Authlib-backed OAuth or JWT flow is affected. No active exploitation is reported.

**Why it matters to this stack.** Python APIs may use signed JSON for webhook events, inter-service assertions or agent tool envelopes. If application code treats successful deserialization as authorization, forged data can cross an identity boundary.

**Exposure check.** Search source and transitive call paths for `JsonWebSignature`, `deserialize_json` and JWS JSON inputs. Identify whether untrusted input reaches the method and whether its result controls identity, tenant, role, payment or tool execution.

**Recommended response.** Upgrade to **1.9.0+**. Add tests that reject missing, empty, malformed and invalid signature arrays. Keep signature verification and authorization as separate checks, with expected algorithm, issuer, audience and key selection constrained by server-side policy.

## Supply-chain watch: publishing, test recordings and build caches

### Python publishing trust

The [PyPA advisory GHSA-5xjx-3w67-w9x9](https://github.com/advisories/GHSA-5xjx-3w67-w9x9) was reviewed on 30 October. `pypa/gh-action-pypi-publish <=1.14.2` included a distrusted emSign root through `certifi`; the action relies on that trust store for Sigstore-backed Trusted Publishing and digital attestations. Version **1.14.3** removes it.

If the action is present, update the workflow and record the resolved action commit. Inventory releases published while an affected version ran, then compare PyPI files and attestations with locally retained build provenance. This advisory establishes a weakened trust path, not proof that a particular release was altered.

### Rust CI inputs and caches

[RUSTSEC-2026-0412](https://rustsec.org/advisories/RUSTSEC-2026-0412.html) affects `cargo-nextest` **0.9.125–0.9.149** when experimental run recording is enabled. An attacker-supplied portable recording can inject Cargo configuration and execute code during `cargo nextest run --rerun`, including on a warm cache and before tests run. Upgrade to **0.9.150+**, set `nextest-version = "0.9.150"`, and never rerun recordings from an untrusted issue or URL in a secret-bearing job.

[RUSTSEC-2026-0418](https://rustsec.org/advisories/RUSTSEC-2026-0418.html) affects `libz-sys` **1.0.21–1.1.30** on Unix when built with `cc 1.6.0+`. Its build script prints the full environment, and Cargo persists that output under `target/`; shared CI caches can therefore become secret-bearing artifacts. Upgrade to **1.1.31+**, inspect cache scope and retention, and rotate credentials only when logs or caches confirm sensitive values were present and accessible.

### GitHub controls worth adopting

GitHub made [Actions workflow dependency lockfiles generally available](https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available/) on 28 October. `.github/workflows/actions.lock` records exact commits for actions and transitive action dependencies while workflows retain readable tag references. Dependabot can update the workflow and lockfile together, and administrators can require lockfiles. Locking prevents unexpected movement; it does not make an unsafe action safe.

GitHub also introduced [Dependabot reachability analysis](https://github.blog/changelog/2026-10-28-prioritize-dependabot-alerts-with-reachability-analysis/) in public preview for JavaScript and TypeScript on Enterprise Cloud. CodeQL-derived call paths classify alerts as reachable, potentially reachable, unreachable or unavailable. Treat **potentially reachable** as reachable, and never translate **unreachable** into automatic dismissal without considering runtime loading, generated code and configuration-only paths.

No consequential new CycloneDX specification or Dependency-Track feature release was identified after the previous brief. Keep generating SBOMs from resolved dependencies and deployed artifacts; this week’s issues reinforce why manifest-only inventory is insufficient.

## AI-assisted development watch

Agents amplify the same trust mistakes when they consume issue attachments, test recordings, cached artifacts or identity metadata as if those inputs were authoritative. A coding agent may correctly run the requested command and still cross a security boundary: rerunning an attacker-controlled recording is the clearest example this week.

Keep agent assessment read-only by default. Separate untrusted-input jobs from jobs holding repository, package-registry or cloud credentials; require exact workflow dependency locks; and make authentication tests include adversarial state reuse and unsigned-object cases. Reachability evidence is useful context for an agent, but it is not permission to dismiss an alert automatically.

## Developer checklist

### Today

- [ ] **Better Auth:** confirm the resolved version and all five relevant Magic Link/OAuth storage settings; evidence is a configuration excerpt with secrets redacted plus a lockfile showing **1.7.7+**, or a documented “not affected” condition.
- [ ] **Authlib:** search for `JsonWebSignature.deserialize_json()` and upgrade to **1.9.0+** where reachable; evidence is the resolved dependency and a test rejecting `{"signatures":[]}`.
- [ ] **Python publishing:** find `pypa/gh-action-pypi-publish` in workflows and move affected references to **1.14.3+**; evidence is the workflow diff and recorded resolved commit.
- [ ] **Rust CI:** inventory `cargo-nextest` and reject untrusted portable recordings; evidence is **0.9.150+** plus `nextest-version = "0.9.150"`, or proof the feature is absent.

### This week

- [ ] **Rust caches:** resolve `libz-sys` to **1.1.31+** and review `target/` cache access; evidence is `Cargo.lock`, cache scope/retention and a documented secret-exposure decision.
- [ ] **GitHub Actions:** generate and review `.github/workflows/actions.lock` for one production workflow; evidence is a committed lockfile and a passing stale-lockfile check.
- [ ] **Identity:** add negative tests for OAuth-state reuse, missing signatures and cross-tenant session access; evidence is named tests failing before the fix and passing afterward.

### Backlog

- [ ] **Dependabot:** pilot JavaScript/TypeScript reachability analysis on one eligible repository; evidence is at least one alert verdict reviewed against the lockfile and runtime architecture.

## Copy this prompt

```text
Assess <REPOSITORY> for the verified issues in the 2 November 2026 AppSec brief. Begin in read-only mode. Do not modify code, dependencies, lockfiles, workflows, infrastructure or access policies without explicit approval from <APP_OWNER>. Do not expose secrets or upload proprietary code.

Inspect source, workflows, configuration, resolved lockfiles, SBOMs and deployment evidence before drawing conclusions. Check for:
- better-auth 1.4.0-beta.18 through 1.7.6 plus the affected Magic Link, OAuth, state-storage and token-identifier configuration;
- Authlib <=1.8.0 where untrusted JWS JSON can reach JsonWebSignature.deserialize_json(), especially identity, tenant, role or tool-execution paths;
- pypa/gh-action-pypi-publish <=1.14.2 and releases produced by those workflow runs;
- cargo-nextest 0.9.125 through 0.9.149, experimental run recording, and any path that accepts portable recordings from untrusted sources;
- libz-sys 1.0.21 through 1.1.30, cc 1.6.0+, Unix builds and shared target/ caches that may contain build-script output;
- GitHub Actions dependencies that are not covered by a current actions.lock file.

For every finding, cite exact files, lines, resolved versions, configurations and reachable code or workflow paths. Classify urgency as Act now, Plan, Watch or No action, and confidence as high, medium or low. State "not affected" when evidence supports it and "unknown" when evidence is insufficient. Do not equate package presence with reachability.

Propose the smallest remediation and the commands or tests that verify it. Include negative authentication tests, lockfile/SBOM checks, cache-scope evidence and workflow-resolution evidence where relevant. Treat Dependabot "potentially reachable" as reachable; do not automatically dismiss "unreachable" findings.
```

## Monday action plan

1. **Identity lead:** establish whether the Better Auth configuration is reachable; complete when version, settings and a negative state-reuse test are recorded.
2. **Python/API lead:** locate Authlib JWS JSON deserialization; complete when **1.9.0+** and empty-signature rejection are proven, or “not affected” is evidenced.
3. **Release engineering:** update the PyPI publishing action and review affected release provenance; complete with the resolved action commit and artifact decision log.
4. **Rust platform lead:** close `cargo-nextest` and `libz-sys` exposure; complete with lockfile versions and CI cache/recording policy evidence.
5. **DevSecOps:** lock one production GitHub Actions workflow and pilot Dependabot reachability; complete with a passing lockfile check and one manually validated verdict.

## References

- [Better Auth / GitHub Advisory Database — CVE-2026-114607, updated 27 October 2026](https://github.com/advisories/GHSA-965c-763c-88jm)
- [Authlib / GitHub Advisory Database — CVE-2026-96760, updated 27 October 2026](https://github.com/advisories/GHSA-6v38-4h7w-rj9h)
- [PyPA / GitHub Advisory Database — GHSA-5xjx-3w67-w9x9, reviewed 30 October 2026](https://github.com/advisories/GHSA-5xjx-3w67-w9x9)
- [RustSec — RUSTSEC-2026-0412, issued 27 October 2026](https://rustsec.org/advisories/RUSTSEC-2026-0412.html)
- [RustSec — RUSTSEC-2026-0418, issued 29 October 2026](https://rustsec.org/advisories/RUSTSEC-2026-0418.html)
- [GitHub Changelog — Actions workflow lockfiles generally available, 28 October 2026](https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available/)
- [GitHub Changelog — Dependabot reachability analysis, 28 October 2026](https://github.blog/changelog/2026-10-28-prioritize-dependabot-alerts-with-reachability-analysis/)
