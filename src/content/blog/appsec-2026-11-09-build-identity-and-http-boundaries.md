---
title: 'AppSec Lead Brief: isolate build identities and harden HTTP boundaries'
seoTitle: 'Kaniko Entra token leak and Actix HTTP flaws | AppSec Brief'
description: 'A kaniko token leak, Actix request parsing flaws and Azure Key Vault cache poisoning make identity isolation the priority.'
seoDescription: 'AppSec briefing for 9 November 2026 covering kaniko Entra token exposure, Actix HTTP flaws, Azure Key Vault Rust clients and GitHub Actions policy changes.'
date: '2026-11-09'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, azure, entra-id, rust, actix, github-actions, software-supply-chain, ai-security'
---

## Executive summary

The urgent engineering decision this week is whether untrusted build or request input can reach a privileged identity. A critical kaniko flaw can send a live Microsoft Entra token to a lookalike Azure Container Registry host from a crafted Dockerfile, even without a RUN instruction. New Actix advisories show the same boundary problem at the HTTP layer: parser disagreement can bypass proxy controls, while compressed bodies can consume large amounts of memory before application limits or handler authentication apply. Patch the affected components, but also remove ambient credentials and enforce limits at the earliest trust boundary.

## Risk at a glance

- **Act now if exposed — kaniko Azure token disclosure:** **kaniko before 1.25.20** can send a live Azure Resource Manager token to an attacker-controlled registry lookalike when the build has an Azure identity. No active exploitation is reported. **Owner:** container platform / DevSecOps.
- **Act now if present — Actix HTTP boundary flaws:** upgrade **actix-http to 3.20.3+** and **actix-web to 4.18.2+**. The issues include HTTP request smuggling and pre-handler decompression denial of service. No active exploitation is reported. **Owner:** Rust API lead.
- **Act now if reachable — Azure Key Vault Rust clients:** affected Key Vault certificate, secret and key clients can retain a rejected authentication challenge in a shared scope cache, enabling later token and request-body disclosure under specific endpoint-reuse conditions. **Owner:** Azure/Rust service owner.
- **Plan today — GitHub Actions pull_request_target:** public repositories enter a two-hour brownout today, before default blocking begins on **2 December 2026**. Private and internal repositories are not affected by this default rule. **Owner:** CI platform lead.
- **No action:** no consequential new core FastAPI, React/Next.js, PostgreSQL, SQL Server, CycloneDX or Dependency-Track release—and no verified malicious npm, PyPI or Cargo campaign meeting this brief’s threshold—was identified in this review window.

## Kaniko: a Dockerfile can redirect a live Entra token

**What changed.** GitHub reviewed [CVE-2026-105769 / GHSA-5q7h-w9jf-cx97](https://github.com/advisories/GHSA-5q7h-w9jf-cx97) on 5 November. Kaniko before **1.25.20** uses an Azure Container Registry credential helper with an unanchored hostname check. A base image such as **x.azurecr.io.attacker.example/image** is treated as ACR, so the helper requests an Azure Resource Manager token and sends it to the attacker-controlled host.

**Evidence.** Exposure requires affected kaniko, a Dockerfile or build argument the attacker can influence, and an available Azure identity. That identity may come from service-principal variables, AKS workload identity, managed identity through the Instance Metadata Service, or MSI_ENDPOINT. The build does not need a RUN instruction, a push step or an intended ACR destination. Version **1.25.20** carries a patched helper that validates the complete hostname. The advisory is critical (CVSS 9.3) but reports no exploitation in the wild.

**Why it matters to this stack.** CI builders often receive broader Azure access than the artifact being built needs. A leaked token inherits the identity’s Azure role assignments; an identity with AcrPush can alter images, while broader roles may expose keys, secrets or role-management operations. This turns a Dockerfile review problem into a cloud control-plane incident.

**Exposure check.** Search workflow definitions, build templates, image digests and SBOMs for kaniko. Record the exact version, every source of Dockerfiles and FROM/COPY --from values, and whether the pod or runner can obtain Entra tokens. Query Entra sign-in and Azure activity logs for identities used by affected builds, concentrating on unusual ACR pushes, role changes and key or secret listings.

**Recommended response.** Upgrade or rebuild the executor, warmer and standalone helper from **1.25.20+**. Until then, remove Azure credentials and workload tokens from untrusted build jobs and block **169.254.169.254** from build pods. Allowlist registry origins before credential resolution. If untrusted Dockerfiles ran with an identity available, treat tokens issued during those runs as exposed until expiry and investigate; rotating a client secret does not revoke an already issued token.

## Actix: enforce the same HTTP message at every layer

**What changed.** RustSec issued a cluster of Actix advisories on 6 November. The most consequential combination affects HTTP message framing and decompression before normal handler controls execute.

**Evidence.** [RUSTSEC-2026-0446](https://rustsec.org/advisories/RUSTSEC-2026-0446.html) covers **actix-http before 3.20.2**. Its chunked decoder can interpret a malformed bare line feed differently from an upstream proxy. With connection reuse or pipelining, bytes belonging to the next request can be consumed as trailers and the remaining body parsed as a new request, potentially bypassing proxy or WAF authorization.

[RUSTSEC-2026-0447](https://rustsec.org/advisories/RUSTSEC-2026-0447.html) and [RUSTSEC-2026-0448](https://rustsec.org/advisories/RUSTSEC-2026-0448.html) show that extractor limits were not reaching the decompression layer. [RUSTSEC-2026-0455](https://rustsec.org/advisories/RUSTSEC-2026-0455.html) adds a Brotli-specific bypass: an approximately 850-byte request can allocate about 1 GiB before the decoded output reaches its configured limit. Actix Web enables Brotli support by default. The consolidated safe baseline is **actix-http 3.20.3+** and **actix-web 4.18.2+**.

**Why it matters to this stack.** A reverse proxy, APIM or WAF is useful only when it and the application agree on request boundaries. Handler-level authentication and extractor limits cannot stop work that happens earlier in the HTTP stack. Multi-tenant APIs amplify both risks because one tenant’s request can consume shared capacity or cross a routing boundary.

**Exposure check.** Resolve versions from Cargo.lock, not Cargo.toml. Confirm whether services accept HTTP/1 through a proxy that reuses upstream connections, and whether compressed request bodies are enabled. Record proxy normalization, maximum compressed body size, decompressed limits, concurrency controls and memory limits.

**Recommended response.** Upgrade both crates and rebuild the deployed image. Until patched, reject malformed chunked requests and **Content-Encoding: br** at the outer proxy, or disable Brotli throughout the dependency graph. Add differential tests that send identical raw requests through the proxy and directly to Actix, plus load tests using highly compressible bodies. Keep container memory and request-concurrency limits as containment, not as the primary fix.

## Azure Key Vault Rust clients: rejected challenges must not change future authorization

**What changed.** RustSec issued related advisories on 5 November for **azure_security_keyvault_certificates**, **azure_security_keyvault_secrets** and **azure_security_keyvault_keys**. A rejected WWW-Authenticate challenge can populate a shared scope cache before its resource is verified. A later request through the same client can then obtain a token for that cached scope without repeating validation.

**Evidence.** For [RUSTSEC-2026-0437](https://rustsec.org/advisories/RUSTSEC-2026-0437.html), the affected certificate-client versions are **0.9.0 through 1.0.0** and **1.1.0-beta.1**; fixed releases are **1.0.1** and **1.1.0-beta.2**. The corresponding [secrets](https://rustsec.org/advisories/RUSTSEC-2026-0438.html) and [keys](https://rustsec.org/advisories/RUSTSEC-2026-0439.html) advisories describe the same cache-ordering flaw. Exploitation requires an application to contact an attacker-controlled endpoint, reuse the client, and hold a credential capable of obtaining a token for the supplied scope. No active exploitation is reported.

**Why it matters to this stack.** Long-lived Rust clients are normal in Azure services and agents. If endpoint selection can be influenced by tenant data, configuration, redirects or an agent tool call, a failed first request is not necessarily safe: it can poison state used by a later request.

**Exposure check.** Find the three crates in lockfiles and SBOMs, then trace every constructed Key Vault endpoint. Determine whether endpoints are constant and allowlisted, whether redirects are followed, whether a client is reused across origins or tenants, and which scopes its managed identity or service principal can request.

**Recommended response.** Upgrade to the patched line for each crate. Bind Key Vault endpoints to service-controlled configuration, not request or agent input. Do not reuse authentication clients across tenant-selected origins. Add a regression test proving that a rejected challenge does not alter the token scope or destination of the next request.

## Supply-chain watch

GitHub will temporarily enforce its default block on **pull_request_target** today, **9 November from 16:00–18:00 UTC**, with another brownout on **16 November**. Permanent enforcement begins **2 December** for public repositories unless an Actions event policy explicitly allows the event. The trigger runs with the base repository’s context and may access secrets; checking out and executing mutable fork code in that context remains unsafe even if a policy permits the workflow.

Use the brownout as evidence. Search public repositories for pull_request_target, inspect GitHub’s evaluate-mode findings, and remove any checkout or execution of fork-controlled refs. If the trigger is genuinely required for labeling or commenting, give the job read-only permissions, avoid untrusted code execution, target the workflow narrowly in policy and keep privileged follow-up work in a separately approved workflow.

No new CycloneDX or Dependency-Track release changed the recommended baseline this week. Continue producing CycloneDX SBOMs from resolved lockfiles and deployed images. For kaniko, the image digest and embedded helper version matter more than a source manifest; for Actix and Azure clients, transitive versions in Cargo.lock are the decisive evidence.

## AI-assisted development watch

An agent can turn configuration into an attack surface by editing Dockerfiles, selecting image origins or constructing Key Vault endpoints. Treat all agent-proposed external origins as untrusted until policy validates the complete hostname—not a substring—and keep cloud credentials out of build and review jobs that process untrusted contributions.

Code-review agents should reason across layers. A patch that adds an Actix extractor limit is incomplete if decompression occurs before that limit; a workflow that “only builds” is not low risk if credential lookup happens before contacting the registry. Require reviews to identify the first parser, credential resolver and network destination, then verify controls at that earliest boundary.

## Developer checklist

### Today

- [ ] **Kaniko:** identify every executor, warmer and helper below **1.25.20**; evidence is an image digest/SBOM and a documented Azure-identity path for each builder.
- [ ] **Azure incident check:** review Entra sign-in and Azure activity logs for affected kaniko build identities; evidence is a time-bounded query and disposition of unusual ACR pushes, role changes and key/secret access.
- [ ] **Actix:** resolve actix-http and actix-web from every Cargo.lock; evidence is **3.20.3+ / 4.18.2+** or a tracked remediation with deployed-image scope.
- [ ] **GitHub Actions:** find public-repository pull_request_target workflows before today’s brownout; evidence is the evaluate-mode result and confirmation that no fork-controlled code runs with base-repository privileges.

### This week

- [ ] **HTTP boundaries:** test malformed chunked requests and compressed bodies through the real proxy-to-Actix path; evidence is a rejection test plus memory/concurrency measurements.
- [ ] **Key Vault Rust SDK:** inventory certificate, secret and key client versions and endpoint construction; evidence is a patched lockfile/SBOM or a documented “not affected” call path.
- [ ] **Build isolation:** deny Instance Metadata Service access from untrusted build pods and separate secret-bearing release jobs; evidence is an egress-policy test and distinct workflow identities.

### Backlog

- [ ] **SBOM evidence:** attach deployed builder and service image digests to Dependency-Track projects; evidence is a BOM upload whose resolved kaniko, Actix and Azure client versions match production.

## Copy this prompt

```text
Assess <REPOSITORY> and <DEPLOYMENT_ENVIRONMENT> for the verified issues in the 9 November 2026 AppSec brief. Begin in read-only assessment mode. Do not modify code, dependencies, lockfiles, workflows, infrastructure, access policies or credentials without explicit approval from <APP_OWNER>. Do not expose secrets or upload proprietary code.

Inspect source, Dockerfiles, workflows, resolved lockfiles, SBOMs, container image digests, deployment configuration and identity assignments before drawing conclusions. Check for:
- kaniko versions below 1.25.20, including executor, warmer and docker-credential-acr-env; determine whether untrusted Dockerfiles, FROM/COPY --from values or build arguments can reach a service principal, workload identity, managed identity, MSI endpoint or Azure Instance Metadata Service;
- actix-http below 3.20.3 and actix-web below 4.18.2; identify HTTP/1 proxy connection reuse, chunked parsing, enabled compression features, compressed and decompressed limits, and memory/concurrency containment;
- azure_security_keyvault_certificates, azure_security_keyvault_secrets and azure_security_keyvault_keys in affected ranges; trace whether untrusted input, redirects, tenant data or agent tools can influence endpoints and whether clients are reused across origins;
- public-repository pull_request_target workflows, especially checkout or execution of fork-controlled refs with secrets or write permissions.

For each finding, cite exact files, lines, resolved versions, image digests, configurations and reachable paths. Classify urgency as Act now, Plan, Watch or No action and confidence as high, medium or low. State "not affected" when evidence supports it and "unknown" when evidence is insufficient. Do not infer exposure from a package name alone.

Propose the smallest remediation and verification commands or tests. Include raw proxy/application parsing tests, compressed-body memory tests, registry-host validation, IMDS egress checks, rejected-challenge cache tests and workflow permission checks where relevant. Separate confirmed facts from inference.
```

## Monday action plan

1. **Container platform lead:** patch kaniko and determine whether any affected build had an Azure identity; complete with image digests, identity paths and a log-review decision.
2. **Rust API lead:** move Actix services to **actix-http 3.20.3+ / actix-web 4.18.2+**; complete with lockfiles, deployed digests and boundary tests.
3. **Azure service owner:** patch Key Vault Rust clients and constrain endpoints; complete with resolved versions and a rejected-challenge regression test.
4. **CI platform lead:** review pull_request_target workflows during the brownout; complete with policy evidence and removal of fork-code execution from privileged jobs.
5. **DevSecOps:** update production SBOM evidence in Dependency-Track; complete when BOM versions and image digests match the deployment inventory.

## References

- [GitHub Advisory Database — CVE-2026-105769 / GHSA-5q7h-w9jf-cx97, published 2 November and reviewed 5 November 2026](https://github.com/advisories/GHSA-5q7h-w9jf-cx97)
- [RustSec — RUSTSEC-2026-0446, issued 6 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0446.html)
- [RustSec — RUSTSEC-2026-0447, issued 6 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0447.html)
- [RustSec — RUSTSEC-2026-0448, issued 6 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0448.html)
- [RustSec — RUSTSEC-2026-0455, issued 6 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0455.html)
- [RustSec — RUSTSEC-2026-0437, issued 5 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0437.html)
- [RustSec — RUSTSEC-2026-0438, issued 5 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0438.html)
- [RustSec — RUSTSEC-2026-0439, issued 5 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0439.html)
- [GitHub Changelog — pull_request_target blocked by default December 2, published 2 November 2026](https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/)
