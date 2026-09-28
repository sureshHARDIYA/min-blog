---
title: 'AppSec Lead Brief: patch Next.js image routes and recheck build trust'
seoTitle: 'Next.js ImageResponse RCE and TeamCity Ransomware | AppSec Brief'
description: "This week's engineering priorities: Next.js image-generation exposure, TeamCity ransomware, device-code phishing and Rust parser updates."
seoDescription: 'AppSec briefing for 28 September 2026: Next.js ImageResponse, TeamCity, WSO2, EvilTokens, Rust dependencies and a Dependency-Track correction.'
date: '2026-09-28'
author: 'Suresh Kumar Mukhiya'
tags: 'appsec, nextjs, rust, software-supply-chain, entra-id, dependency-track, ai-security'
---

## Executive summary

Check dynamic social-image routes today: Next.js has released an emergency fix for remote code execution in a specific Node.js image-generation path. Separately, CISA now records ransomware use of the TeamCity vulnerability, making unpatched build infrastructure an investigation priority. Microsoft’s EvilTokens report adds a concrete identity check: establish where device-code authentication is actually needed. This brief covers developments from 21–28 September, plus a clearly labelled correction to last week’s Dependency-Track coverage.

## Risk at a glance

- **Act now — Next.js:** versions 16.2.0 through 16.3.5, Node.js `next/og` with untrusted SVG values; critical maintainer advisory, no exploitation claim here. **Owner:** web lead.
- **Act now if present — TeamCity:** unpatched On-Premises installations; CISA changed ransomware use to “Known” on 23 September. **Owner:** CI/CD and incident response.
- **Act now if present — WSO2:** affected API management products; added to KEV on 24 September. **Owner:** API platform.
- **Plan — Entra ID:** device-code authentication and token recovery; Microsoft reports observed EvilTokens compromises. **Owner:** identity/SOC.
- **Plan, urgent for exposed parsers — Rust:** `domain` before 0.12.3 and vulnerable librsvg builds; maintainer/RustSec findings, no active exploitation established by these sources. **Owner:** Rust and image-processing teams.
- **Watch — Next.js 30 September release:** announced patches are forthcoming, not yet available fixes. **Owner:** release lead.

## Next.js: establish the image route, runtime and input source

**What changed and evidence.** On 22 September, Next.js released 16.3.6 for [GHSA-vcvr-r3jv-pc5j](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j). The vulnerable path is Node.js `ImageResponse` from `next/og` when attacker-controlled values reach SVG content, attributes or styles. Edge implementations and routes without those inputs are outside the advisory’s affected scope.

The [release announcement](https://nextjs.org/blog/nextjs-security-update-september-22-2026) explicitly says Next.js 15.x is **not affected by this RCE**; 15.5.26 provides related hardening. Avoid turning that hardening release into a false exposure finding.

**Why it matters.** Social previews can look like harmless presentation code while executing on a server with application credentials. Tenant names, query parameters and uploaded content deserve the same trust analysis as other API inputs.

**Exposure check.** Inspect the resolved lockfile, imports of `next/og`, route runtime and origin of each value supplied to `ImageResponse`. Include metadata-image routes. A manifest range alone does not establish the deployed version.

**Response.** Upgrade affected 16.x deployments to 16.3.6 and rebuild/redeploy. If blocked, remove untrusted values from the affected rendering path. Verify the deployed artifact and regression-test legitimate previews. Do not test exploit payloads against production.

**Watch separately:** the [23 September advance notice](https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026) schedules 16.3.7 and 15.5.27 for 30 September, addressing nine vulnerabilities. Reserve testing capacity; do not defer the available emergency patch or invent details for undisclosed issues.

## TeamCity: ransomware changes the response

**What changed and evidence.** CISA’s [23 September catalog change](https://github.com/cisagov/kev-data/commit/4a8ab2f71f71c57148b9bdbd3a59d1588c743dc6) changes CVE-2026-63077 from unknown to known ransomware use. This is an escalation in exploitation evidence, not a newly discovered flaw.

**Scope and response.** [JetBrains’ advisory](https://blog.jetbrains.com/teamcity/2026/07/cve-2026-63077/) identifies unauthenticated command execution through the agent polling protocol. Fixed On-Premises versions include 2025.11.7 and 2026.1.3. TeamCity Cloud customers require no action for this vulnerability. A vendor patch plugin is available for older supported installations when an upgrade is blocked.

**Why it matters and exposure check.** Ask who operates the build server, record its exact patch state and historical network exposure, and identify credentials and artifacts it could access. An affected build system can undermine otherwise clean application dependencies.

After containment, have incident response review server activity, administrative changes and build integrity. Where compromise is suspected, recover credentials and rebuild affected releases from trusted infrastructure. An installed patch proves remediation of the flaw; it does not prove earlier builds were trustworthy.

## API gateways: WSO2 joins KEV

**What changed and evidence.** CISA added CVE-2026-5430 on [24 September](https://github.com/cisagov/kev-data/commit/203fa4633af39c6944608e30984996f04ccc4541). Its entry names WSO2 API Control Plane, API Manager, Traffic Manager and Universal Gateway, describing unrestricted upload and possible code execution.

**Relevance and exposure check.** A Python or Rust API can inherit exposure from its gateway without a vulnerable application package. Check the API platform inventory, including vendor-operated gateways, against [WSO2-2026-5328](https://security.docs.wso2.com/en/latest/security-announcements/security-advisories/2026/WSO2-2026-5328/). Exact product/update-level mapping must come from that advisory; no universal fixed version is asserted here.

**Response.** If present and affected, escalate patching and forensic triage to the platform owner. Azure API Management is a different product; an Azure deployment alone does not establish WSO2 exposure.

## Entra ID: close unnecessary device-code paths

**What changed and evidence.** On 22 September, [Microsoft disclosed its disruption of EvilTokens](https://blogs.microsoft.com/on-the-issues/2026/09/22/disrupting-eviltokens-the-ai-chatbot-built-for-cybercrime/), linked to more than 12,000 compromised inboxes across over 10,000 organizations. Its [technical analysis](https://www.microsoft.com/en-us/security/blog/2026/09/22/unmasking-eviltokens-getting-to-the-root-of-device-code-phishing/) describes device-code phishing and AI-assisted analysis of stolen mailbox content.

**Why it matters.** The concern for Azure-connected engineering teams is stolen identity access, rather than a new FastAPI, React or SQL Server defect.

**Exposure check and response.** Have the identity owner inventory legitimate device-code use and inspect sign-in evidence. Plan Conditional Access restrictions for unnecessary use, testing required workflows and emergency access before enforcement. For suspected compromise, follow Microsoft’s token/device remediation guidance and investigate associated activity; the service takedown does not demonstrate that a particular tenant is clean.

## Rust: include parsers below the application layer

**What changed and evidence.** [RUSTSEC-2026-0310](https://rustsec.org/advisories/RUSTSEC-2026-0310.html), dated 25 September, covers panics, soundness problems and CPU/memory exhaustion in the `domain` DNS crate. Version 0.12.3 fixes the reported issues across parsing, transports and other components.

**Exposure check and response.** Inspect `Cargo.lock` and `cargo tree -i domain`; trace untrusted DNS messages and zone-file inputs. Upgrade affected deployments, with resolver/transport tests and resource-limit checks. Prioritize services that parse attacker-controlled traffic; this is not a claim that every Rust application uses `domain`.

Separately, [RUSTSEC-2026-0305](https://rustsec.org/advisories/RUSTSEC-2026-0305.html), issued 23 September, reports a librsvg use-after-free involving nested XML includes and duplicate entities. Patched ranges are `>=2.63.2` or `>=2.62.4,<2.62.90`.

**Why it matters.** Image conversion may use native libraries outside Cargo, npm or Python lockfiles. Inspect runtime images and system packages as well as language dependencies. Update affected librsvg installations using the relevant upstream or distribution fix, then exercise SVG conversion in an isolated test environment. Neither advisory cited here establishes active exploitation.

## Supply-chain watch and a correction

The immediate supply-chain finding is TeamCity’s changed ransomware status. No additional malicious-package campaign was verified to the publication threshold in this review; that is a limit of the evidence, not proof that registries were quiet.

**Correction to 21 September:** Dependency-Track **5.1.1 was released on 20 September**, before the previous brief. The earlier statement that no consequential release had been identified missed fixes relevant to vulnerability analysis. [The official release](https://github.com/DependencyTrack/dependency-track/releases/tag/5.1.1) includes NVD iteration/watermarking fixes, restored data-source-mirroring notifications, versionless-PURL handling and v4 migration corrections.

**Plan:** use 5.1.1 as the evaluation baseline for the 5.1 line. In staging, confirm source mirroring advances and a known affected test component reaches analysis and notification. Treat this as a correction, not news released this week. No consequential new CycloneDX specification change was verified.

This week’s SBOM lesson is practical: associate language dependencies with the deployed image and its native packages. A lockfile-only inventory can miss the SVG parser actually handling uploads.

## AI-assisted development watch

EvilTokens demonstrates AI helping attackers interpret already-stolen data. For your own agents, review which mailbox, repository and cloud permissions are available before increasing autonomy; use narrowly scoped identities and explicit approval for external actions.

For code review, this week’s Next.js finding gives an agent a precise task: trace untrusted values through image generation and prove the runtime. Require file evidence and negative tests rather than accepting “React escapes strings” as a security conclusion. These are engineering recommendations derived from the findings, not a newly disclosed vulnerability in every coding assistant.

## Other stack developments

No additional consequential core Python/FastAPI, PostgreSQL or Microsoft SQL Server development was verified for this week. The reviewed [FastAPI advisories](https://github.com/fastapi/fastapi/security/advisories), [PostgreSQL security page](https://www.postgresql.org/support/security/) and [SQL Server 2022 build list](https://learn.microsoft.com/troubleshoot/sql/releases/sqlserver-2022/build-versions) do not justify a new emergency action in this brief. This does not clear transitive dependencies or replace existing patch work. Azure/Entra action this week is covered above; React applications using affected Next.js routes require the specific check described earlier.

## Developer checklist

### Today

- [ ] Trace Next.js `next/og` routes, runtime and untrusted inputs; save exact file references and the deployed version, then patch confirmed exposure to 16.3.6 with a successful redeployment record.
- [ ] Inventory TeamCity On-Premises and WSO2 gateways; record exact versions/update levels, network exposure and the platform owner's patch or investigation decision.

### This week

- [ ] Inspect Rust `domain` and runtime librsvg inventory; record applicable fixed versions, reachability and passing DNS/SVG regression tests after any approved update.
- [ ] Review Entra device-code sign-ins and legitimate use; retain an approved restriction plan and pilot results before enforcement.
- [ ] Validate Dependency-Track 5.1.1 in staging; retain mirroring timestamps and a known-vulnerability analysis/notification result.
- [ ] Prepare for the 30 September Next.js release; assign an owner and record the release-day advisory review and test plan.

### Backlog

- [ ] Extend the affected services' SBOM process to include native runtime packages; prove that the deployed SVG parser appears in inventory alongside language dependencies.

## Copy this prompt

```text
Assess <REPOSITORY> in read-only mode for the 28 September 2026 AppSec brief. Use <DEPLOYMENT_ENVIRONMENT> and <APP_OWNER> only where supplied. Do not modify code, dependencies, lockfiles, infrastructure or access policies without explicit user approval.

Inspect manifests, lockfiles, CI configuration, deployment files and existing SBOMs before drawing conclusions. Establish what is actually deployed; do not treat a manifest range as an installed version.

1. Find next/og ImageResponse routes. Establish Next.js version, Node.js versus Edge runtime, and whether attacker-controlled input reaches SVG content, attributes or styles. Compare with GHSA-vcvr-r3jv-pc5j. Keep the September 30 advance notice separate from available patches.
2. Identify actual TeamCity or WSO2 use through CI, infrastructure and runbooks. Compare exact vendor versions/update levels with CVE-2026-63077 and CVE-2026-5430. Do not infer presence from generic API or CI tooling.
3. Find Rust domain and librsvg, including native packages in runtime images. Check RUSTSEC-2026-0310 and RUSTSEC-2026-0305 and trace reachable untrusted parsing paths.
4. Inspect documented Entra device-code requirements and agent permissions. Missing tenant sign-in evidence means unknown, not safe. Do not query production or change identity policy without authorization.
5. Check Dependency-Track version and available evidence of successful vulnerability-feed mirroring, analysis and notifications.

For each finding cite exact files, line locations and observed evidence. Classify urgency as Act now, Plan, Watch or No action, and confidence as high, medium or low. State "not affected" when evidence supports it and "unknown" when evidence is insufficient. Separate facts from inference.

Propose minimal remediations with verification commands/tests, without executing changes. Never expose secrets or upload proprietary code. Do not execute exploit payloads. Return an evidence-based assessment and stop for approval.
```

## Monday action plan

1. **Web lead:** close the Next.js exposure check with a route trace and deployed-version evidence.
2. **Platform/incident response:** resolve TeamCity and WSO2 inventory matches with patch evidence and an investigation disposition.
3. **Rust service owners:** deliver dependency/native-package inventory and tests for reachable parsers.
4. **Identity lead:** document required device-code use and an approved, tested restriction plan.
5. **AppSec/release lead:** validate Dependency-Track's analysis path and reserve capacity for Wednesday's Next.js advisories.

## References

- Next.js, 22 September 2026: [ImageResponse advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j) and [release announcement](https://nextjs.org/blog/nextjs-security-update-september-22-2026).
- Next.js, 23 September 2026: [30 September advance notice](https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026).
- CISA, 23 September 2026: [TeamCity ransomware-status change](https://github.com/cisagov/kev-data/commit/4a8ab2f71f71c57148b9bdbd3a59d1588c743dc6).
- JetBrains, 27 July 2026, updated 7 August: [CVE-2026-63077 advisory](https://blog.jetbrains.com/teamcity/2026/07/cve-2026-63077/).
- CISA, 24 September 2026: [WSO2 KEV addition](https://github.com/cisagov/kev-data/commit/203fa4633af39c6944608e30984996f04ccc4541). WSO2, publication date not verified: [vendor advisory and update matrix](https://security.docs.wso2.com/en/latest/security-announcements/security-advisories/2026/WSO2-2026-5328/).
- Microsoft, 22 September 2026: [EvilTokens disruption](https://blogs.microsoft.com/on-the-issues/2026/09/22/disrupting-eviltokens-the-ai-chatbot-built-for-cybercrime/) and [technical analysis](https://www.microsoft.com/en-us/security/blog/2026/09/22/unmasking-eviltokens-getting-to-the-root-of-device-code-phishing/).
- RustSec, 23 September 2026: [librsvg advisory](https://rustsec.org/advisories/RUSTSEC-2026-0305.html).
- RustSec, 25 September 2026: [domain advisory](https://rustsec.org/advisories/RUSTSEC-2026-0310.html).
- Dependency-Track, 20 September 2026: [5.1.1 release](https://github.com/DependencyTrack/dependency-track/releases/tag/5.1.1).
- Rolling monitoring sources, checked 28 September 2026: [FastAPI advisories](https://github.com/fastapi/fastapi/security/advisories), [PostgreSQL security](https://www.postgresql.org/support/security/), [SQL Server 2022 builds](https://learn.microsoft.com/troubleshoot/sql/releases/sqlserver-2022/build-versions), [CycloneDX newsroom](https://cyclonedx.org/news/).
