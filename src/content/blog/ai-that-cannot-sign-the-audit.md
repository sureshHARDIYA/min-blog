---
title: "AI That Cannot Sign the Audit: Design Rules Behind Revios"
description: "Why we are building Revios, audit software for Nordic audit firms, and the engineering rules that keep AI useful without letting it make audit decisions: human approval, a signed audit log, privacy-separated data, and tenant isolation in the database."
seoTitle: "AI in Audit Software: Human Approval by Design"
seoDescription: "How Revios, a Norwegian audit software (revisjonsprogram), uses explainable ML and human-approved AI suggestions, a signed hash-chained audit log, and row-level security."
date: "2026-11-07"
---

## The question an auditor actually asks

When you show AI to an auditor, the first question is rarely "how accurate is it?"

It is: **"Who signed this?"**

An audit is a chain of judgements that a named, licensed person is accountable for. The auditor decides what is material, which risks matter, whether the evidence is sufficient, and what goes into the auditor's report. Finanstilsynet, the Norwegian regulator, inspects exactly that chain. When a firm is criticised, the finding is almost never "you lacked a tool". It is "you cannot show what you did and why."

That is the problem we are building [Revios](https://revios.no) to solve. Revios is audit software (*revisjonsprogram*) for Nordic audit firms. It keeps the whole engagement in one workflow structured after the ISA phases: planning, fieldwork, completion and reporting. Audit firms are short of people and long on documentation requirements, and AI can genuinely help. But only if it is designed so that it **can never be the one who signs**.

This post describes the engineering rules that follow from that, as Co-founder and CTO at Halifax AS, the company behind Revios.

## Rule 1: Detection is deterministic; language is the only job for the LLM

There are two very different things people call "AI in audit":

1. **Finding things**: unusual journal entries, transactions that break Benford's law, clusters of postings that do not look like the rest.
2. **Writing things**: drafting a procedure description, summarising findings, proposing wording for a letter.

We treat these as separate systems on purpose.

Detection uses **classical, deterministic machine learning**: statistical tests such as Benford analysis and clustering such as K-means, with explainability methods (SHAP/LIME) that show *why* a transaction was flagged. Run it twice on the same SAF-T file and you get the same answer. An auditor can explain it to a reviewer, and a reviewer can reproduce it. That is what regulated detection needs.

Large language models are used **only for language**. They draft; they never decide whether something is a risk. All LLM calls go through one gateway, which means one place to enforce redaction, logging and model choice. The primary model runs EEA-resident.

The rule we hold ourselves to: if a feature needs the LLM to be *right* about an audit conclusion, the feature is designed wrong.

## Rule 2: Every AI suggestion is inert until a human approves it

In Revios, an AI suggestion is a proposal object, not an action. It has three properties that the interface and the database both enforce:

- **It is labelled.** The user can always see that the text or flag came from AI. This is also what the EU AI Act's transparency obligations (Article 50) point towards.
- **It has no effect.** A suggested procedure is not in the audit plan, and a flagged transaction is not a finding, until an auditor accepts it.
- **The decision is logged either way.** Accepted *and rejected* suggestions are recorded with who decided and when.

The rejected ones matter more than they first appear. If a model flagged a transaction and the auditor dismissed it, a reviewer needs to see that a professional judgement was made, not that the signal was silently lost.

## Rule 3: The audit log is append-only, signed and chained

"Show what you did and why" requires a record nobody can quietly rewrite, including us.

Every meaningful action in an engagement is appended to an **immutable, signed audit log**. Each entry is part of a per-tenant hash chain: it includes a hash of the previous entry, so changing or removing anything in the middle breaks every hash after it. The entry is written **in the same database transaction** as the change it describes. There is no window where the data changed but the log did not.

Append-only is enforced in the database itself: a trigger rejects any `UPDATE` or `DELETE` on the log, so a bug in an endpoint cannot turn into an "edit history" feature.

## Rule 4: Personal data stays out of the ledger

An immutable log and the GDPR right to erasure look like they are in conflict. You cannot delete from a hash chain without breaking it.

The way out is to keep personal data out of the chain entirely. The log stores **pseudonymous references**. Names, contact details and document contents live in a separate store, **encrypted per data subject**. When erasure is legally required (and the audit firm's retention obligations allow it), we delete that subject's data and key. The chain stays intact and verifiable; it simply points to a reference that can no longer be resolved.

## Rule 5: Isolation is enforced by the database, not by remembering a `WHERE` clause

Audit firms hold some of the most sensitive data their clients have. A single cross-client leak would end the product.

I have [written before](/blog/the-api-knew-who-i-was-authorization) about how often authorization fails because an API checks *who* you are but not *what you may touch*. In Revios, isolation has two axes, **tenant** (the audit firm) and **engagement** (the client audit), and both are enforced by PostgreSQL **row-level security** with `FORCE ROW LEVEL SECURITY`. The application connects as a role with no ability to bypass those policies, and the tenant and engagement context are set per transaction.

Cross-tenant and cross-engagement leak tests are a merge gate. If one fails, nothing ships.

## Why this matters beyond compliance

These rules are not only about passing inspection. They change how the tool feels to use.

An auditor who knows the AI cannot act on its own is more willing to let it *propose* more. A partner who can trace every approval reviews faster. A firm that can show the regulator a verifiable trail spends less time reconstructing what happened.

Norwegian audit firms are under real pressure: the industry grows faster than it can hire, and documentation requirements keep rising. Good software should give auditors time back **without taking the judgement away from them**.

## What we are looking for

Revios is in early access. We are looking for a small number of Norwegian audit firms to work with as design partners, and we show the full workflow on **sample data**, so no client information is needed to see it.

If you work at an audit firm, or know someone who does, take a look at [revios.no](https://revios.no) or [book a walkthrough](https://revios.no/request-access). I'm also happy to talk engineering with anyone building software for regulated industries.
