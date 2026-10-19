---
title: 'AppSec Lead Brief: treat archives and sandboxes as hostile boundaries'
seoTitle: 'Rust zip, Wasmtime and rustls fixes | AppSec Brief'
description: 'Rust archive extraction, Wasmtime sandbox escape, decompression denial of service and TLS-secret logging fixes.'
seoDescription: 'AppSec briefing for 19 October 2026 covering zip extraction flaws, a Wasmtime sandbox escape, ruzstd decompression risk and rustls secret logging.'
date: '2026-10-19'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, rust, software-supply-chain, sandboxing, ai-security, secure-development'
---

## Executive summary

This week’s engineering decision is straightforward: treat archive extraction, decompression and WebAssembly execution as privileged parser boundaries. New Rust advisories show that a small or apparently contained input can change files outside an extraction directory, exhaust memory or escape a Wasmtime filesystem sandbox. Teams that process uploads, model artifacts or agent-generated files should prove both the patched dependency version and the operating-system boundary around the worker. A separate rustls issue also makes debug logging part of the credential threat model.

## Risk at a glance

- **Act now if present — `zip`:** affected extraction paths can create symlinks outside the target directory or apply permissions through a symlink. Resolve the full `zip` advisory set to **9.0.1 or later**. **Owner:** Rust service owner.
- **Act now if exposed — Wasmtime:** guests with filesystem access can escape the sandbox on affected hosts. Upgrade to **36.0.18, 48.0.6, 49.0.3 or a later supported release**, depending on the maintained branch. **Owner:** agent/runtime platform lead.
- **Act now if reachable — `ruzstd`:** versions before **0.9.1** can expand a crafted input smaller than 128 KiB into gigabytes of allocation. **Owner:** file-ingestion owner.
- **Plan — `rustls`:** custom client-session stores that debug-log session values can disclose TLS session secrets before **0.23.46**. **Owner:** platform networking lead.
- **No action:** no consequential new core FastAPI, React/Next.js, PostgreSQL, SQL Server, Azure/Entra, CycloneDX or Dependency-Track release was verified in this review window.

## Rust `zip`: extraction can cross the directory boundary

**What changed.** Three related RustSec advisories published on 17 October cover archive entries that create symlinks outside the extraction root, preserve dangerous Unix mode bits, or apply permissions through a symlink after extraction.

**Evidence.** [RUSTSEC-2026-0368](https://rustsec.org/advisories/RUSTSEC-2026-0368.html) describes symlink creation outside the intended directory. [RUSTSEC-2026-0367](https://rustsec.org/advisories/RUSTSEC-2026-0367.html) covers preserved SUID, SGID and sticky bits. The upstream [GHSA-4684-h2q9-2vcp](https://github.com/zip-rs/zip2/security/advisories/GHSA-4684-h2q9-2vcp) says permission restoration can follow a malicious symlink and alter a file outside the extraction directory. The upstream advisory marks `zip` through 9.0.0 affected and **9.0.1** patched. No active exploitation is reported.

**Why it matters to this stack.** Upload processors, build pipelines and AI workers often unpack tenant files, model bundles or generated artifacts. If that worker can write application files, CI workspaces or shared volumes, “extract into a temporary directory” is not a sufficient boundary.

**Exposure check.** Run `cargo tree -i zip` and `cargo audit` in every Rust workspace. Locate calls that extract untrusted archives and record the worker’s user, mounts and destination. Check whether extracted files are later executed, served or promoted into a build.

**Recommended response.** Resolve `zip` to **9.0.1 or later**, rebuild and retain the image digest. Extract as an unprivileged user into a new per-job directory on a filesystem with no sensitive sibling paths. Reject or separately handle symlink entries and do not preserve privilege bits from an untrusted archive. Verify with harmless fixtures that attempt a relative symlink and privileged mode bits.

## Wasmtime: filesystem sandbox escape on affected hosts

**What changed.** Wasmtime published [GHSA-vqjp-4c8c-hfgg](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-vqjp-4c8c-hfgg) on 14 October. A trailing-slash symlink condition in the underlying capability filesystem can let a guest move or access paths outside its assigned directory.

**Evidence.** The advisory calls this a full filesystem sandbox escape. It affects macOS and FreeBSD; modern Linux systems using `openat2` with `RESOLVE_BENEATH` are not affected by this specific path. Affected releases include versions through 36.0.17, 37.0.0–48.0.5 and 49.0.0–49.0.2. Fixes are available in **36.0.18, 48.0.6 and 49.0.3**. No workaround is given and no active exploitation is reported.

**Why it matters to this stack.** Agentic systems increasingly use WebAssembly to execute plugins or generated transformations. A guest that escapes its preopened directory can reach every file available to the host process, including source, configuration and another tenant’s artifacts.

**Exposure check.** Inventory the resolved `wasmtime` and `wasmtime-wasi` versions, host operating system and preopened directories. Identify whether untrusted guests receive read or write access and what the host identity can read.

**Recommended response.** Upgrade the maintained branch, rebuild and redeploy. Until complete, do not run untrusted guests on affected hosts. Keep the runtime in a disposable process or container with a task-scoped identity, minimal mounts and restricted egress; the library sandbox should not be the only boundary.

## `ruzstd`: tiny input, large memory failure

**What changed and evidence.** [RUSTSEC-2026-0344](https://rustsec.org/advisories/RUSTSEC-2026-0344.html), issued 12 October, reports that a crafted Zstandard input smaller than 128 KiB can cause gigabytes of allocation and terminate the process. Versions before **0.9.1** are affected. This is a denial-of-service issue, not evidence of code execution.

**Why it matters to this stack.** Compressed uploads and image or game assets may reach `ruzstd` transitively. In a shared API or multi-tenant worker, one request can exhaust a pod and disrupt other tenants.

**Exposure check and response.** Use `cargo tree -i ruzstd` to find direct and transitive consumers, then trace whether attacker-controlled `.zst` data reaches them. Upgrade to **0.9.1 or later**. Also enforce compressed and decompressed byte limits, memory limits and timeouts; retain a safe regression test and evidence that the worker is killed without affecting peer workloads.

## `rustls`: debug output can become credential material

**What changed and evidence.** [RUSTSEC-2026-0346](https://rustsec.org/advisories/RUSTSEC-2026-0346.html), issued 13 October, says the `Debug` implementations for client-session values expose a TLS 1.2 master secret or TLS 1.3 resumption PSK. It affects `rustls` from 0.21.0 through 0.23.45 and is fixed in **0.23.46**. The built-in client-session cache is not affected; exposure requires a custom `ClientSessionStore` that records these values with debug formatting.

**Why it matters to this stack.** Debug logs routinely leave the service boundary and enter shared observability platforms. Session secrets in those logs can outlive the process and broaden access to support staff or downstream processors.

**Exposure check and response.** Search for custom `ClientSessionStore` implementations and debug formatting of session values. Upgrade to **0.23.46 or later**. If affected logging existed, restrict and delete retained events where policy permits, review access, and treat the incident as secret exposure rather than only a dependency update.

## Supply-chain watch

The material package changes this week are in Rust’s archive, compression, WebAssembly and TLS layers. No newly verified malicious npm, PyPI or Cargo campaign met this brief’s primary-source threshold. No consequential CycloneDX or OWASP Dependency-Track release was identified after last week’s 5.2 coverage.

Generate SBOMs from resolved lockfiles and built artifacts so `zip`, `ruzstd`, `rustls` and Wasmtime appear even when transitive. In Dependency-Track, confirm that Rust advisories are matched to Cargo package URLs and that an upgrade produces a fresh analysis result; a stale BOM is not remediation evidence.

## AI-assisted development watch

Generated code often reaches for a convenient extraction helper or sandbox without reviewing the filesystem and resource model behind it. Require reviewers to trace the complete path from untrusted bytes to extraction, decompression or guest execution. For agent-created changes, ask for negative tests covering symlinks, output-size limits and denied filesystem access—not only a successful happy-path test. Agents should begin read-only and must not run hostile fixtures against production or inspect real secrets.

## Developer checklist

### Today

- [ ] Run `cargo audit` and `cargo tree -i zip`; retain evidence of `zip` **9.0.1+** or documented non-presence.
- [ ] Inventory Wasmtime host operating systems, versions and preopened directories; retain a fixed version or evidence that untrusted guests cannot reach the affected path.
- [ ] Run `cargo tree -i ruzstd`; retain **0.9.1+** or code-path evidence that attacker-controlled Zstandard data is unreachable.

### This week

- [ ] Rebuild affected Rust services and record deployed image digests plus runtime dependency evidence.
- [ ] Test archive workers with harmless symlink and mode-bit fixtures; completion evidence is rejection or containment inside a disposable directory.
- [ ] Locate custom rustls `ClientSessionStore` code and debug logging; retain **0.23.46+** and a log search showing no session-value output.

### Backlog

- [ ] Add compressed/decompressed byte, memory and time limits to every untrusted file worker; retain automated limit tests.
- [ ] Upload build-derived CycloneDX SBOMs to Dependency-Track and retain analysis results matching the four Rust dependency families.

## Copy this prompt

```text
Perform a read-only AppSec assessment of <REPOSITORY> for <DEPLOYMENT_ENVIRONMENT>, owned by <APP_OWNER>.

Inspect manifests, resolved lockfiles, build artifacts, deployment configuration and reachable code paths before drawing conclusions. Do not modify code, dependencies, lockfiles, infrastructure or access policies without explicit approval. Do not expose secrets or upload proprietary code.

Check for:
1. Rust zip through 9.0.0, especially extraction of untrusted archives, symlink entries, preserved Unix mode bits and permission restoration outside the extraction root.
2. Affected Wasmtime/wasmtime-wasi versions on macOS or FreeBSD, including preopened directories, guest read/write access and files available to the host identity.
3. ruzstd before 0.9.1 where attacker-controlled Zstandard data is decompressed without output, memory or time limits.
4. rustls 0.21.0 through 0.23.45 with a custom ClientSessionStore that debug-logs session values.
5. SBOM and Dependency-Track records that omit these transitive Rust dependencies or do not reflect the deployed build.

For every result, cite exact files, dependency paths, versions, configurations and reachability evidence. Classify urgency as Act now, Plan, Watch or No action, and confidence as high, medium or low. State “not affected” when evidence proves absence or non-reachability; state “unknown” when evidence is insufficient.

Propose the smallest remediation and exact verification commands or tests. Use harmless fixtures only. Do not execute exploit payloads against production, inspect real secrets or access data outside the repository.
```

## Monday action plan

1. **Rust service owners:** prove the resolved `zip` and `ruzstd` versions and patch reachable deployments; evidence is a clean audit plus deployed image digest.
2. **Agent/runtime platform:** patch Wasmtime on affected hosts and document the outer process or container boundary.
3. **File-ingestion owner:** demonstrate symlink containment and decompression limits with safe automated fixtures.
4. **Platform networking:** find custom rustls session stores, remove secret-bearing debug output and review retained logs.
5. **DevSecOps:** regenerate build-derived SBOMs and confirm Dependency-Track reflects the deployed versions.

## References

- RustSec, [`zip` symlink extraction advisory RUSTSEC-2026-0368](https://rustsec.org/advisories/RUSTSEC-2026-0368.html), 17 October 2026.
- RustSec, [`zip` Unix permission advisory RUSTSEC-2026-0367](https://rustsec.org/advisories/RUSTSEC-2026-0367.html), 17 October 2026.
- zip-rs, [`zip` symlink permission advisory GHSA-4684-h2q9-2vcp](https://github.com/zip-rs/zip2/security/advisories/GHSA-4684-h2q9-2vcp), 17 October 2026.
- Bytecode Alliance, [Wasmtime filesystem sandbox escape GHSA-vqjp-4c8c-hfgg](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-vqjp-4c8c-hfgg), 14 October 2026.
- RustSec, [`ruzstd` decompression-bomb advisory RUSTSEC-2026-0344](https://rustsec.org/advisories/RUSTSEC-2026-0344.html), 12 October 2026.
- RustSec, [`rustls` debug-secret advisory RUSTSEC-2026-0346](https://rustsec.org/advisories/RUSTSEC-2026-0346.html), 13 October 2026.
