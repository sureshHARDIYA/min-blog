---
title: "AgentBaiting and Fake AI Tools: Evidence, Enterprise Exposure and Defensive Architecture"
seoTitle: "AgentBaiting: Malicious MCP Servers, AI Skills and Enterprise Defense"
description: "An evidence-led investigation of FakeGit, malicious AI agent tools, poisoned registries, and practical enterprise controls."
seoDescription: "Verified 2026 research into malicious GitHub AI skills and MCP servers: FakeGit evidence, attack chains, exposure models, detection engineering, governance and references."
date: "2026-11-14"
category: AI Security
author: "Suresh Kumar Mukhiya"
tags: "appsec, ai-security, mcp, agent-security, software-supply-chain, threat-intelligence, github, detection-engineering"
---

## Executive assessment

**Assessment: substantiated threat, with important limits on the reported numbers.** This investigation examines a documented malicious-repository attack pattern. The strongest directly reviewed evidence is Island Security's July 2026 **FakeGit / AgentBaiting** investigation, corroborated in reporting by BleepingComputer, Help Net Security and RH-ISAC. This analysis does not independently reverse-engineer malware samples or validate every repository attribution.

Attackers publish plausible AI Skills, MCP servers and developer utilities on GitHub, replicate documentation and developer identities, and place malicious installation steps in READMEs or public capability catalogs. A human developer—or an assistant finding tools on their behalf—can carry these instructions into a trusted development environment. The security failure is **untrusted repository content being promoted into executable authority**.

**Decision for security leadership:** Treat external AI agent capabilities as executable third-party software, not as harmless prompts or configuration. Require provenance, sandboxing, approval, restricted permissions, runtime telemetry and revocation.

## Evidence dashboard

| Indicator | Reported quantity | Interpretation / limitation |
|---|---:|---|
| FakeGit malicious GitHub repositories | ~7,600 | Island's campaign-scoped investigation; not a global estimate |
| Associated profiles | ~6,600 | Researcher-attributed campaign accounts |
| AI-themed repositories | ~1,400 | Broad AI-tool/agent/workflow subset |
| Fake Skills / MCP servers | 800+ | Subset of the AI-themed repositories |
| Public registry appearances | 600+ | Listings, **not necessarily unique repositories** |
| GitHub Release download events | 14,084,688 | Cumulative requests across 335 assets in 211 repositories; **not infections, people or executions** |
| AI-themed repository creation peak | ~300 in April 2026 | Approximate monthly count in Island's observed sample |

**Source:** [Island primary investigation](https://www.island.io/blog/agentbaiting-how-800-fake-ai-skills-and-mcp-servers-delivered-malware); [BleepingComputer's researcher clarification](https://www.bleepingcomputer.com/news/security/fakegit-campaign-uses-7-600-github-repos-to-push-smartloader-malware/amp/). These numbers overlap and **must not be summed**.

### Visual scale — approximate repository counts

```text
All FakeGit repositories  7,600  ████████████████████████████████████████
AI-related repositories   1,400  ███████
Fake Skills / MCP           800+  ████
```

The visual uses the same approximate denominator; the two lower rows are subsets of the first. It is not a time series or infection rate.

## Verified findings and confidence

| Finding | Evidence | Confidence |
|---|---|---|
| Fake GitHub projects impersonated AI Skills and MCP servers | Island's detailed campaign investigation | High: directly documented by security researchers |
| README instructions and ZIP payloads facilitated malware delivery | Island analysis and independent reporting | High |
| SmartLoader established persistence and fetched StealC | Island analysis, BleepingComputer technical account | High as reported; no independent sample detonation performed here |
| Public AI capability registries reproduced malicious listings | Island identified more than 600 appearances | High as reported; catalog ingestion mechanisms were not fully established |
| AI assistants recommended campaign repositories in tests | Island tests, described by Help Net Security and BleepingComputer | High for the observed cases; **unknown population-wide failure rate** |
| Download counts represent confirmed infections | No such evidence | **Unsupported** |
| Every AI agent or MCP server is malicious | No such evidence | **False generalization** |
| Enterprise-wide compromise prevalence | No representative population measurement | **Unknown** |

## Attack-chain model

```text
Attacker creates convincing repository / lookalike maintainer
                      ↓
README + release ZIP + agent-facing installation instructions
                      ↓
GitHub search / public MCP and Skill registries / AI recommendations
                      ↓
Developer or agent selects tool and retrieves archive
                      ↓
Execution on workstation or CI runner (critical trust boundary)
                      ↓
SmartLoader staging + persistence + follow-on StealC
                      ↓
Potential theft of sessions, credentials and development secrets
```

**Critical distinction:** Discovering or recommending a repository is not the same as executing malware. BleepingComputer reports that in limited Island testing, Claude Code downloaded malicious material but subsequently stopped before execution in the observed run. These tests do not establish a universal prevention rate.

## How the mechanism works

### 1. Trust laundering through familiar distribution

A repository can imitate a popular project, maintainers, installation conventions and a polished README. Social proof (stars/forks) and plausible project names are not proof of software integrity. Island reported examples spanning Gmail, WhatsApp, Databricks, Jenkins and Docker integrations. The risk increases when the same description appears in several catalogs: duplicated visibility can be mistaken for independent validation.

### 2. Agent-mediated recommendation

When an assistant searches for a tool, repository text and search results are lower-trust inputs. An assistant may quote installation instructions without establishing publisher authenticity. This is **recommendation laundering**: the user perceives the assistant's answer as an endorsement, even though the underlying evidence came from an attacker-controlled README. The observed failures are important but do not justify claiming that all assistants always recommend malicious tools.

### 3. Execution and post-compromise

In the documented FakeGit chain, the user is steered toward ZIP downloads presented as setup artifacts. Researchers describe SmartLoader persistence, subsequent payload retrieval and StealC information theft. The impact depends on execution privileges and accessible secrets. A compromised developer laptop with cloud sessions, repository tokens or CI credentials can be a stepping stone into production, but such lateral movement is a **scenario**, not a confirmed outcome for every campaign victim.

## Enterprise threat model

| Asset / boundary | Exposure path | Control priority |
|---|---|---|
| Developer workstations | Unreviewed scripts, ZIPs, cloned repositories, local agent execution | EDR, sandbox, least privilege, execution policy |
| AI agent runtime | Agent reads untrusted README or SKILL.md and requests tools | Tool allowlist, instruction/data separation, approval gates |
| MCP servers | Third-party processes and broad filesystem/network permissions | Signed/approved inventory, per-server scopes, egress control |
| CI/CD runners | Repository setup hooks or package installation in privileged jobs | Ephemeral isolated runners, no ambient credentials, pinned actions |
| GitHub and registries | Lookalike maintainers and poisoned catalog entries | Publisher verification, immutable version pinning, repository reputation review |
| Azure / cloud identity | Tokens or session material on compromised endpoints | Short-lived identity, workload federation, scoped access, token rotation |
| Secret stores | Agents or processes can read secrets beyond task need | Just-in-time access, brokered credentials, audit logging |

### Architecture recommendation

**Separate discovery from execution.** Discovery can read public metadata; execution should happen only after provenance validation, security review, policy checks and human approval where risk warrants. A tool approved for local documentation search must not automatically gain shell execution, unrestricted network egress or production secrets.

```text
AI tool discovery → Intake quarantine → Provenance / hash / publisher check
                                          ↓
                                Policy + security review
                                          ↓
                              Approved internal catalog
                                          ↓
                              Sandboxed agent execution
                                          ↓
                         Egress + secrets + audit controls
                                          ↓
                            Continuous monitoring / revoke
```

## Detection engineering: actionable hypotheses

These are **defensive hypotheses to validate**, not vendor-verified detection signatures.

| Signal | Suggested telemetry | Investigation |
|---|---|---|
| README or SKILL.md points to a binary/ZIP in an unfamiliar repository | Repository intake scanner, source URL, archive SHA-256 | Compare publisher, commit history, archive contents, expected installation flow |
| Agent process downloads an executable archive | Process lineage, HTTP proxy, EDR file events | Determine whether download was approved and executed |
| Newly installed MCP server launches shells or scheduled tasks | EDR process tree, task scheduler logs | Compare activity against declared capability |
| Developer endpoint accesses secret stores after unapproved tool execution | Identity logs, EDR, cloud audit | Correlate session/token access and initiate containment |
| CI job unexpectedly reaches external file hosts | CI job logs, DNS, proxy and egress | Inspect changed workflows, dependency scripts and artifact downloads |
| Public registry lists a repository absent from approved catalog | Registry inventory / allowlist diff | Quarantine pending verification |

**Safe repository triage:** Inspect metadata and source without executing setup commands. Compare README installation steps with the actual source, look for archive-only releases, inspect scripts in a disposable environment, validate maintainers through an independent channel and record immutable hashes. Do not run suspicious samples on employee laptops or production runners.

### Example policy-as-code concept (illustrative)

```yaml
agent_capability_policy:
  default: deny
  sources: [approved_internal_catalog]
  require:
    - verified_publisher
    - immutable_commit_or_digest
    - reviewed_installation_artifacts
    - scoped_permissions
    - logged_tool_invocations
  execution:
    sandbox: required
    network_egress: allowlist
    production_secrets: prohibited_by_default
    human_approval: required_for_high_risk_actions
```

This is a design example, not a drop-in policy for a particular product.

## Immediate response playbook

**First 24 hours:** Inventory installed agent skills, MCP servers, IDE extensions and agent-run scripts. Preserve hashes, origins, repository URLs, local execution logs and credential exposure context. Quarantine unapproved capabilities. Alert endpoint security teams to unexpected archive execution and credential-access events.

**Next 7 days:** Establish an approved catalog and ownership model; restrict outbound traffic from agent sandboxes and CI runners; audit permissions and tokens available to agents; run controlled tests of repository recommendation and execution approval flows.

**Within 30 days:** Integrate capability approval into SDLC change management, CI checks, SBOM/provenance collection and incident response. Exercise a scenario involving a compromised developer workstation and credential rotation. Track measurable control coverage.

### Suggested KPIs

| Metric | Definition | Suggested goal (policy target, not industry benchmark) |
|---|---|---|
| Approved capability coverage | Approved / discovered installed agent capabilities | 100% |
| Provenance coverage | Capabilities pinned to reviewed immutable source | 100% |
| Sandbox coverage | Third-party agent executions isolated / total | 100% |
| High-risk action approval | Approved high-risk executions / total high-risk executions | 100% |
| Time to revoke | Detection-to-disable elapsed time | Establish baseline and reduce |
| Secret exposure | Number of agent runtimes with persistent production secrets | 0 by default |

## Technical evidence appendix

### Published sample indicators

RH-ISAC reproduces campaign-associated SHA-256 indicators. Treat them as **historical sample indicators**, not a complete detection strategy. A matching hash warrants investigation; absence of a match does not imply safety.

| Lure description | SHA-256 |
|---|---|
| Fake AI agent | `216a2c99fd42c00f9323d8b16dd19f622f7f4778b2b1d7cf07a3de5621f2` |
| Fake Claude Skills | `91e5dbfaf45edf25fbc2168f92083e05dfa427afa7633e991392e33cc743` |
| Fake Security MCP | `62744baa8077bb8be237647fd78e3bea2ca0932bf4be3d5618600f971185` |
| Fake Databricks MCP | `66afc7d87d10dbe392898c4e5c613e0442fabb396415c2bef3a5ef2ac758` |
| Fake Jenkins MCP | `a33f40cab1ab7f971d3464af3e7595918107332b9e83342007571842b9e` |

Source: [RH-ISAC, 21 July 2026](https://rhisac.org/threat-intelligence/new-agentbaiting-campaign-delivers-smartloader-via-fake-ai-skills-and-mcp-servers/). Verify indicator provenance before production blocking.

### Related 2026 research — not the same incident

In November, a separate report described **575+ malicious OpenClaw skills** delivering malware; this is corroborating evidence that malicious agent capabilities extend beyond the original FakeGit sample, **not a number to add to FakeGit counts**. A November researcher-curated timeline also describes **73 repositories** posing as agent tools; attribution to FakeGit is not independently established here. Another November report on **wfx-loot** describes hijacked GitHub accounts and CI secret theft—relevant to supply-chain exposure, but **not proof that it belongs to AgentBaiting**.

Sources: [Acronis report coverage](https://www.helpnetsecurity.com/2026/11/10/acronis-ai-agent-cyberattacks-report/); [AgentSec timeline](https://github.com/FlorianBruniaux/agentsec-triage/blob/main/docs/SECURITY-TIMELINE.md); [OX Security wfx-loot investigation](https://www.ox.security/blog/thousands-of-github-accounts-hijacked-with-wfx-loot-ci-secret-stealing-malware-via-github-actions-npm/).

## Limitations and methodology

Research cutoff: **14 November 2026**. This article evaluates Island's original investigation against additional security reporting. No live malware was executed, no independent census of GitHub repositories was performed, and no private enterprise telemetry was examined. Reported campaign counts are attributed to the researchers, not presented as original measurements. AI-assistant testing was limited and cannot establish a general failure probability. Registry listings may be automated or manually submitted; the original researchers could not conclusively determine the mechanism for every listing.

## References

1. [Island Security — AgentBaiting: How 800+ Fake AI Skills and MCP Servers Delivered Malware (20 July 2026)](https://www.island.io/blog/agentbaiting-how-800-fake-ai-skills-and-mcp-servers-delivered-malware)
2. [BleepingComputer — FakeGit campaign and researcher clarification (21 July 2026)](https://www.bleepingcomputer.com/news/security/fakegit-campaign-uses-7-600-github-repos-to-push-smartloader-malware/amp/)
3. [Help Net Security — AI agents tricked into recommending malicious repositories (21 July 2026)](https://www.helpnetsecurity.com/2026/07/21/github-repos-malware-campaign-fakegit-ai-agents/)
4. [RH-ISAC — AgentBaiting campaign and sample hashes (21 July 2026)](https://rhisac.org/threat-intelligence/new-agentbaiting-campaign-delivers-smartloader-via-fake-ai-skills-and-mcp-servers/)
5. [Recorded Future — H1 2026 Malware and Vulnerability Trends](https://www.recordedfuture.com/research/h1-2026-malware-vulnerability-trends)
6. [Help Net Security — Malicious OpenClaw skills (10 November 2026)](https://www.helpnetsecurity.com/2026/11/10/acronis-ai-agent-cyberattacks-report/)
7. [AgentSec threat timeline — 73 agent-lure repositories](https://github.com/FlorianBruniaux/agentsec-triage/blob/main/docs/SECURITY-TIMELINE.md)
8. [OX Security — wfx-loot CI secret-stealing campaign (12 November 2026)](https://www.ox.security/blog/thousands-of-github-accounts-hijacked-with-wfx-loot-ci-secret-stealing-malware-via-github-actions-npm/)

**Bottom line:** Agent capability discovery is a software supply-chain ingestion point. The defense is not to stop using AI agents, but to prevent attacker-controlled repository instructions from crossing into privileged execution without provenance, policy enforcement and observable approval.
