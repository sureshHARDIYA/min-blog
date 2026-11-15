#!/usr/bin/env python3
"""Generate changed article sections using Google Chirp 3 HD; upload immutable MP3s to Cloudflare R2.

One failing article never blocks the others: its manifest is left untouched, every
other article is still written, and the process exits non-zero at the end.
"""
import base64
import datetime
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import time
import urllib.request
from urllib.error import HTTPError, URLError

from narration import narration_text

ROOT = pathlib.Path("src/content")
ARTICLES = ROOT / "blog"
OVERRIDES = ROOT / "narration"
OUT = ROOT / "audio"
USAGE_LEDGER = ROOT / "audio-usage.json"

# Bump when the manifest shape changes so existing manifests are rewritten (audio is reused).
MANIFEST_VERSION = 2
MAX_CHUNK_BYTES = 4200
HARD_LIMIT_BYTES = 4500
SHORT_SENTENCE_BYTES = 250
TOKEN_LIFETIME_SECONDS = 40 * 60
MAX_ATTEMPTS = 4
RETRYABLE_STATUS = {429, 500, 502, 503, 504}
DEFAULT_MAX_CHARS_PER_RUN = 60_000
DEFAULT_MAX_CHARS_PER_MONTH = 900_000
TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"
MISSING_OBJECT_CODES = ("404", "NoSuchKey", "NotFound")
# MPEG audio bitrates in kbit/s, indexed by the 4-bit header field (Layer III).
MPEG1_BITRATES = (0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0)
MPEG2_BITRATES = (0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0)


class BudgetExceeded(RuntimeError):
    """Raised before a synthesis request that would pass a character ceiling."""


class SynthesisError(RuntimeError):
    def __init__(self, message, *, is_long_sentence=False):
        super().__init__(message)
        self.is_long_sentence = is_long_sentence


def chunks(text, max_bytes=MAX_CHUNK_BYTES):
    """Split at word boundaries so long sections stay within the synthesis limit."""
    current = []
    for word in text.split():
        candidate = " ".join(current + [word])
        if len(candidate.encode("utf-8")) > max_bytes and current:
            yield " ".join(current)
            current = [word]
        else:
            current.append(word)
    if current:
        yield " ".join(current)


def shorten_sentences(text):
    """Break over-long sentences into short ones that Chirp accepts."""
    shorter = []
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        for part in chunks(sentence, max_bytes=SHORT_SENTENCE_BYTES):
            shorter.append(part if part.endswith((".", "!", "?")) else part + ".")
    return " ".join(shorter)


def mp3_duration(header, size):
    """Seconds of a constant-bitrate MP3, from its first frame header and byte size."""
    if len(header) < 4 or header[0] != 0xFF or (header[1] & 0xE0) != 0xE0:
        return None
    is_mpeg1 = (header[1] >> 3) & 3 == 3
    kilobits = (MPEG1_BITRATES if is_mpeg1 else MPEG2_BITRATES)[(header[2] >> 4) & 15]
    if not kilobits:
        return None
    return round(size * 8 / (kilobits * 1000), 3)


def fingerprint_of(content, override_bytes):
    return hashlib.sha256(content.encode() + b"\\nNARRATION\\n" + override_bytes).hexdigest()


class TokenSource:
    """Workload-identity access tokens expire after about an hour; refresh well before."""

    def __init__(self, fetch=None, clock=time.monotonic):
        self._fetch = fetch or self._gcloud
        self._clock = clock
        self._token = None
        self._fetched_at = 0.0

    @staticmethod
    def _gcloud():
        return subprocess.check_output(["gcloud", "auth", "print-access-token"], text=True).strip()

    def get(self, *, force=False):
        is_stale = self._clock() - self._fetched_at > TOKEN_LIFETIME_SECONDS
        if force or self._token is None or is_stale:
            self._token = self._fetch()
            self._fetched_at = self._clock()
        return self._token


class Budget:
    """Character ceilings per run and per calendar month, checked before spending."""

    def __init__(self, per_run, per_month, used_this_month=0):
        self.per_run = per_run
        self.per_month = per_month
        self.used_this_run = 0
        self.used_this_month = used_this_month

    def charge(self, characters):
        if self.used_this_run + characters > self.per_run:
            raise BudgetExceeded(
                f"per-run ceiling of {self.per_run} characters reached "
                f"({self.used_this_run} used). Raise ARTICLE_AUDIO_MAX_CHARS_PER_RUN to continue."
            )
        if self.used_this_month + characters > self.per_month:
            raise BudgetExceeded(
                f"monthly ceiling of {self.per_month} characters reached "
                f"({self.used_this_month} used). Raise ARTICLE_AUDIO_MAX_CHARS_PER_MONTH to continue."
            )
        self.used_this_run += characters
        self.used_this_month += characters


class Synthesizer:
    def __init__(self, voice, project_id, tokens, *, opener=urllib.request.urlopen, sleep=time.sleep):
        self.voice = voice
        self.project_id = project_id
        self._tokens = tokens
        self._open = opener
        self._sleep = sleep

    def _build_request(self, text):
        payload = {
            "input": {"text": text},
            "voice": {"languageCode": self.voice[:5], "name": self.voice},
            "audioConfig": {"audioEncoding": "MP3"},
        }
        return urllib.request.Request(
            TTS_URL,
            data=json.dumps(payload).encode(),
            headers={
                "Authorization": "Bearer " + self._tokens.get(),
                "Content-Type": "application/json",
                "x-goog-user-project": self.project_id,
            },
        )

    def _describe(self, error):
        try:
            details = json.load(error).get("error", {})
        except ValueError:
            details = {}
        reason = next(
            (item["reason"] for item in details.get("details", []) if item.get("reason")),
            details.get("status", error.reason),
        )
        message = details.get("message", "Google returned no error details.")
        lowered = message.lower()
        return SynthesisError(
            f"Cloud Text-to-Speech failed for project {self.project_id} "
            f"(HTTP {error.code}, {reason}): {message}",
            is_long_sentence=error.code == 400 and "sentence" in lowered and "long" in lowered,
        )

    def _request(self, text):
        has_refreshed_token = False
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                with self._open(self._build_request(text), timeout=120) as response:
                    return base64.b64decode(json.load(response)["audioContent"])
            except HTTPError as error:
                if error.code == 401 and not has_refreshed_token:
                    has_refreshed_token = True
                    self._tokens.get(force=True)
                    continue
                if error.code not in RETRYABLE_STATUS or attempt == MAX_ATTEMPTS:
                    raise self._describe(error) from None
            except (URLError, TimeoutError) as error:
                if attempt == MAX_ATTEMPTS:
                    raise SynthesisError(f"Cloud Text-to-Speech was unreachable: {error}") from None
            self._sleep(2 ** attempt)
        raise SynthesisError("Cloud Text-to-Speech retries were exhausted.")

    def synthesize(self, text):
        try:
            return self._request(text)
        except SynthesisError as error:
            if not error.is_long_sentence:
                raise
        # MP3 frames are self-contained, so separately synthesized pieces can be joined.
        return b"".join(self._request(piece) for piece in chunks(shorten_sentences(text)))


class Generator:
    def __init__(self, *, storage, bucket, public_base, voice, synthesizer, budget):
        self.storage = storage
        self.bucket = bucket
        self.public_base = public_base
        self.voice = voice
        self.synthesizer = synthesizer
        self.budget = budget
        self.unchanged_articles = 0
        self.reused_segments = 0
        self.generated_segments = 0

    def _existing_duration(self, key):
        """Duration of an already uploaded object, or None when the object is missing."""
        # Cloudflare R2 does not implement ExpectedBucketOwner; the account-scoped
        # endpoint URL already pins every request to this account's buckets.
        try:
            size = self.storage.head_object(Bucket=self.bucket, Key=key)["ContentLength"]  # NOSONAR python:S7608
        except Exception as error:  # botocore ClientError; boto3 is not imported here so tests need no SDK
            code = getattr(error, "response", {}).get("Error", {}).get("Code")
            if code not in MISSING_OBJECT_CODES:
                raise
            return None
        header = self.storage.get_object(Bucket=self.bucket, Key=key, Range="bytes=0-3")["Body"].read()  # NOSONAR python:S7608
        return mp3_duration(header, size) or 0

    def _segment(self, article, index, part, chunk):
        if len(chunk.encode("utf-8")) > HARD_LIMIT_BYTES:
            raise ValueError(f"{article.name} has a single oversized word in section {index}")
        section_hash = hashlib.sha256((self.voice + "\\n" + chunk).encode()).hexdigest()[:20]
        key = f"articles/{article.stem}/{section_hash}.mp3"
        duration = self._existing_duration(key)
        if duration is None:
            self.budget.charge(len(chunk))
            audio = self.synthesizer.synthesize(chunk)
            self.storage.put_object(  # NOSONAR python:S7608
                Bucket=self.bucket,
                Key=key,
                Body=audio,
                ContentType="audio/mpeg",
                CacheControl="public, max-age=31536000, immutable",
            )
            self.generated_segments += 1
            duration = mp3_duration(audio[:4], len(audio)) or 0
        else:
            self.reused_segments += 1
        segment = {"id": f"listen-section-{index}", "part": part, "text": chunk[:100], "url": f"{self.public_base}/{key}"}
        if duration:
            segment["duration"] = duration
        return segment

    def _is_current(self, previous, fingerprint):
        return (
            previous.get("version") == MANIFEST_VERSION
            and previous.get("contentHash") == fingerprint
            and previous.get("voice") == self.voice
            and previous.get("storage") == "r2"
            and previous.get("publicBaseUrl") == self.public_base
        )

    def process(self, article):
        content = re.split(r"\n---\n", article.read_text(), maxsplit=1)[-1].strip()
        override_path = OVERRIDES / (article.stem + ".json")
        override_bytes = override_path.read_bytes() if override_path.exists() else b""
        fingerprint = fingerprint_of(content, override_bytes)
        destination = OUT / (article.stem + ".json")
        previous = json.loads(destination.read_text()) if destination.exists() else {}
        if self._is_current(previous, fingerprint):
            self.unchanged_articles += 1
            return
        segments = []
        sections = [section for section in re.split(r"(?=^## )", content, flags=re.M) if section]
        for index, section in enumerate(sections):
            text = narration_text(section, article.stem, index)
            for part, chunk in enumerate(chunks(text)):
                segments.append(self._segment(article, index, part, chunk))
        manifest = {
            "version": MANIFEST_VERSION,
            "contentHash": fingerprint,
            "voice": self.voice,
            "storage": "r2",
            "publicBaseUrl": self.public_base,
            "segments": segments,
        }
        destination.write_text(json.dumps(manifest, indent=2) + "\n")

    def run(self, articles):
        """Process every article; return a list of human-readable failures."""
        failures = []
        OUT.mkdir(parents=True, exist_ok=True)
        for article in articles:
            try:
                self.process(article)
            except BudgetExceeded as error:
                failures.append(f"Stopped at {article.name}: {error}")
                break
            except Exception as error:  # isolate one article so the rest still publish
                failures.append(f"{article.name}: {error}")
        return failures

    def summary(self):
        return (
            f"Narration: {self.unchanged_articles} unchanged articles skipped, "
            f"{self.reused_segments} existing segments reused, "
            f"{self.generated_segments} new segments synthesized "
            f"({self.budget.used_this_run} input characters; "
            f"{self.budget.used_this_month} this month)."
        )


def load_usage(month):
    if not USAGE_LEDGER.exists():
        return {}, 0
    ledger = json.loads(USAGE_LEDGER.read_text())
    return ledger, int(ledger.get(month, 0))


def env_int(name, default):
    value = os.environ.get(name, "").strip()
    return int(value) if value else default


def main():
    import boto3

    month = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m")
    ledger, used_this_month = load_usage(month)
    voice = os.environ.get("ARTICLE_AUDIO_VOICE", "en-US-Chirp3-HD-Leda")
    budget = Budget(
        env_int("ARTICLE_AUDIO_MAX_CHARS_PER_RUN", DEFAULT_MAX_CHARS_PER_RUN),
        env_int("ARTICLE_AUDIO_MAX_CHARS_PER_MONTH", DEFAULT_MAX_CHARS_PER_MONTH),
        used_this_month,
    )
    generator = Generator(
        storage=boto3.client(
            "s3",
            endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            region_name="auto",
        ),
        bucket=os.environ["R2_BUCKET"],
        public_base=os.environ["R2_PUBLIC_BASE_URL"].rstrip("/"),
        voice=voice,
        synthesizer=Synthesizer(voice, os.environ["ARTICLE_AUDIO_GCP_PROJECT"], TokenSource()),
        budget=budget,
    )
    failures = generator.run(sorted(ARTICLES.glob("*.md")))
    if budget.used_this_run:
        USAGE_LEDGER.write_text(json.dumps({**ledger, month: budget.used_this_month}, indent=2, sort_keys=True) + "\n")

    lines = [generator.summary(), *(f"FAILED {failure}" for failure in failures)]
    print("\n".join(lines))
    step_summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if step_summary:
        with open(step_summary, "a", encoding="utf-8") as handle:
            handle.write("\n\n".join(lines) + "\n")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
