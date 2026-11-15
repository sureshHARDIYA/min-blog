#!/usr/bin/env python3
"""Editorial narration audit; no cloud credentials or TTS requests required."""
import argparse
import json
import pathlib
import re
import sys

BLOG = pathlib.Path("src/content/blog")
NARRATION = pathlib.Path("src/content/narration")


def audit(article):
    source = article.read_text(encoding="utf-8")
    body = re.split(r"\n---\n", source, maxsplit=1)[-1].strip()
    sections = [s for s in re.split(r"(?=^## )", body, flags=re.M) if s]
    override_file = NARRATION / (article.stem + ".json")
    overrides = {}
    issues = []
    if override_file.exists():
        try:
            payload = json.loads(override_file.read_text(encoding="utf-8"))
            overrides = payload["sections"]
            if not isinstance(overrides, dict):
                raise ValueError("sections must be an object")
        except (ValueError, KeyError, TypeError) as exc:
            return [f"{article}: invalid narration JSON: {exc}"]
    for key in overrides:
        if not key.isdigit() or int(key) >= len(sections):
            issues.append(f"{article}: override section {key} does not exist")
    for index, section in enumerate(sections):
        settings = overrides.get(str(index), {})
        if not isinstance(settings, dict):
            issues.append(f"{article}: section {index} overrides must be an object")
            continue
        for kind, values in settings.items():
            if kind not in ("tables", "images", "charts", "code", "videos") or not isinstance(values, list) or any(not isinstance(v, str) or not v.strip() for v in values):
                issues.append(f"{article}: section {index} invalid {kind} narration override")
        # Advisory only: Markdown-based checks cannot see React-only chart insertions.
        table = bool(re.search(r"(?m)^\s*\|.*\|\s*\n\s*\|?\s*:?-{3,}", section))
        image = bool(re.search(r"!\[([^]]*)\]\([^)]+\)", section))
        code = "```" in section
        chart = bool(re.search(r"<(?:Chart|AgentBaitingChart)\b|\{\{chart:", section))
        video = bool(re.search(r"<(?:video|iframe)\b", section, re.I))
        if chart and not settings.get("charts"):
            issues.append(f"{article}: section {index} chart needs reviewed narration")
        if table and not settings.get("tables"):
            issues.append(f"{article}: section {index} table: verify spoken interpretation")
        if image and not settings.get("images"):
            issues.append(f"{article}: section {index} image: verify alt text and spoken meaning")
        if code and not settings.get("code"):
            issues.append(f"{article}: section {index} code: verify purpose is explained")
        if video and not settings.get("videos"):
            issues.append(f"{article}: section {index} video: provide spoken context")
    return issues


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="*", help="Markdown files to audit (default: all)")
    parser.add_argument("--strict", action="store_true", help="Exit nonzero on warnings")
    args = parser.parse_args()
    articles = [pathlib.Path(p) for p in args.paths] if args.paths else sorted(BLOG.glob("*.md"))
    issues = [issue for article in articles for issue in audit(article)]
    for issue in issues:
        print("WARNING:", issue)
    print(f"Audited {len(articles)} articles; {len(issues)} narration review item(s).")
    return 1 if args.strict and issues else 0


if __name__ == "__main__":
    sys.exit(main())
