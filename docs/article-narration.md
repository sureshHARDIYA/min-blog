# Article narration (Google Chirp 3 HD)

The blog uses pre-generated, section-level MP3 files. Readers never call Google TTS.

## Google Cloud setup

1. Create or choose a Google Cloud project with billing enabled. Enable **Cloud Text-to-Speech API** and **Cloud Storage API**.
2. Create a dedicated GCS bucket for audio. Give public **read-only** access to audio objects (if public access prevention is enforced, use a CDN or signed delivery instead). Avoid putting credentials or private data in the bucket.
3. Create a service account with Text-to-Speech permission and **Storage Object Creator** plus **Storage Object Viewer** on the audio bucket. Configure GitHub Actions Workload Identity Federation, restricted to this repository and its main branch. Do not upload a JSON key.
4. Configure repository secrets `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_AUDIO_SERVICE_ACCOUNT`, and repository variable `ARTICLE_AUDIO_BUCKET` (bucket name only).
5. Trigger **Generate article narration** via Actions → Run workflow. The job generates `src/content/audio/<slug>.json` manifests and commits them, causing a normal deployment. On subsequent edits to `src/content/blog/*.md`, the workflow runs automatically.

## Updates and billing

- Each article's Markdown body is SHA-256 hashed. Unchanged articles are skipped.
- Each section's narration text plus voice is hashed to form an immutable object name; unchanged sections are reused across edits.
- The player appears only when the matching manifest exists. During regeneration, the page temporarily hides stale narration.
- Section-level highlighting follows the active MP3, not individual words. Word-level highlighting requires timestamps from a separate forced-alignment step.
- Cloud billing must be enabled even if usage is within a free allowance. Set a budget alert and monitor TTS character usage and GCS storage/egress. A budget alert **does not** automatically stop spending.
- Long Markdown sections over 4500 UTF-8 bytes currently fail with an actionable error. Split large sections before generating; never silently truncate narration.
- The pipeline currently uses the English voice `en-US-Chirp3-HD-Leda`. For Norwegian posts, add language metadata and voice selection before enabling those articles.

## Operations

- To change the voice, edit `ARTICLE_AUDIO_VOICE` in the workflow and rerun the job. Old immutable objects can be lifecycle-deleted after a retention period.
- For a one-off regeneration, use workflow_dispatch. It is idempotent for unchanged content.
- To remove narration for a post, delete its manifest. Remove obsolete audio objects using a bucket lifecycle policy after a suitable delay.
