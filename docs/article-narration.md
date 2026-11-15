# Article narration: Google Chirp 3 HD + Cloudflare R2

The blog generates section-level MP3s once using Google Cloud Text-to-Speech and stores them in Cloudflare R2 Standard storage. Readers fetch public MP3s directly from R2; no per-listen synthesis. Oracle Cloud Object Storage is a viable alternative, but R2 is preferred for public audio delivery.

## Google Cloud (synthesis only)

1. Enable billing and the **Cloud Text-to-Speech API** for a Google Cloud project.
2. Create a dedicated service account permitted to invoke Text-to-Speech, and configure **GitHub Actions Workload Identity Federation** with trust restricted to this repository and the main branch.
3. Add GitHub Actions secrets `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_AUDIO_SERVICE_ACCOUNT`. No long-lived Google service-account JSON key is needed.

## Cloudflare R2 (storage and delivery)

1. Create a Cloudflare R2 **Standard** bucket, e.g. `blog-audio`. R2 Standard has a free monthly allowance; usage beyond free limits may be charged.
2. Attach a public **custom domain** such as `audio.skmukhiya.com.np` to this bucket. Do not use a development `r2.dev` endpoint for production traffic.
3. Create an R2 API token scoped to **this bucket only** with Object Read & Write. Store the generated access key ID and secret access key in GitHub Actions secrets. Never expose these credentials in browser code.
4. Configure the following GitHub repository settings:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `R2_ACCOUNT_ID` | Cloudflare account ID |
| Secret | `R2_ACCESS_KEY_ID` | Bucket-scoped R2 access key |
| Secret | `R2_SECRET_ACCESS_KEY` | Bucket-scoped R2 secret key |
| Variable | `R2_BUCKET` | Bucket name, e.g. `blog-audio` |
| Variable | `R2_PUBLIC_BASE_URL` | Public HTTPS URL, e.g. `https://audio.skmukhiya.com.np` |

5. Merge the PR, then trigger **Generate article narration** manually once from GitHub Actions. The workflow scans existing articles and commits audio manifests. Subsequent changes to blog Markdown trigger automatic generation.

## How updates work

- SHA-256 of the Markdown body controls whether a manifest is current. SEO/frontmatter-only changes do not regenerate narration.
- Each section uses a deterministic key derived from its voice and spoken text. Unchanged sections reuse existing audio.
- Manifests in `src/content/audio/<slug>.json` contain only URLs and metadata, not MP3s. A new manifest commit triggers a site deployment.
- The player is hidden when a manifest is absent or stale. Highlighting is section-level, not word-level.
- Long sections are automatically divided at word boundaries into synthesis-safe chunks, while the player continues highlighting the containing article section.
- Manifests record each segment's duration, so the player shows listening time without fetching audio. Nothing is requested from R2 until the reader hovers, focuses or taps the player.
- One failing article does not block the others: finished manifests are still committed and the run is marked failed with the reason in the job summary. Fix the article and rerun; uploaded audio is reused.
- The `generate` job holds the cloud credentials and cannot write to the repository. The separate `publish` job commits manifests and rebases if `main` moved during generation. It pushes with the `NARRATION_DEPLOY_KEY` deploy key, which is the only bypass actor on the "Protect main" ruleset; if that key is rotated, update both the deploy key and the secret.
- English Chirp voice is the current default. Norwegian articles require language/voice selection before generation.

## Cost and operations

- Google Chirp TTS usage and Cloudflare R2 storage/requests are **separate**. Check current free-tier pricing and configure billing alerts; free-tier eligibility is not a guarantee of zero cost.
- Use the R2 Standard storage class to qualify for its free allowance. Direct R2 egress is free, but excessive read requests can incur charges.
- Configure a bucket lifecycle rule to clean up superseded immutable MP3s after an appropriate retention period. Avoid a rule that deletes currently referenced audio.
- **Spend guards.** Synthesis stops before any request that would pass a ceiling: 60,000 characters per run and 900,000 per calendar month by default. Override with the repository variables `ARTICLE_AUDIO_MAX_CHARS_PER_RUN` and `ARTICLE_AUDIO_MAX_CHARS_PER_MONTH`, or pass `max_characters` when running the workflow manually (needed for a full backfill or a voice change). Monthly usage is tracked in `src/content/audio-usage.json`; it only counts runs made after this guard was added. These ceilings are a safety net, not a billing control: also set a Cloud Billing budget alert.
- To regenerate with a new voice, change `ARTICLE_AUDIO_VOICE` in the workflow and rerun.
- No storage provider credentials are used by the website at runtime.

## Content-aware narration and editorial review

The deterministic narration builder (`scripts/narration.py`) reads prose and headings, reads small Markdown tables cell-by-cell, summarizes large tables by column names and row count, reads image alt text, and announces embedded video and fenced code without spelling out URLs or source code. It does **not** invent chart trends or statistics.

For meaningful summaries, create `src/content/narration/<slug>.json` with section-indexed overrides (zero-based index matching the article's `##` sections). Each media type uses zero-based occurrence order within its section:

```json
{
  "sections": {
    "2": {
      "tables": ["The table compares three scanners. Scanner A has the lowest false-positive rate according to the reported measurements."],
      "images": ["Architecture diagram showing the ingestion service connected to a queue and analysis worker."],
      "charts": ["The chart shows 12 high and 4 critical findings in the source dataset."],
      "code": ["The code validates the token before authorizing the request."],
      "videos": ["A short demonstration of the workflow."]
    }
  }
}
```

Descriptions must be reviewed against actual data and visuals. A chart inserted through React rather than Markdown (such as `AgentBaitingChart`) **is not automatically discoverable** by this Markdown-only extractor; add an explicit narrative in the article or extend the renderer with a linked narration marker. No vision model or LLM is invoked automatically, so there are no hidden AI-description costs.

Editing an override invalidates the manifest and regenerates affected narration. This is **section-level** highlighting, not word-level or chart-point highlighting. Review articles containing complex custom components before generating the full back catalogue.

## Instructions for future writing agents

Read `AGENTS.md` (and the tool-specific `CLAUDE.md` / `.github/copilot-instructions.md`) before drafting an article. Use `python3 scripts/check-article-narration.py` to audit the entire archive, or pass article paths to check only new work. The audit is advisory by default; `--strict` makes warnings fail. The audio workflow runs the advisory audit before synthesis. Review warnings against source material; the script cannot understand React-only components or certify factual correctness.

## Player, CORS and Content Security Policy

- **Audio-synced equalizer.** The bars follow the real audio spectrum only when the bucket allows cross-origin reads. Add a CORS policy to the R2 bucket allowing `GET` and `HEAD` from the site origins with the `Range` request header. Without it the player falls back to a decorative animation; playback is unaffected. Touch devices always use the fallback so lock-screen listening keeps working.
- **CSP.** `src/proxy.ts` only allows audio from the bucket's public origin. When the bucket moves to a custom domain, set the `ARTICLE_AUDIO_ORIGINS` environment variable (space-separated HTTPS origins) in the hosting platform, or playback will be blocked.
- **Tests.** `python3 -m pytest scripts/test_generate_article_audio.py` exercises the generator with stubbed storage and synthesis; it needs no credentials.
