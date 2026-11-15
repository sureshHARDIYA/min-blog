#!/usr/bin/env python3
"""Generate changed article sections using Google Chirp 3 HD; upload immutable MP3s to Cloudflare R2."""
import base64, hashlib, json, os, pathlib, re, subprocess, urllib.request
from narration import narration_text
import boto3
from botocore.exceptions import ClientError
ROOT = pathlib.Path("src/content")
ARTICLES = ROOT / "blog"
OUT = ROOT / "audio"
BUCKET = os.environ["R2_BUCKET"]
PUBLIC_BASE = os.environ["R2_PUBLIC_BASE_URL"].rstrip("/")
R2 = boto3.client("s3", endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com", aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"], aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"], region_name="auto")
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

def chunks(text, max_bytes=4200):
    # Split at word boundaries so existing long articles can be narrated safely.
    current = []
    for word in text.split():
        candidate = ' '.join(current + [word])
        if len(candidate.encode('utf-8')) > max_bytes and current:
            yield ' '.join(current)
            current = [word]
        else:
            current.append(word)
    if current:
        yield ' '.join(current)

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
        if previous.get("contentHash") == fingerprint and previous.get("voice") == VOICE and previous.get("storage") == "r2":
            continue
        segments = []
        sections = [section for section in re.split(r"(?=^## )", content, flags=re.M) if section]
        for index, section in enumerate(sections):
            text = narration_text(section, article.stem, index)
            if not text:
                continue
            for chunk in chunks(text):
                if len(chunk.encode("utf-8")) > 4500:
                    raise ValueError(f"{article.name} has a single oversized word in section {index}")
                section_hash = hashlib.sha256((VOICE+"\\n"+chunk).encode()).hexdigest()[:20]
                object_name = f"articles/{article.stem}/{section_hash}.mp3"
                url = f"{PUBLIC_BASE}/{object_name}"
                try:
                    R2.head_object(Bucket=BUCKET, Key=object_name)
                    exists = True
                except ClientError as error:
                    if error.response["Error"]["Code"] not in ("404", "NoSuchKey", "NotFound"):
                        raise
                    exists = False
                if not exists:
                    audio = synthesize(chunk)
                    R2.put_object(Bucket=BUCKET, Key=object_name, Body=audio, ContentType="audio/mpeg", CacheControl="public, max-age=31536000, immutable")
                segments.append({"id":f"listen-section-{index}","text":chunk[:100],"url":url})
        destination.write_text(json.dumps({"contentHash":fingerprint,"voice":VOICE,"storage":"r2","segments":segments},indent=2)+"\n")

if __name__ == "__main__":
    main()
