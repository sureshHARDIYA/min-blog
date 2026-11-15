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
- A section longer than 4,500 UTF-8 bytes currently causes an explicit error rather than truncation; split the section before generating.
- English Chirp voice is the current default. Norwegian articles require language/voice selection before generation.

## Cost and operations

- Google Chirp TTS usage and Cloudflare R2 storage/requests are **separate**. Check current free-tier pricing and configure billing alerts; free-tier eligibility is not a guarantee of zero cost.
- Use the R2 Standard storage class to qualify for its free allowance. Direct R2 egress is free, but excessive read requests can incur charges.
- Configure a bucket lifecycle rule to clean up superseded immutable MP3s after an appropriate retention period. Avoid a rule that deletes currently referenced audio.
- To regenerate with a new voice, change `ARTICLE_AUDIO_VOICE` in the workflow and rerun.
- No storage provider credentials are used by the website at runtime.
