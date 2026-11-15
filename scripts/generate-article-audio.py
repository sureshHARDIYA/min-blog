#!/usr/bin/env python3
"""Generate changed article sections using Google Chirp 3 HD; upload immutable MP3s to GCS."""
import base64, hashlib, json, os, pathlib, re, subprocess, urllib.request
ROOT = pathlib.Path("src/content")
ARTICLES = ROOT / "blog"
OUT = ROOT / "audio"
BUCKET = os.environ["ARTICLE_AUDIO_BUCKET"]
VOICE = os.environ.get("ARTICLE_AUDIO_VOICE", "en-US-Chirp3-HD-Leda")
TOKEN = subprocess.check_output(["gcloud", "auth", "print-access-token"], text=True).strip()

def plain(markdown):
    markdown = re.sub(r"```[\s\S]*?```", "", markdown)
    markdown = re.sub(r"!\[[^]]*\]\([^)]*\)", "", markdown)
    markdown = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", markdown)
    markdown = re.sub(r"^\s*\|.*$", "", markdown, flags=re.M)
    markdown = re.sub(r"^\s*#{1,6}\s+", "", markdown, flags=re.M)
    markdown = re.sub(r"[`*_>#]", "", markdown)
    return re.sub(r"\s+", " ", markdown).strip()

def synthesize(text):
    payload = json.dumps({"input":{"text":text},"voice":{"languageCode":VOICE[:5],"name":VOICE},"audioConfig":{"audioEncoding":"MP3"}}).encode()
    request = urllib.request.Request("https://texttospeech.googleapis.com/v1/text:synthesize",data=payload,headers={"Authorization":"Bearer "+TOKEN,"Content-Type":"application/json"})
    with urllib.request.urlopen(request, timeout=120) as response:
        return base64.b64decode(json.load(response)["audioContent"])

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for article in ARTICLES.glob("*.md"):
        source = article.read_text()
        content = re.split(r"\n---\n", source, maxsplit=1)[-1].strip()
        fingerprint = hashlib.sha256(content.encode()).hexdigest()
        destination = OUT / (article.stem + ".json")
        previous = json.loads(destination.read_text()) if destination.exists() else {}
        if previous.get("contentHash") == fingerprint and previous.get("voice") == VOICE:
            continue
        segments = []
        sections = [section for section in re.split(r"(?=^## )", content, flags=re.M) if section]
        for index, section in enumerate(sections):
            text = plain(section)
            if not text: continue
            # REST synthesis has input size limits; skip oversized sections rather than silently truncate.
            if len(text.encode("utf-8")) > 4500:
                raise ValueError(f"{article.name} section {index} exceeds synthesis limit; split into smaller sections")
            section_hash = hashlib.sha256((VOICE+"\n"+text).encode()).hexdigest()[:20]
            object_name = f"articles/{article.stem}/{section_hash}.mp3"
            url = f"https://storage.googleapis.com/{BUCKET}/{object_name}"
            # Generation is idempotent across edits and retries.
            exists = subprocess.run(["gcloud","storage","ls",f"gs://{BUCKET}/{object_name}"],capture_output=True).returncode == 0
            if not exists:
                audio = synthesize(text)
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".mp3") as tmp:
                    tmp.write(audio); tmp.flush()
                    subprocess.run(["gcloud","storage","cp",tmp.name,f"gs://{BUCKET}/{object_name}"],check=True)
            segments.append({"id":f"listen-section-{index}","text":text[:100],"url":url})
        destination.write_text(json.dumps({"contentHash":fingerprint,"voice":VOICE,"segments":segments},indent=2)+"\n")

if __name__ == "__main__":
    main()
