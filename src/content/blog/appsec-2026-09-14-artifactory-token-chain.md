---
title: "AppSec Lead Brief: Artifactory token flaws turn patching into incident response"
seoTitle: "Actively Exploited Artifactory Token Flaws | AppSec Brief"
description: "Two additional Artifactory token flaws are now confirmed exploited, while a malicious Rust crate shows why developer workstations belong inside the software supply-chain threat model."
seoDescription: "AppSec actions for actively exploited JFrog Artifactory token flaws, a malicious Rust crate, and an ExLlamaV3 denial-of-service vulnerability."
date: "2026-09-14"
author: "Suresh Kumar Mukhiya"
tags: "appsec, software-supply-chain, rust, jfrog-artifactory, sbom, ai-security"
---

## Executive summary

The important engineering decision this week is to treat an exposed or affected Artifactory instance as a possible supply-chain incident, not merely a server awaiting a patch. On 11 September, CISA added two more Artifactory token flaws to its Known Exploited Vulnerabilities catalog: one can disclose an internal anonymous-user token and the other can turn an insufficiently scoped token into elevated access. Separately, RustSec documented a single malicious `greentic-setup` release whose payload activated when a dependent project was opened in Visual Studio Code. Teams running local LLM inference should also check ExLlamaV3, where malformed inputs can crash the CUDA extension; no consequential new core FastAPI, React/Next.js, PostgreSQL, SQL Server, Azure, Entra ID, CycloneDX, or Dependency-Track release was identified in this review window.

## Risk at a glance

### Act now — Artifactory token flaws

**Affected:** CVE-2026-42018 across affected 7.x branches; CVE-2026-42016 before 7.133.11  
**Evidence:** CISA KEV, 11 September; active exploitation confirmed  
**Owner:** Platform / DevSecOps

### Act now if present — malicious Rust crate

**Affected:** `greentic-setup 1.3.1-dev.34027618345`, including transitively through four Greentic crates  
**Evidence:** RustSec; package removed after about 27 hours; no known downloads  
**Owner:** Rust service owner / endpoint security

### Watch — ExLlamaV3 CUDA out-of-bounds access

**Affected:** `exllamav3_ext` before the fix merged in PR 310; CERT/CC states no fixed release number  
**Evidence:** CERT/CC VU#369611; crash or instability demonstrated, with no reported active exploitation  
**Owner:** AI platform owner

### No action — no consequential core-stack update

**Affected:** FastAPI, React/Next.js, PostgreSQL, SQL Server, Azure/Entra, Dependency-Track and CycloneDX  
**Evidence:** No consequential material update identified in the primary-source review through 14 September  
**Owner:** Relevant service owners

## Significant developments

### Act now: two exploited Artifactory flaws form a token escalation path

**What changed.** CISA added CVE-2026-42016 and CVE-2026-42018 to KEV on 11 September. This materially changes prioritisation: exploitation is observed, rather than inferred from severity. CVE-2026-42018 can return an internal anonymous-user token to an unauthenticated caller even when anonymous access is disabled. CVE-2026-42016 validates a token's signature and issuer without correctly enforcing its scope, allowing privilege escalation. In combination, an unauthenticated caller may obtain the low-privilege token needed to reach the escalation flaw.

**Evidence.** CISA's KEV entry is the authoritative evidence of exploitation. JFrog's advisory describes the weaknesses and remediation boundaries. JFrog lists fixes for CVE-2026-42018 at 7.111.20, 7.117.27, 7.125.19, 7.133.28 and 7.146.8 for the corresponding branches. CVE-2026-42016 affects self-hosted versions before 7.133.11. Because branch coverage and later releases can differ, use JFrog's current advisory—not a copied version table—as the final upgrade authority.

**Why it matters to this stack.** Artifactory may proxy or publish Cargo, PyPI, npm and container artifacts. Administrative compromise can therefore alter dependencies consumed by Rust, Python and Next.js builds, poison cached packages, mint repository tokens or tamper with release artifacts. The earlier CVE-2026-82329 warning remains relevant, but these newly exploited flaws add a credible token chain and make post-patch investigation necessary.

**Exposure check.** Identify every self-hosted Artifactory instance, including vendor-managed build environments and upstream mirrors. Record version, internet reachability, whether anonymous access is disabled, and which CI identities can publish or promote artifacts. Search access and audit logs for unexpected calls to token endpoints, newly elevated identities, token creation, administrative changes, artifact replacement and unusual bulk downloads. Compare high-value artifact digests with trusted build provenance or previously released manifests.

**Recommended response.** Upgrade to a currently supported JFrog-fixed release immediately. Restrict management and token endpoints at the network edge while upgrading. Revoke suspicious or broadly scoped tokens, rotate CI and repository credentials when compromise cannot be excluded, inspect administrator changes, and re-establish trust in promoted artifacts before consuming them. Patching removes the vulnerable path; it does not prove that packages distributed before patching are clean.

**Primary references:** [CISA KEV addition, 11 September 2026](https://www.cisa.gov/news-events/alerts/2026/09/11/cisa-adds-three-known-exploited-vulnerabilities-catalog) and [JFrog Security Advisories](https://docs.jfrog.com/releases/docs/jfrog-security-advisories).

### Act now if present: a malicious Rust crate targeted the developer workstation

**What changed.** RustSec issued RUSTSEC-2026-0281 on 7 September after crates.io removed `greentic-setup` version `1.3.1-dev.34027618345`. RustSec says the release included a PolinRider malware variant that activated when a project depending on the crate was opened in Visual Studio Code.

**Evidence.** RustSec reports that the version was available for roughly 27 hours from 6 September and that no actual downloads are known. The exact malicious version can also arrive through `greentic-start`, `greentic-start-dev`, `greentic-operator`, or `greentic-operator-dev`.

**Why it matters to this stack.** The trigger moved execution to the developer environment. That means a package can cause harm before an application is built or deployed, and a production SBOM alone may miss the affected workstation, editor extension state or cached source. The finding is narrow: it does not imply that other Greentic versions or unrelated Rust crates are malicious.

**Exposure check.** Search committed and generated `Cargo.lock` files, local Cargo caches, CI caches and SBOM history for the exact version. On matching workstations, preserve endpoint telemetry before cleanup and review processes, persistence, outbound connections and credential access around the time the project was opened.

**Recommended response.** Remove the exact version and invalidate caches that contain it. Treat a positive match as an endpoint-security investigation; rotate developer, GitHub, registry and cloud credentials if telemetry indicates execution or if containment cannot establish otherwise. Add lockfile and SBOM monitoring that retains withdrawn or malicious-package findings rather than only current registry state.

**Primary reference:** [RustSec RUSTSEC-2026-0281, 7 September 2026](https://rustsec.org/advisories/RUSTSEC-2026-0281.html).

### Watch: ExLlamaV3 can crash on an invalid CUDA dispatch index

**What changed.** CERT/CC published CVE-2026-84286 on 11 September. In `exllamav3_ext`, a crafted input with `K=0` can produce a negative index into a fixed kernel table, causing illegal CUDA memory access, process termination or instability.

**Evidence.** CERT/CC identifies denial of service as the demonstrated impact and points to merged upstream pull request 310. CERT/CC does not name a fixed package release, and there is no evidence in the note of exploitation in the wild.

**Why it matters to this stack.** This matters only where ExLlamaV3 is used for local or hosted model inference and untrusted users, jobs or model-derived data can reach the vulnerable path. It is not a general Python, FastAPI or agent-framework vulnerability.

**Exposure check.** Search Python environments, containers and model-serving images for ExLlamaV3. Trace whether tenants or external users can supply models, checkpoints or parameters that influence the dispatch value, and verify that a worker crash cannot take down unrelated tenants.

**Recommended response.** Track an upstream release containing PR 310 or pin a reviewed fixed commit. Until then, isolate inference workers, validate inputs before GPU dispatch, apply resource and restart limits, and test that malformed workloads fail without affecting other tenants.

**Primary reference:** [CERT/CC VU#369611, 11 September 2026](https://www.kb.cert.org/vuls/id/369611).

## Supply-chain watch

No new CycloneDX specification or OWASP Dependency-Track release was identified after the previous brief. Dependency-Track 5.1 remains the relevant baseline because it can use KEV in policies and notifications. This week's actionable improvement is operational: configure a KEV policy that escalates affected infrastructure components such as Artifactory, and retain historical SBOMs and artifact digests so incident responders can determine what was built or promoted during an exposure window.

The malicious Rust crate also shows why an SBOM programme needs more than production inventories. Generate SBOMs from resolved lockfiles, but separately monitor development-only dependencies, editor bootstrap scripts, CI actions and cached packages. A component that never reaches production can still steal the credentials used to publish production software.

## AI-assisted development watch

Do not let a coding agent treat a version bump as proof of remediation. For the Artifactory flaws, an agent can inventory configuration, tokens referenced by CI, artifact digests and log locations, but a human owner must decide whether compromise is plausible and authorize rotation or repository quarantine. For the Rust incident, agents should search exact versions and dependency paths in read-only mode; they should not execute suspect packages, open affected workspaces in an editor, or upload proprietary lockfiles to an external service.

For ExLlamaV3, require generated fixes and tests to cover boundary values before GPU kernel dispatch. In multi-tenant inference, the security property is not merely “the worker restarts”; it is that one tenant's malformed workload cannot terminate shared capacity or corrupt another tenant's execution context.

## Developer checklist

### Today

- [ ] Inventory self-hosted JFrog Artifactory versions and exposure; completion evidence: an owner-approved list containing version, URL, network reachability and fixed/advisory status for every instance.
- [ ] Search all Rust `Cargo.lock` files and retained SBOMs for `greentic-setup 1.3.1-dev.34027618345`; completion evidence: repository paths, dependency trees and a documented “not affected” result or incident ticket.
- [ ] If affected Artifactory is found, restrict token/management reachability and start log review; completion evidence: approved edge-rule change plus preserved audit and access logs.

### This week

- [ ] Upgrade affected Artifactory branches using JFrog's current advisory; completion evidence: deployed version output, successful health check and rollback record.
- [ ] Validate integrity of artifacts promoted during the Artifactory exposure window; completion evidence: digest/provenance comparison for release-critical Cargo, PyPI, npm and container artifacts.
- [ ] Configure Dependency-Track 5.1 to alert on KEV findings; completion evidence: a test BOM that triggers the expected policy and notification.
- [ ] If ExLlamaV3 is present, trace untrusted input to CUDA dispatch and test worker isolation; completion evidence: dependency version, reachability result and a controlled crash-containment test.

### Backlog

- [ ] Add development-only dependencies, editor bootstrap files and CI actions to supply-chain review; completion evidence: documented scope and one passing repository audit.
- [ ] Require AI-generated dependency remediations to include lockfile diff, exact advisory match and verification commands; completion evidence: merged PR template or review rule.

## Copy this prompt

```text
Begin in read-only assessment mode for <REPOSITORY> in <DEPLOYMENT_ENVIRONMENT>. Do not modify code, dependencies, infrastructure, access policies, CI configuration or lockfiles without explicit approval from <APP_OWNER>. Do not expose secrets, execute suspect packages, open a potentially affected workspace in an editor, or upload proprietary code or lockfiles to external services.

1. Inspect manifests, resolved lockfiles, SBOMs, container definitions, CI workflows and deployment configuration before drawing conclusions.
2. Check for:
   - JFrog Artifactory affected by CVE-2026-42016 or CVE-2026-42018, including version, network reachability, anonymous-access setting, token endpoints and CI publish identities.
   - greentic-setup exactly at version 1.3.1-dev.34027618345, directly or through greentic-start, greentic-start-dev, greentic-operator or greentic-operator-dev.
   - ExLlamaV3/exllamav3_ext affected by CVE-2026-84286, and whether untrusted models, checkpoints, jobs or parameters can reach the CUDA dispatch path.
3. Cite exact repository files, dependency paths, versions, configurations and commands that support each conclusion. Do not claim reachability from package presence alone.
4. Classify every result as Act now, Plan, Watch or No action, and label confidence High, Medium or Low.
5. State “not affected” when evidence supports it and “unknown” when evidence is insufficient.
6. Propose the smallest remediation for confirmed exposure, followed by commands or tests that verify the fix. Separate repository changes from operational incident-response actions such as log preservation, token rotation and artifact-integrity validation.
7. Return a concise report with: finding, evidence, reachability, urgency, confidence, minimal remediation, verification, and unresolved questions.
```

## Monday action plan

1. **Platform owner:** complete the Artifactory version and exposure inventory; evidence is a signed-off inventory covering every internal and vendor-managed instance.
2. **DevSecOps:** patch affected Artifactory and review token/admin/artifact activity; evidence is the deployed fixed version plus an investigation timeline and disposition.
3. **Rust service owners:** prove presence or absence of the exact malicious `greentic-setup` version; evidence is lockfile, SBOM and cache-search output.
4. **AI platform owner:** identify ExLlamaV3 use and tenant reachability; evidence is a dependency report and isolation-test result.
5. **AppSec/SBOM owner:** exercise a Dependency-Track KEV policy against a test BOM; evidence is the resulting policy violation and notification.

## References

- CISA — [CISA Adds Three Known Exploited Vulnerabilities to Catalog](https://www.cisa.gov/news-events/alerts/2026/09/11/cisa-adds-three-known-exploited-vulnerabilities-catalog), 11 September 2026.
- JFrog — [JFrog Security Advisories](https://docs.jfrog.com/releases/docs/jfrog-security-advisories), CVE-2026-42016 published 27 July 2026 and CVE-2026-42018 published 12 August 2026; exploitation status updated by CISA on 11 September.
- RustSec — [RUSTSEC-2026-0281](https://rustsec.org/advisories/RUSTSEC-2026-0281.html), 7 September 2026.
- CERT Coordination Center — [VU#369611 / CVE-2026-84286](https://www.kb.cert.org/vuls/id/369611), 11 September 2026.
- OWASP Dependency-Track — [Release 5.1.0](https://github.com/DependencyTrack/dependency-track/releases/tag/5.1.0), 27 August 2026.

