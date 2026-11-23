---
title: 'AppSec Lead Brief: local is not a security boundary'
seoTitle: 'MCP DNS rebinding, Rust sandbox escape and HTTP request splitting'
description: 'Browser-reachable MCP servers, proxy parsing and Windows sandbox paths show why local and internal are not authorization controls.'
seoDescription: 'AppSec briefing for 23 November 2026 covering MCP DNS rebinding, Next.js response injection, actix-http request splitting, Wasmtime sandbox escape and Dependency-Track 4.14.7.'
date: '2026-11-23'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, mcp, ai-security, nextjs, rust, wasmtime, software-supply-chain, dependency-track, api-security'
---

## Executive summary

The engineering decision this week is whether “local”, “internal” or “behind a proxy” is being mistaken for an authorization control. A critical Todoist MCP flaw shows that a public website can drive a loopback HTTP agent through DNS rebinding when caller authentication and origin checks are absent. New Rust advisories expose the same design error at lower layers: ambiguous HTTP framing can cross a proxy boundary, while a drive-prefixed path can cross a WASI filesystem sandbox on Windows. Patch the affected components, but also require explicit caller identity, consistent parsing and regression tests at every boundary.

## Risk at a glance

- **Act now if used — Todoist MCP HTTP transport:** `@doist/todoist-mcp` **10.3.2 and earlier** can let a public website invoke a local server and use its configured Todoist token. Version **10.3.3** is patched. GitHub reviewed the critical advisory on 19 November; the primary source demonstrates task mutation, not exploitation in the wild. **Owner:** AI/agent platform lead.
- **Act now on Windows — Wasmtime WASI sandbox escape:** affected `wasmtime-wasi` ranges are **before 36.0.22**, **37.0.0–48.0.9**, **49.0.0–49.0.6** and **50.0.0–50.0.2**. A drive-prefixed path component can escape a preopened directory. No active exploitation is reported by the primary sources reviewed. **Owner:** Rust runtime lead.
- **Plan urgently where proxies differ — actix-http request splitting:** versions before **3.21.3** accept malformed quoted chunk extensions that can end a request body early. A downstream effect requires an intermediary that disagrees about request boundaries; the advisory does not demonstrate cross-user compromise. **Owner:** Rust/API platform lead.
- **Plan — Dependency-Track 4.14.7:** the 18 November patch mitigates CVE-2026-114938 in its container images and fixes Red Hat package-version false positives. This is an operational upgrade, not evidence that tracked applications are vulnerable. **Owner:** software supply-chain platform lead.
- **No action for this website — Next.js response injection:** CVE-2026-119348 affects Next.js **16.0.0–16.4.4** and **15.5.28 and earlier** in a specific self-hosted forwarding pattern. This repository resolves **16.4.6**, beyond fixed versions **16.4.5 / 15.5.29**. Other deployments still need an exposure check. **Owner:** React/Next.js platform lead.

## Local MCP servers need caller authentication

**What changed.** GitHub reviewed [CVE-2026-76807 / GHSA-833v-v58w-294h](https://github.com/advisories/GHSA-833v-v58w-294h) on 19 November. The maintainer advisory was originally published in July, but its addition to the reviewed advisory database materially changes how dependency and SBOM scanners surface the issue.

**Evidence.** `@doist/todoist-mcp` **10.3.2 and earlier** is affected when the optional Streamable HTTP server is running; **10.3.3** is patched. A hostile public page can use DNS rebinding to route its origin to a victim's loopback server. The MCP server then supplies its own `TODOIST_API_KEY`, allowing the browser-origin request to invoke registered tools. The demonstration covers task creation and completion, while the exposed tool surface also includes updates and deletion. The advisory does not claim active exploitation.

**Why it matters to this stack.** Agent tools often hold stronger credentials than the browser or developer invoking them. Binding a service to `127.0.0.1` limits direct network routing, but it does not authenticate the browser caller. The same pattern applies to local coding-agent bridges, database consoles and development APIs.

**Exposure check.** Resolve the installed package version and locate every MCP launch command. Confirm whether HTTP transport is enabled, which address and port it binds, which `Host` and `Origin` values it accepts, and whether each request requires a per-run caller secret. Inventory the credentials and write-capable tools available to the process. A process listening only on loopback is still potentially affected.

**Recommended response.** Upgrade to **10.3.3 or later**. Prefer stdio for a strictly local integration. If HTTP is required, validate an explicit allowlist of hosts and origins and require an unguessable, short-lived bearer token for every session. Rotate the Todoist token if logs or telemetry show unexpected calls, and test the control from a browser origin rather than with `curl` alone.

## HTTP framing must agree across every hop

**What changed.** RustSec issued [RUSTSEC-2026-0553](https://rustsec.org/advisories/RUSTSEC-2026-0553.html) for `actix-http` on 17 November. A malformed quoted chunk extension can make the server treat a carriage return as the end of an HTTP/1.1 chunk-size line before the quote closes.

**Evidence.** Versions before **3.21.3** are affected. The primary advisory shows that input such as an unterminated quoted extension can end a chunked body early and dispatch following bytes as another request on the same connection. Exploitation across users requires an upstream intermediary that forwards the malformed input while calculating a different request boundary. Proxy bypass, cache poisoning and cross-user response mixing were not demonstrated.

**Why it matters to this stack.** API authorization can be correct inside FastAPI, Rust or Next.js and still be bypassed when a reverse proxy and application server disagree about which bytes belong to which request. Multi-tenant services are especially sensitive when connections or caches are shared.

**Exposure check.** Find `actix-http` in `Cargo.lock`, including transitively through Actix Web. Map every CDN, ingress, load balancer and service-mesh hop that can forward HTTP/1.1 chunked requests. Determine whether malformed chunk extensions are rejected at the first hop and whether back-end connections are reused between clients.

**Recommended response.** Upgrade to **3.21.3 or later**. Add an integration test that sends malformed quoted chunk extensions through the real proxy chain and expects a closed connection or `400` response with no second request dispatched. Do not rely on disabling keep-alive at one layer without proving how every hop parses the message.

## Windows WASI paths can cross a preopened directory

**What changed.** RustSec issued [RUSTSEC-2026-0587](https://rustsec.org/advisories/RUSTSEC-2026-0587.html) on 20 November for `wasmtime-wasi`. On Windows, a drive-prefixed path component can escape the intended filesystem sandbox.

**Evidence.** Fixed releases are **36.0.22, 48.0.10, 49.0.7 and 50.0.3**. The affected ranges are earlier releases on those supported lines. The advisory scores the issue **7.5 High** under CVSS 4.0 and requires a path to reach a vulnerable WASI filesystem operation. It does not report exploitation in the wild.

**Why it matters to this stack.** Wasm is increasingly used to isolate extensions, policy code and agent-supplied tools. A preopened directory is a capability boundary; if the runtime interprets a component as a Windows drive path, an untrusted module can reach data the host intended to exclude.

**Exposure check.** Resolve `wasmtime-wasi` from `Cargo.lock` and the deployed binary, not only `Cargo.toml`. Confirm whether Windows workers execute untrusted or tenant-controlled Wasm, which directories are preopened, and whether guest-controlled input reaches filesystem APIs. Linux-only deployments are not affected by this advisory; mixed developer or CI fleets may still be.

**Recommended response.** Upgrade to the fixed patch on the deployed release line. Run a Windows regression test with drive-prefixed and mixed-separator components and verify that access outside the preopened directory fails. Keep the worker identity and filesystem ACLs least-privileged so a runtime escape does not become a host-wide breach.

## Next.js forwarding and cache boundaries

GitHub published [CVE-2026-119348 / GHSA-pc58-hwjq-p385](https://github.com/vercel/next.js/security/advisories/GHSA-pc58-hwjq-p385) to the advisory database on 19 November. Self-hosted App Router route handlers that return a fetched upstream response unchanged can emit framing that does not match the body, creating cross-client response injection or disclosure when connections are reused. Next.js **16.0.0–16.4.4** and **15.5.28 and earlier** are affected; **16.4.5** and **15.5.29** are fixed.

This website resolves Next.js **16.4.6**, so the repository is not affected by the documented version range. Other services should still search route handlers for `return fetch(...)` or returning an upstream `Response` unchanged, confirm whether they are self-hosted behind a persistent reverse proxy, and patch before treating code-path rarity as a workaround.

## Supply-chain watch

GitHub published a malware advisory for [`render-keepalive`](https://github.com/advisories/GHSA-wwrv-wg3m-hfrc) on 23 November. The primary record classifies the npm package as malicious but does not provide enough verified incident detail to justify broader ecosystem claims. Search current and historical lockfiles, build logs, caches and SBOMs for the exact package name. If found, preserve evidence, remove it, rotate credentials exposed to its install or runtime process, and inspect outbound activity.

OWASP Dependency-Track released [4.14.7](https://docs.dependencytrack.org/changelog/) on 18 November. The patch disables a vulnerable HotSpot optimization in its container images, updates dependencies and fixes Red Hat package-version matching that caused false positives. Teams on the 4.14 line should upgrade and re-evaluate previously triaged RHEL findings. Teams already on the separate 5.x line should follow that line's releases rather than interpreting 4.14.7 as an upgrade target.

No CycloneDX specification change in this review window alters the recommended baseline. Continue generating BOMs from resolved dependencies and deployed images, retaining older BOMs so a package removed from a registry can still be traced to a historical build.

## AI-assisted development watch

The Todoist advisory is a useful model for agentic systems: the agent's backend credential is not proof that the caller is authorized. Every network-capable tool bridge needs its own caller authentication, origin policy, capability scope and audit trail. “Loopback only” and “developer machine only” are deployment descriptions, not security decisions.

Coding agents reviewing these issues should begin with reachability. A package name is not enough: determine whether HTTP transport is enabled, whether untrusted browser origins can connect, whether a proxy preserves malformed framing, whether Windows workers run untrusted Wasm, and which credentials or tenant data the reachable process can use.

## Developer checklist

### Today

- [ ] **MCP:** resolve `@doist/todoist-mcp` and inspect launch configuration; evidence is **10.3.3+** or a documented “not affected” result proving HTTP transport is absent.
- [ ] **Rust/Actix:** resolve transitive `actix-http`; evidence is **3.21.3+** in `Cargo.lock` and the deployed binary SBOM.
- [ ] **Rust/Wasmtime:** resolve `wasmtime-wasi` on Windows workers; evidence is **36.0.22 / 48.0.10 / 49.0.7 / 50.0.3+** on the deployed release line.
- [ ] **Next.js:** inventory self-hosted services returning upstream `Response` objects unchanged; evidence is Next.js **16.4.5+ / 15.5.29+** or a cited, unreachable code path.

### This week

- [ ] **MCP browser boundary:** test an HTTP MCP server from an untrusted browser origin; evidence is rejected `Host`/`Origin` values plus a missing-or-invalid per-run token denial.
- [ ] **HTTP proxy chain:** replay malformed quoted chunk extensions through CDN/ingress/service hops; evidence is a rejected request and no second back-end dispatch.
- [ ] **WASI filesystem:** run drive-prefixed and mixed-separator path tests on Windows; evidence is denied access outside every preopened directory.
- [ ] **Supply chain:** search current and historical lockfiles, SBOMs, caches and build logs for `render-keepalive`; evidence is a historical “not present” record or a completed credential rotation and egress review.

### Backlog

- [ ] **Dependency-Track:** upgrade 4.14 deployments to **4.14.7** and re-evaluate RHEL findings; evidence is the running version, updated container digest and a reviewed false-positive delta.

## Copy this prompt

```text
Assess <REPOSITORY> and <DEPLOYMENT_ENVIRONMENT> for the verified issues in the 23 November 2026 AppSec brief. Begin in read-only assessment mode. Do not modify code, dependencies, lockfiles, generated output, infrastructure, access policies or credentials without explicit approval from <APP_OWNER>. Do not expose secrets or upload proprietary code.

Inspect source, workflows, resolved lockfiles, historical SBOMs, deployed image digests, runtime configuration and network paths before drawing conclusions. Determine whether these are actually present and reachable:
- @doist/todoist-mcp 10.3.2 or earlier with Streamable HTTP enabled; accepted Host and Origin values; missing per-request caller authentication; server-held credentials; and write-capable tools;
- actix-http before 3.21.3; HTTP/1.1 chunked requests crossing a CDN, proxy, ingress or service mesh; differing parsing of malformed quoted chunk extensions; and reused backend connections;
- wasmtime-wasi before the fixed releases 36.0.22, 48.0.10, 49.0.7 or 50.0.3 on Windows; untrusted Wasm; preopened directories; and guest-controlled drive-prefixed paths reaching filesystem operations;
- Next.js 16.0.0-16.4.4 or 15.5.28 and earlier; self-hosted App Router route handlers returning fetched upstream responses unchanged; and persistent proxy connections;
- render-keepalive in current or historical lockfiles, SBOMs, caches and build logs;
- Dependency-Track 4.14 before 4.14.7 and Red Hat findings affected by corrected version matching.

For every finding, cite exact files, lines, resolved versions, image digests, configurations, identities and reachable paths. Classify urgency as Act now, Plan, Watch or No action and confidence as high, medium or low. State "not affected" when evidence supports it and "unknown" when evidence is insufficient. Do not infer exposure from a package name alone.

Propose the smallest remediation plus verification commands or tests. Include a hostile browser-origin MCP test, malformed HTTP framing through the real proxy chain, Windows WASI path-escape regression tests, exact Next.js route-handler searches and historical malicious-package checks where relevant.
```

## Monday action plan

1. **AI/agent platform lead:** inventory HTTP MCP servers and patch Todoist MCP; complete with version evidence, caller-auth configuration and a rejected hostile-origin test.
2. **Rust/API platform lead:** upgrade `actix-http`; complete with the resolved version and a malformed-framing test through the production proxy topology.
3. **Rust runtime lead:** patch Windows `wasmtime-wasi`; complete with deployed binary evidence and a passing filesystem-escape regression test.
4. **React platform lead:** verify self-hosted forwarding handlers and patch affected Next.js services; complete with lockfile, image digest and route-level exposure evidence.
5. **Supply-chain platform lead:** update Dependency-Track 4.14 and search historical evidence for `render-keepalive`; complete with version/digest records and investigation notes.

## References

- [GitHub Advisory Database — CVE-2026-76807 / GHSA-833v-v58w-294h, reviewed 19 November 2026](https://github.com/advisories/GHSA-833v-v58w-294h)
- [Doist — Todoist MCP GHSA-833v-v58w-294h, published 10 July 2026](https://github.com/Doist/todoist-mcp/security/advisories/GHSA-833v-v58w-294h)
- [RustSec — RUSTSEC-2026-0553, issued 17 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0553.html)
- [RustSec — RUSTSEC-2026-0587, issued 20 November 2026](https://rustsec.org/advisories/RUSTSEC-2026-0587.html)
- [Vercel — Next.js GHSA-pc58-hwjq-p385, published 3 November 2026; CVE record added 19 November 2026](https://github.com/vercel/next.js/security/advisories/GHSA-pc58-hwjq-p385)
- [GitHub Advisory Database — malicious `render-keepalive`, published 23 November 2026](https://github.com/advisories/GHSA-wwrv-wg3m-hfrc)
- [OWASP Dependency-Track — 4.14.7 changelog, 18 November 2026](https://docs.dependencytrack.org/changelog/)
