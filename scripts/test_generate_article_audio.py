"""Stubbed tests for the narration generator: no cloud credentials, SDKs or network.

Run with: python3 -m pytest scripts/test_generate_article_audio.py
"""
import importlib.util
import io
import json
import pathlib
import sys
from urllib.error import HTTPError

import pytest

SCRIPTS = pathlib.Path(__file__).parent
sys.path.insert(0, str(SCRIPTS))
_spec = importlib.util.spec_from_file_location("generate_article_audio", SCRIPTS / "generate-article-audio.py")
gen = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gen)

# MPEG-2 Layer III, 32 kbit/s, 24 kHz: the header Chirp MP3 output starts with.
FRAME_HEADER = bytes.fromhex("fff344c4")
FAKE_AUDIO = FRAME_HEADER + b"\0" * 3996  # 4000 bytes at 32 kbit/s is exactly one second
VOICE = "en-US-Chirp3-HD-Leda"
BASE = "https://audio.example"


class MissingObject(Exception):
    response = {"Error": {"Code": "404"}}


class FakeStorage:
    def __init__(self):
        self.objects = {}
        self.calls = []

    def head_object(self, Bucket, Key):
        self.calls.append(("head", Key))
        if Key not in self.objects:
            raise MissingObject()
        return {"ContentLength": len(self.objects[Key])}

    def get_object(self, Bucket, Key, Range):
        self.calls.append(("get", Key))
        return {"Body": io.BytesIO(self.objects[Key][:4])}

    def put_object(self, Bucket, Key, Body, **_):
        self.calls.append(("put", Key))
        self.objects[Key] = Body


class FakeSynthesizer:
    def __init__(self, fail_on=None):
        self.texts = []
        self.fail_on = fail_on

    def synthesize(self, text):
        if self.fail_on and self.fail_on in text:
            raise gen.SynthesisError("boom")
        self.texts.append(text)
        return FAKE_AUDIO


@pytest.fixture
def workspace(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    for name in ("blog", "narration", "audio"):
        (tmp_path / "src/content" / name).mkdir(parents=True)
    return tmp_path


def write_article(slug, body):
    path = gen.ARTICLES / f"{slug}.md"
    path.write_text(f"---\ntitle: {slug}\n---\n{body}\n")
    return path


def make_generator(storage, synthesizer, *, per_run=10_000, per_month=100_000, public_base=BASE):
    return gen.Generator(
        storage=storage, bucket="b", public_base=public_base, voice=VOICE,
        synthesizer=synthesizer, budget=gen.Budget(per_run, per_month),
    )


def manifest(slug):
    return json.loads((gen.OUT / f"{slug}.json").read_text())


def test_unchanged_rerun_makes_no_synthesis_or_storage_calls(workspace):
    article = write_article("a", "Intro text.\n\n## One\nFirst section.")
    storage = FakeStorage()
    assert make_generator(storage, FakeSynthesizer()).run([article]) == []
    storage.calls.clear()
    second_synth = FakeSynthesizer()
    second = make_generator(storage, second_synth)

    assert second.run([article]) == []

    assert second_synth.texts == [] and storage.calls == []
    assert second.unchanged_articles == 1 and second.budget.used_this_run == 0


def test_editing_one_section_synthesizes_only_that_section(workspace):
    article = write_article("a", "Intro text.\n\n## One\nFirst section.\n\n## Two\nSecond section.")
    storage = FakeStorage()
    make_generator(storage, FakeSynthesizer()).run([article])
    write_article("a", "Intro text.\n\n## One\nFirst section.\n\n## Two\nRewritten section.")
    synth = FakeSynthesizer()
    generator = make_generator(storage, synth)

    generator.run([article])

    assert synth.texts == ["Two Rewritten section."]
    assert generator.reused_segments == 2 and generator.generated_segments == 1


def test_changing_public_base_url_reuses_audio(workspace):
    article = write_article("a", "Intro text.")
    storage = FakeStorage()
    make_generator(storage, FakeSynthesizer()).run([article])
    synth = FakeSynthesizer()

    make_generator(storage, synth, public_base="https://new.example").run([article])

    assert synth.texts == []
    assert manifest("a")["segments"][0]["url"].startswith("https://new.example/")


def test_manifest_records_version_duration_and_chunk_parts(workspace):
    long_section = "## Long\n" + " ".join(["word"] * 1000)  # 5000 bytes, so two chunks
    article = write_article("a", long_section)

    make_generator(FakeStorage(), FakeSynthesizer()).run([article])

    data = manifest("a")
    assert data["version"] == gen.MANIFEST_VERSION
    assert [(s["id"], s["part"]) for s in data["segments"]] == [("listen-section-0", 0), ("listen-section-0", 1)]
    assert all(s["duration"] == 1.0 for s in data["segments"])


def test_reused_segments_get_duration_from_stored_object(workspace):
    article = write_article("a", "Intro text.")
    storage = FakeStorage()
    make_generator(storage, FakeSynthesizer()).run([article])
    (gen.OUT / "a.json").unlink()

    make_generator(storage, FakeSynthesizer()).run([article])

    assert manifest("a")["segments"][0]["duration"] == 1.0


def test_one_failing_article_does_not_block_others(workspace):
    bad = write_article("a-bad", "This one will EXPLODE.")
    good = write_article("b-good", "This one is fine.")
    generator = make_generator(FakeStorage(), FakeSynthesizer(fail_on="EXPLODE"))

    failures = generator.run([bad, good])

    assert len(failures) == 1 and "a-bad.md" in failures[0]
    assert not (gen.OUT / "a-bad.json").exists()
    assert (gen.OUT / "b-good.json").exists()


def test_run_budget_stops_before_spending_and_keeps_finished_articles(workspace):
    first = write_article("a", "Short intro.")
    second = write_article("b", "Another article that does not fit the budget.")
    third = write_article("c", "Never reached.")
    synth = FakeSynthesizer()
    generator = make_generator(FakeStorage(), synth, per_run=20)

    failures = generator.run([first, second, third])

    assert synth.texts == ["Short intro."]
    assert len(failures) == 1 and "per-run ceiling" in failures[0]
    assert (gen.OUT / "a.json").exists() and not (gen.OUT / "b.json").exists()


def test_monthly_budget_counts_earlier_usage():
    budget = gen.Budget(per_run=1000, per_month=100, used_this_month=95)

    with pytest.raises(gen.BudgetExceeded, match="monthly ceiling"):
        budget.charge(10)

    assert budget.used_this_month == 95


def test_storage_errors_other_than_missing_are_not_treated_as_missing(workspace):
    class Forbidden(Exception):
        response = {"Error": {"Code": "403"}}

    class DeniedStorage(FakeStorage):
        def head_object(self, Bucket, Key):
            raise Forbidden("denied")

    synth = FakeSynthesizer()
    failures = make_generator(DeniedStorage(), synth).run([write_article("a", "Intro text.")])

    assert synth.texts == [] and len(failures) == 1


def test_mp3_duration_reads_bitrate_from_frame_header():
    assert gen.mp3_duration(FRAME_HEADER, 505344) == 126.336
    assert gen.mp3_duration(b"ID3\x04", 1000) is None


def http_error(code, message="", status="ERR"):
    body = json.dumps({"error": {"message": message, "status": status}}).encode()
    return HTTPError(gen.TTS_URL, code, "reason", {}, io.BytesIO(body))


class ScriptedOpener:
    """Replays a list of responses: exceptions are raised, bytes are returned as audio."""

    def __init__(self, script):
        self.script = list(script)
        self.requests = []

    def __call__(self, request, timeout):
        self.requests.append(request)
        step = self.script.pop(0)
        if isinstance(step, Exception):
            raise step
        payload = json.dumps({"audioContent": __import__("base64").b64encode(step).decode()}).encode()
        return io.BytesIO(payload)


def make_synthesizer(script, tokens=None):
    opener = ScriptedOpener(script)
    sleeps = []
    tokens = tokens or gen.TokenSource(fetch=lambda: "token")
    return gen.Synthesizer(VOICE, "project", tokens, opener=opener, sleep=sleeps.append), opener, sleeps


def test_synthesizer_retries_rate_limits_with_backoff():
    synth, opener, sleeps = make_synthesizer([http_error(429), http_error(503), b"ok"])

    assert synth.synthesize("hello") == b"ok"
    assert len(opener.requests) == 3 and sleeps == [2, 4]


def test_synthesizer_refreshes_token_after_401():
    issued = iter(["old", "new"])
    synth, opener, _ = make_synthesizer([http_error(401), b"ok"], gen.TokenSource(fetch=lambda: next(issued)))

    assert synth.synthesize("hello") == b"ok"
    assert [r.get_header("Authorization") for r in opener.requests] == ["Bearer old", "Bearer new"]


def test_synthesizer_does_not_retry_permanent_errors():
    synth, opener, _ = make_synthesizer([http_error(403, "API disabled", "PERMISSION_DENIED")])

    with pytest.raises(gen.SynthesisError, match="PERMISSION_DENIED"):
        synth.synthesize("hello")
    assert len(opener.requests) == 1


def test_long_sentence_rejection_is_retried_with_shorter_sentences():
    long_sentence = " ".join(["word"] * 200) + "."
    rejection = http_error(400, "This request contains sentences that are too long.", "INVALID_ARGUMENT")
    synth, opener, _ = make_synthesizer([rejection, b"ok"])

    assert synth.synthesize(long_sentence) == b"ok"
    retried_text = json.loads(opener.requests[1].data)["input"]["text"]
    assert all(len(s.encode()) <= gen.SHORT_SENTENCE_BYTES + 1 for s in retried_text.split(". "))


def test_token_source_refreshes_when_stale():
    now = [0.0]
    issued = iter(["t1", "t2"])
    tokens = gen.TokenSource(fetch=lambda: next(issued), clock=lambda: now[0])

    assert tokens.get() == "t1" and tokens.get() == "t1"
    now[0] = gen.TOKEN_LIFETIME_SECONDS + 1
    assert tokens.get() == "t2"
