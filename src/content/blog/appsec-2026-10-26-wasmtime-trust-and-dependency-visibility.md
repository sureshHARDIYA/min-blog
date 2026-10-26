---
title: 'AppSec Lead Brief: patch Wasmtime, then prove dependency visibility'
seoTitle: 'Wasmtime sandbox escapes and pnpm visibility | AppSec Brief'
description: 'Critical Wasmtime compiler flaws, a Tokio use-after-free, Rust TLS trust fixes, and new package-control options.'
seoDescription: 'AppSec briefing for 26 October 2026 covering critical Wasmtime sandbox escapes, Tokio 1.54.0, Rust certificate trust and pnpm Dependabot visibility.'
date: '2026-10-26'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, rust, wasmtime, software-supply-chain, dependabot, ai-security'
---

## Executive summary

The urgent decision this week is whether untrusted WebAssembly reaches Wasmtime. Two critical Cranelift compiler defects can turn a crafted module into a sandbox escape, including one that affects default settings on every platform in older supported lines. Patch the runtime first, but do not stop there: the outer process, container and identity boundary determines the real blast radius. A separate pnpm 12 limitation is a useful reminder that an enabled dependency scanner is not the same as complete dependency visibility.

## Risk at a glance

- **Act now if exposed — Wasmtime/Cranelift:** crafted WebAssembly can trigger compiler miscompilation and escape the sandbox. Move maintained branches to **36.0.19, 48.0.7, 49.0.4 or later**, as applicable. No active exploitation is reported. **Owner:** agent/runtime platform lead.
- **Act now if present — Tokio:** **1.54.0** has a use-after-free race in `Interval` on the multi-threaded runtime and has been yanked. Upgrade to **1.54.1+**. **Owner:** Rust service owner.
- **Act now if present — Rust TLS roots:** affected `rustls-webpki`, `webpki-roots` and `webpki-root-certs` versions may accept paths through distrusted emSign intermediates whose private keys are public. **Owner:** platform networking lead.
- **Plan — GitHub package controls:** the new package firewall can gate packages before agents and CI install them, while Dependabot now exposes recorded dependency versions through its REST API. **Owner:** DevSecOps.
- **Watch — pnpm 12:** split-document lockfiles can be invisible to GitHub’s dependency graph, suppressing Dependabot alerts and security updates. **Owner:** JavaScript platform lead.
- **No action:** no consequential new core FastAPI, React/Next.js, PostgreSQL, SQL Server, Azure/Entra, CycloneDX or Dependency-Track release was verified in this review window.

## Wasmtime: compiler bugs can invalidate the sandbox

**What changed.** Bytecode Alliance published two critical advisories on 19 October. Both affect the Cranelift compiler used by Wasmtime, but their reach differs.

**Evidence.** [CVE-2026-115889 / GHSA-897f-g5gm-fmxm](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-897f-g5gm-fmxm) describes silent overflow in bit-packed SSA value indexes. A sufficiently large or crafted function can produce incorrect intermediate representation, type confusion and arbitrary side effects. Wasmtime with default settings is affected on any architecture before 36.0.19 and across versions 37 through 42; version 43 changed the representation and is not affected by this flaw.

[CVE-2026-115893 / GHSA-mghf-wjfp-p5xm](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-mghf-wjfp-p5xm) is specific to AArch64. A `br_table` with roughly 256,000 targets can compile to an incorrect branch target, allowing a user-controlled module to jump to arbitrary code. Fixed releases are **36.0.19, 48.0.7 and 49.0.4**. Both advisories score 9.9; neither reports exploitation in the wild.

**Why it matters to this stack.** Agent runtimes increasingly use WebAssembly for plugins, policy modules and generated transformations. Compiler correctness is part of the security boundary. If a guest escapes, it receives the permissions of the Wasmtime host process—not merely the capabilities intentionally exposed to the guest.

**Exposure check.** Search `Cargo.lock`, container SBOMs and runtime inventories for `wasmtime`, `wasmtime-wasi` and Cranelift. Record the resolved version, host architecture and every path where tenant-controlled or agent-produced Wasm is loaded. Then list the host identity, mounts, environment variables and reachable network destinations.

**Recommended response.** Upgrade to the fixed release on the maintained branch, rebuild and retain the deployed image digest. Until deployed, stop accepting untrusted modules on affected runtimes. Keep execution inside a disposable process or container with no ambient cloud credentials, minimal mounts, restricted egress and resource limits. A passing Wasm functional test does not prove that the sandbox is safe; retain the resolved runtime version and isolation-policy tests as evidence.

## Tokio 1.54.0: a one-release use-after-free

**What changed and evidence.** [RUSTSEC-2026-0384](https://rustsec.org/advisories/RUSTSEC-2026-0384.html), issued 22 October, covers a race between `Interval::poll_tick` and Tokio’s time driver. It can corrupt task reference counts or heap memory and has caused production crashes. The issue affects only **Tokio 1.54.0**, only `Interval`, and only the multi-threaded runtime; `Sleep` and `Timeout` are unaffected. The release was yanked and **1.54.1** is patched.

**Why it matters to this stack.** Tokio is commonly transitive in Rust APIs and background workers. A narrow vulnerable range makes manifest inspection unreliable: the answer is in the resolved lockfile and deployed binary.

**Exposure check.** Run `cargo tree -i tokio` and confirm whether `Cargo.lock` resolves 1.54.0. Search for `interval`, `interval_at` and `.tick().await`, then confirm the runtime flavor.

**Recommended response.** Resolve Tokio to **1.54.1 or later**, rebuild and deploy. If the affected version ran in production, correlate unexplained panics or memory-corruption symptoms with the deployment window; do not assume every crash was an attack.

## Rust TLS: remove distrusted emSign paths

**What changed.** RustSec published three related advisories on 20 October after emSign intermediates were distrusted and their private keys became public.

**Evidence.** [RUSTSEC-2026-0382](https://rustsec.org/advisories/RUSTSEC-2026-0382.html) says affected `rustls-webpki` versions may accept a certificate path through those intermediates when the configured trust anchors permit it; **0.103.16** and **0.104.0-alpha.8** contain the rejection. [RUSTSEC-2026-0381](https://rustsec.org/advisories/RUSTSEC-2026-0381.html) and [RUSTSEC-2026-0383](https://rustsec.org/advisories/RUSTSEC-2026-0383.html) cover bundled roots in `webpki-roots` and `webpki-root-certs`; **1.0.10** removes the affected root. Compatibility version 0.26.11 re-exports a separately resolved 1.x store, so that parent dependency must still resolve to 1.0.10 or later.

**Why it matters to this stack.** A service can use TLS correctly at the API layer yet trust a path the ecosystem has explicitly removed. This affects outbound HTTPS, service-to-service calls and agent tool access when the application uses these Rust trust stores; it does not imply that Microsoft Entra ID or system-native certificate stores are affected.

**Exposure check.** Run `cargo tree -i rustls-webpki`, `cargo tree -i webpki-roots` and `cargo tree -i webpki-root-certs`. Confirm which trust store the deployed client actually loads rather than inferring it from a direct dependency.

**Recommended response.** Upgrade the resolved trust-store and verifier packages, rebuild and record the dependency tree. Add a test that a chain through the distrusted intermediates is rejected if TLS validation is security-critical to the service.

## Supply-chain watch

### Package installation gets a policy gate

[GitHub’s package firewall](https://github.blog/changelog/2026-10-20-github-package-firewall-in-public-preview/), released in public preview on 20 October for GitHub Enterprise Cloud, proxies metadata and package downloads from endpoints and internal registries. Policies can apply a package-age cooldown, check malware or vulnerability advisories, and detect attestation downgrades. This is particularly relevant to coding agents and ephemeral CI workers because they routinely install dependencies without a human reviewing each version.

**Plan, not automatic adoption:** pilot it on an agent or CI runner, measure false positives and define an exception owner. Keep lockfiles, registry allowlists and build isolation; a preview firewall is an additional control, not provenance proof.

### pnpm 12 can create a Dependabot blind spot

GitHub added Dependabot support for npm 12, pnpm 11/12 and Bun 1.4 on 20 October, but documented an important limitation: pnpm 12’s default two-document lockfile format, when a package-manager version is pinned, is not yet detected by the dependency graph. Version updates still work, but Dependabot alerts and security updates may not be created, and existing alerts may close.

**Action if adopting pnpm 12:** inspect the generated `pnpm-lock.yaml`, verify the dependency graph in GitHub, and compare it with a build-derived CycloneDX SBOM. Do not treat disappearing alerts as remediation. Applications remaining on pnpm 10 or 11 are not affected by this specific split-document limitation.

The [Dependabot alerts REST API](https://github.blog/changelog/2026-10-20-dependabot-alerts-rest-api-now-includes-dependency-versions/) now includes the resolved or declared dependency version it recorded. Teams synchronizing alerts into LAIS, Dependency-Track or another risk system can use this field, but it may be null, truncated or represent only one matched version. Preserve the lockfile or submitted dependency graph as the stronger evidence.

No new OWASP Dependency-Track release appeared after 5.2.0, and no new CycloneDX specification release was identified. No newly verified malicious npm, PyPI or Cargo campaign met this brief’s primary-source threshold.

## AI-assisted development watch

This week connects agent safety to ordinary build controls. An agent that may choose dependencies should not have unrestricted access to the public registry, immediate installation of newly published packages, or credentials that survive the job. Route installs through an approved registry or policy gate, pin the lockfile, run lifecycle scripts only when required, and execute builds with a disposable task identity.

For Wasm-based tools, reviewers must trace both boundaries: what the guest can request and what the host process can actually reach after a sandbox failure. AI review should produce file-and-lockfile evidence, not a generic claim that “the sandbox is enabled” or “Dependabot is on.”

## Developer checklist

### Today

- [ ] Run `cargo audit` and `cargo tree -i wasmtime`; retain a fixed resolved version plus the deployed image digest, or evidence of non-presence.
- [ ] Record Wasmtime host architecture, identity, mounts and egress for every untrusted-Wasm path; completion evidence is a reviewed runtime-boundary document.
- [ ] Run `cargo tree -i tokio`; retain proof that **1.54.0** is absent from every deployed Rust artifact.
- [ ] Check `rustls-webpki`, `webpki-roots` and `webpki-root-certs`; retain patched lockfile versions and a rebuilt artifact digest.

### This week

- [ ] Test that Wasm workers cannot access a harmless sentinel file or denied network destination outside their intended capability set; retain test output.
- [ ] If piloting pnpm 12, compare GitHub’s dependency graph with the resolved lockfile and CycloneDX SBOM; record any missing components before enabling security gates.
- [ ] If Dependabot data feeds another platform, capture the new `version_requirement` field and retain fallback evidence for null, truncated or multi-version results.

### Backlog

- [ ] Pilot a registry or package-firewall policy for agent and CI dependency installs; completion evidence is a blocked new-package test plus an approved exception workflow.

## Copy this prompt

```text
Perform a read-only AppSec assessment of <REPOSITORY> for <DEPLOYMENT_ENVIRONMENT>, owned by <APP_OWNER>.

Inspect manifests, resolved lockfiles, build artifacts, SBOMs, deployment configuration and reachable code paths before drawing conclusions. Do not modify code, dependencies, lockfiles, infrastructure or access policies without explicit approval. Do not expose secrets or upload proprietary code.

Check for:
1. Wasmtime/Cranelift affected by CVE-2026-115889 or CVE-2026-115893. Record exact versions, host architecture, whether untrusted or agent-produced Wasm is reachable, and the host process identity, mounts, environment and egress.
2. Tokio exactly 1.54.0 where Interval runs on the multi-threaded runtime.
3. rustls-webpki before 0.103.16, or affected webpki-roots/webpki-root-certs dependency resolution before 1.0.10. Determine the trust store actually used by the deployed client.
4. pnpm 12 split-document lockfiles that GitHub's dependency graph does not detect. Compare GitHub visibility with the resolved lockfile and a build-derived CycloneDX SBOM.
5. Coding-agent and CI dependency installs that bypass an approved registry, package-age policy, attestation check or isolated build identity.

For every result, cite exact files, dependency paths, versions, configuration and reachability evidence. Classify urgency as Act now, Plan, Watch or No action, and confidence as high, medium or low. State “not affected” when evidence proves absence or non-reachability; state “unknown” when evidence is insufficient.

Propose the smallest remediation and exact verification commands or tests. Use harmless sentinel files and denied destinations for isolation tests. Do not run exploit payloads against production or access real secrets.
```

## Monday action plan

1. **Agent/runtime platform:** patch every reachable Wasmtime line and prove the deployed version and outer isolation boundary.
2. **Rust service owners:** eliminate Tokio 1.54.0 and update affected Rust TLS trust packages; retain resolved dependency evidence.
3. **JavaScript platform:** verify that any pnpm 12 lockfile is visible to the dependency graph and build SBOM.
4. **DevSecOps:** assess a package-policy gate for coding agents and CI, including cooldown and exception ownership.
5. **Security engineering:** update dependency-ingestion logic to use recorded versions without treating incomplete API fields as authoritative.

## References

- Bytecode Alliance, [Wasmtime bit-packing sandbox escape, GHSA-897f-g5gm-fmxm](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-897f-g5gm-fmxm), 19 October 2026.
- Bytecode Alliance, [Wasmtime AArch64 `br_table` sandbox escape, GHSA-mghf-wjfp-p5xm](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-mghf-wjfp-p5xm), 19 October 2026.
- RustSec, [Tokio race advisory RUSTSEC-2026-0384](https://rustsec.org/advisories/RUSTSEC-2026-0384.html), 22 October 2026.
- RustSec, [`rustls-webpki` trust advisory RUSTSEC-2026-0382](https://rustsec.org/advisories/RUSTSEC-2026-0382.html), 20 October 2026.
- RustSec, [`webpki-roots` advisory RUSTSEC-2026-0381](https://rustsec.org/advisories/RUSTSEC-2026-0381.html), 20 October 2026.
- RustSec, [`webpki-root-certs` advisory RUSTSEC-2026-0383](https://rustsec.org/advisories/RUSTSEC-2026-0383.html), 20 October 2026.
- GitHub, [package firewall public preview](https://github.blog/changelog/2026-10-20-github-package-firewall-in-public-preview/), 20 October 2026.
- GitHub, [Dependabot support and pnpm 12 limitation](https://github.blog/changelog/2026-10-20-dependabot-now-supports-npm-12-pnpm-11-and-12-and-bun-1-4/), 20 October 2026.
- GitHub, [Dependabot alerts API dependency versions](https://github.blog/changelog/2026-10-20-dependabot-alerts-rest-api-now-includes-dependency-versions/), 20 October 2026.
