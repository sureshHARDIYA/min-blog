---
title: "AppSec Lead Brief: an exploited identity API and two Rust cryptography checks"
seoTitle: "Exploited Cisco ISE API and Rust Crypto Risks | AppSec Brief"
description: "Cisco ISE exploitation makes identity infrastructure the immediate priority, while two Rust advisories require configuration-aware dependency checks."
seoDescription: "Weekly AppSec briefing for 21 September 2026 covering an actively exploited Cisco ISE API bypass, pqc_kyber key recovery, cryptoki memory exposure, SBOM implications and secure code review."
date: "2026-09-21"
author: "Suresh Kumar Mukhiya"
tags: "appsec, software-supply-chain, rust, cisco-ise, api-security, sbom, dependency-track, ai-security"
---

## Executive summary

The most important engineering decision this week is to treat Cisco Identity Services Engine as an incident-response target, not merely a patching task: Cisco confirms active exploitation of an unauthenticated API bypass that may end in root command execution. Rust teams should also make configuration-aware checks for `pqc_kyber`, where the optional AVX2 backend can expose a reused Kyber secret key, and for `cryptoki` in PKCS#11 or HSM integrations. Neither Rust advisory is evidence that every Rust service is exposed; reachability depends on enabled features, target architecture and invoked APIs. No consequential new core FastAPI, React/Next.js, PostgreSQL, Microsoft SQL Server, Azure/Entra, CycloneDX or Dependency-Track release crossed the action threshold in this review window.

## Risk at a glance

### Act now — Cisco ISE API authentication bypass

**Affected:** Cisco ISE and ISE-PIC. Cisco lists fixes in 3.1 Patch 12, 3.2 Patch 11, 3.3 Patch 12, 3.4 Patch 7 and 3.5 Patch 4; release 3.0 is end of maintenance.

**Evidence:** CVE-2026-76460, CVSS 10.0. Cisco PSIRT confirms active exploitation. A successful attack can bypass the web management interface and may obtain root command execution.

**Suggested owner:** Network identity / infrastructure security, with incident response.

### Act now if present — `pqc_kyber` with AVX2 and reused keys

**Affected:** `pqc_kyber` 0.7.1 on x86_64 when built with `features = ["avx2"]` and a Kyber key pair is reused across decapsulations.

**Evidence:** RUSTSEC-2026-0290 demonstrates full ML-KEM-768 secret-key recovery in 4,272 decapsulation queries. The default backend and non-x86_64 targets are unaffected. The crate is unmaintained and has no patched release.

**Suggested owner:** Rust service owner / cryptography lead.

### Plan this sprint — `cryptoki` PKCS#11 attribute decoding

**Affected:** Rust applications that use `cryptoki` to retrieve a nonempty `CKA_ALLOWED_MECHANISMS` attribute. Fixed releases are 0.10.1, 0.11.1 and 0.12.1 for their respective branches.

**Evidence:** RUSTSEC-2026-0286 describes an out-of-bounds read reachable through the safe `Session::get_attributes` API, with possible crash, denial of service or disclosure of adjacent heap words. No active exploitation is reported.

**Suggested owner:** Rust service owner / key-management platform team.

### No action — reviewed core stack and SBOM tooling

**Affected:** FastAPI/Starlette, React/Next.js, PostgreSQL, Microsoft SQL Server, Azure/Entra, CycloneDX and OWASP Dependency-Track.

**Evidence:** Primary-source review through 21 September found no consequential material update since the previous brief. Existing patch and Dependency-Track 5.1 migration work remains valid; this is not a claim that these technologies are vulnerability-free.

**Suggested owner:** Existing service owners; continue normal monitoring.

## Significant developments

## 1. Cisco ISE: an authentication bypass in the identity control plane

### What changed

On 16 September, Cisco published CVE-2026-76460 for an API endpoint in Identity Services Engine and ISE-PIC. The flaw allows an unauthenticated remote attacker to bypass the web-management authentication boundary. Cisco states that successful exploitation may result in root command execution and that its PSIRT is aware of active exploitation.

### Evidence

Cisco rates the issue CVSS 10.0, says it affects ISE and ISE-PIC regardless of device configuration, and provides no workaround. Infrastructure ACLs that restrict management and control-plane traffic are only a temporary mitigation. Cisco's fixed releases are 3.1 Patch 12, 3.2 Patch 11, 3.3 Patch 12, 3.4 Patch 7 and 3.5 Patch 4.

### Why it matters to this stack

ISE can sit upstream of developer, CI/CD, administrative and production access. Compromise is therefore not limited to one application: an attacker controlling the identity and network-access policy plane may gain a path to repositories, build agents, artifact stores, Azure-connected environments or database administration networks. That impact is an inference from ISE's position in an environment; teams should verify their own trust paths.

### Exposure check

Ask the network identity owner for an authoritative inventory of every ISE and ISE-PIC node, including distributed deployments and management exposure. Check each node's exact release and patch. Review `ise-kong/access.log` and the API gateway access logs for suspicious usernames, including Cisco's example `dummyuser`; correlate with firewall and network logs outside the appliance because a root-level attacker may remove local evidence.

### Recommended response

Upgrade every supported node to the fixed patch for its release line. Restrict management traffic with infrastructure ACLs while patching. If logs or external telemetry indicate exploitation, preserve evidence, involve incident response, re-image affected nodes and restore from a known-good configuration backup as Cisco recommends. Revalidate dependent trust, administrative credentials and access policies before returning the node to service.

**Primary reference:** [Cisco Security Advisory: CVE-2026-76460](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-ISE-ABP-VNSW7Tn5)

## 2. `pqc_kyber`: an optimized backend removes a core cryptographic defense

### What changed

RustSec issued RUSTSEC-2026-0290 on 18 September. In x86_64 builds with the optional `avx2` feature, `pqc_kyber` fails to apply Fujisaki-Okamoto implicit rejection during decapsulation. Invalid attacker-chosen ciphertexts can consequently produce a plaintext-dependent result.

### Evidence

The advisory reports complete secret-key recovery against ML-KEM-768 after 4,272 decapsulation queries. Exploitation requires access to a decapsulation operation under a reused key pair and observation of the resulting shared secret. The reference backend, non-x86_64 targets and ephemeral-only key shares are not affected. RustSec separately marks the crate unmaintained; version 0.7.1 from August 2023 is the last release and no patched version exists.

### Why it matters to this stack

A normal component-and-version scan is insufficient. The vulnerable state is the intersection of a crate version, an enabled Cargo feature, a CPU target and a protocol that reuses the key. This is exactly the kind of exposure that can disappear in an SBOM unless build configuration and deployment context are retained alongside the component record.

### Exposure check

Search `Cargo.lock`, workspace manifests and generated dependency graphs for `pqc_kyber`. Use `cargo tree -e features -i pqc_kyber` to establish whether `avx2` is enabled, including transitively. Confirm the production target is x86_64, then trace whether untrusted clients can submit ciphertexts to a decapsulation path that uses a static or long-lived Kyber key.

### Recommended response

If the vulnerable configuration is reachable, disable the `avx2` feature immediately and stop reusing the affected key pair. Plan migration to a maintained implementation after protocol-compatibility and test-vector review; RustSec names `aws-lc-rs` and `graviola` as alternatives, not drop-in guarantees. Rotate exposed long-lived keys after containment if exploitation cannot be ruled out.

**Primary references:** [RustSec RUSTSEC-2026-0290](https://rustsec.org/advisories/RUSTSEC-2026-0290.html), [RustSec RUSTSEC-2026-0289](https://rustsec.org/advisories/RUSTSEC-2026-0289.html)

## 3. `cryptoki`: safe Rust code can still inherit unsafe decoder assumptions

### What changed

RustSec issued RUSTSEC-2026-0286 on 17 September. `cryptoki` interpreted the byte length returned for `CKA_ALLOWED_MECHANISMS` as an element count, allowing construction of an out-of-bounds slice through a safe public API.

### Evidence

A valid, nonempty attribute returned through `Session::get_attributes` can trigger undefined behavior. RustSec lists process crash, denial of service and possible disclosure of adjacent heap words as outcomes. The fixed versions are 0.10.1, 0.11.1 and 0.12.1.

### Why it matters to this stack

Rust services commonly reach PKCS#11 through HSMs or managed key infrastructure. The issue is not a general Azure or Entra vulnerability, but it can affect a Rust integration used to protect signing, encryption or identity credentials. The fact that the triggering call is safe Rust makes lockfile and call-path review more important than searching only for explicit `unsafe` blocks.

### Exposure check

Run `cargo tree -i cryptoki`, inspect the resolved version in `Cargo.lock`, and search for retrieval of `CKA_ALLOWED_MECHANISMS` or generic attribute enumeration against tokens that return it. Confirm the code path is exercised in integration tests using the production PKCS#11 provider or a faithful test token.

### Recommended response

Upgrade to the fixed patch on the current branch and run PKCS#11 integration tests. If an immediate update is blocked, avoid requesting `CKA_ALLOWED_MECHANISMS` until the upgrade is complete and document the temporary limitation.

**Primary reference:** [RustSec RUSTSEC-2026-0286](https://rustsec.org/advisories/RUSTSEC-2026-0286.html)

## Supply-chain watch

No newly verified malicious npm, PyPI or crates.io package campaign met the publication threshold during this review window. That absence should not relax controls established after the recent malicious-crate incidents.

This week's Rust findings expose a more subtle SBOM gap: a package name and version alone do not prove exploitability. For `pqc_kyber`, retain the resolved Cargo feature set, target architecture and key-lifecycle context as build or deployment evidence associated with the CycloneDX BOM. In Dependency-Track, use the component finding for triage, then attach or link the reachability decision rather than marking the component globally unaffected.

No consequential CycloneDX specification or Dependency-Track release was identified after the previous brief. Continue the planned Dependency-Track 5.1 evaluation, including KEV-driven policy and verification that Cargo, Python and npm BOM uploads resolve correctly.

## AI-assisted development watch

This week's identity API flaw gives code reviewers and coding agents a precise review target: every administrative route must inherit the same authentication and authorization boundary as the management UI. Generated API handlers, alternate content types, versioned routes and “internal” endpoints are common places for policy drift.

Use an agent to enumerate routes and map middleware, but require evidence from router registration, deployment ingress and tests. A passing happy-path test is not proof of protection. For sensitive endpoints, add negative tests that exercise unauthenticated, malformed and alternate-method requests and prove they fail before privileged business logic runs. Keep the assessment read-only until a human approves changes, especially where the agent can edit identity policy, infrastructure or deployment configuration.

## Developer checklist

### Today

- [ ] Inventory every Cisco ISE and ISE-PIC node and record its exact release, patch and management exposure; completion evidence is an owner-approved inventory covering all distributed nodes.
- [ ] Patch any Cisco ISE exposure to 3.1 P12, 3.2 P11, 3.3 P12, 3.4 P7 or 3.5 P4 and hunt appliance plus external network logs; completion evidence is the installed-version output and a timestamped investigation record.
- [ ] Search Rust lockfiles for `pqc_kyber` and run `cargo tree -e features -i pqc_kyber`; completion evidence is a saved dependency tree stating feature set, target architecture and key-reuse behavior.

### This week

- [ ] Search Rust services for `cryptoki`, upgrade affected branches to 0.10.1, 0.11.1 or 0.12.1, and run PKCS#11 integration tests; completion evidence is the lockfile diff and passing test output.
- [ ] For each `pqc_kyber` occurrence, prove whether attacker-controlled ciphertext reaches a reused-key decapsulation path; completion evidence is a file-and-call-path trace labelled affected, not affected or unknown.
- [ ] Review administrative API routes for authentication parity across methods, versions and ingress paths; completion evidence is a route-to-policy map plus negative unauthenticated tests.
- [ ] Associate Cargo features and target architecture with the CycloneDX/Dependency-Track record for configuration-dependent findings; completion evidence is a retrievable BOM property or linked assessment record.

### Backlog

- [ ] Replace unmaintained `pqc_kyber` after compatibility and test-vector validation; completion evidence is an approved migration decision and interoperability test results.

## Copy this prompt

```text
Begin in read-only assessment mode. Do not modify code, dependencies, lockfiles, infrastructure, access policies or deployment configuration without explicit approval.

Assess <REPOSITORY> for the issues in the AppSec Lead Brief dated 2026-09-21, using <DEPLOYMENT_ENVIRONMENT> and <APP_OWNER> only as supplied context.

1. Inspect repository manifests, resolved lockfiles, workspace configuration, CI files and deployment configuration before drawing conclusions.
2. Determine whether Cisco ISE or ISE-PIC is referenced in infrastructure, runbooks or trust paths. Do not infer its presence from generic Cisco or identity dependencies. If present, record exact release/patch evidence and management exposure; never attempt exploitation.
3. Search for pqc_kyber. If present, establish the resolved version, whether the avx2 feature is enabled directly or transitively, the production CPU architecture, and whether untrusted ciphertext can reach decapsulation under a reused/static key.
4. Search for cryptoki. If present, establish the resolved version and whether code retrieves CKA_ALLOWED_MECHANISMS, including through generic attribute enumeration.
5. Enumerate administrative API routes and cite the exact router, middleware and policy files that prove authentication and authorization are applied. Check alternate methods, versioned paths and deployment ingress. Prefer existing negative tests as evidence; do not send requests to production.
6. Inspect generated CycloneDX/SBOM configuration and state whether Cargo features and target architecture are preserved or linked to the finding.
7. Cite exact files, line locations, commands and observed output. Do not expose secrets or upload proprietary code.
8. Classify each finding by urgency (Act now, Plan, Watch or No action) and confidence (high, medium or low). State "not affected" when evidence supports it and "unknown" when evidence is insufficient.
9. Propose the smallest remediation for each confirmed finding and provide verification commands or tests. Separate confirmed facts from inference.

Return a concise evidence table followed by recommended next actions. Stop after the assessment and wait for approval before making any change.
```

## Monday action plan

1. **Network identity owner:** complete the Cisco ISE/ISE-PIC inventory, patch every affected node and deliver version plus log-review evidence.
2. **Incident response lead:** if Cisco ISE exposure existed, correlate appliance, firewall and network telemetry and record whether re-imaging or credential/policy recovery is required.
3. **Rust service owners:** produce feature-aware dependency traces for `pqc_kyber` and version/call-path traces for `cryptoki`.
4. **AppSec lead:** require route-to-policy mapping and negative authentication tests for privileged APIs in the next review cycle.
5. **SBOM owner:** retain Cargo feature and target metadata with configuration-dependent findings and demonstrate the record in Dependency-Track.

## References

- [Cisco — Cisco Identity Services Engine Authentication Bypass Vulnerability, CVE-2026-76460 (16 September 2026)](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-ISE-ABP-VNSW7Tn5)
- [RustSec — RUSTSEC-2026-0286: `cryptoki` out-of-bounds read (17 September 2026)](https://rustsec.org/advisories/RUSTSEC-2026-0286.html)
- [RustSec — RUSTSEC-2026-0289: `pqc_kyber` is unmaintained (18 September 2026)](https://rustsec.org/advisories/RUSTSEC-2026-0289.html)
- [RustSec — RUSTSEC-2026-0290: `pqc_kyber` AVX2 key recovery (18 September 2026)](https://rustsec.org/advisories/RUSTSEC-2026-0290.html)
