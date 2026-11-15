"""Deterministic, author-reviewable narration for Markdown articles.

Optional src/content/narration/<slug>.json:
{"sections": {"2": {"tables": ["..."], "images": ["..."], "charts": ["..."], "code": ["..."], "videos": ["..."]}}}
Overrides are indexed by occurrence within each ## section, in document order.
"""
import json
import pathlib
import re

OVERRIDES = pathlib.Path("src/content/narration")
FENCE = re.compile(r"(?ms)^\s*```[^\n]*\n.*?^\s*```\s*$")
IMAGE = re.compile(r"!\[([^\]]*)\]\(([^)]*)\)")
VIDEO = re.compile(r"(?im)^\s*(?:<video\b[^>]*>|<iframe\b[^>]*>|\[([^]]*video[^]]*)\]\(([^)]+)\))")
TABLE_SEPARATOR = re.compile(r"^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$")


def clean(value):
    value = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"[\`*_#>]", "", value)
    return re.sub(r"\s+", " ", value).strip()


def _load(slug):
    path = OVERRIDES / (slug + ".json")
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("sections", {}), dict):
        raise ValueError(f"Invalid narration overrides: {path}")
    return data.get("sections", {})


def narration_text(section, slug, section_index):
    config = _load(slug).get(str(section_index), {})
    if not isinstance(config, dict):
        raise ValueError(f"Invalid section narration config: {slug} {section_index}")
    counters = {key: 0 for key in ("tables", "images", "charts", "code", "videos")}

    def describe(kind, fallback):
        index = counters[kind]
        counters[kind] += 1
        choices = config.get(kind, [])
        if not isinstance(choices, list):
            raise ValueError(f"Expected list for {slug} section {section_index} {kind}")
        if index < len(choices) and isinstance(choices[index], str) and choices[index].strip():
            return " " + clean(choices[index]) + " "
        return " " + fallback + " "

    # Process media before ordinary Markdown links, avoiding URL narration.
    section = FENCE.sub(lambda match: describe("code", "This section contains a code example. Refer to the written article for the implementation."), section)
    section = IMAGE.sub(lambda match: describe("images", "Image: " + clean(match.group(1)) if match.group(1).strip() else "An image is shown in the article; no verified description is available."), section)
    section = VIDEO.sub(lambda match: describe("videos", "A video is embedded in the article. See the page to watch it."), section)

    lines = section.splitlines()
    result = []
    i = 0
    while i < len(lines):
        if i + 1 < len(lines) and "|" in lines[i] and TABLE_SEPARATOR.match(lines[i + 1]):
            headers = [clean(c) for c in lines[i].strip().strip("|").split("|")]
            i += 2
            rows = []
            while i < len(lines) and "|" in lines[i] and lines[i].strip():
                rows.append([clean(c) for c in lines[i].strip().strip("|").split("|")])
                i += 1
            # Narrate small tables exactly, without inventing trends or conclusions.
            if len(rows) <= 5 and len(headers) <= 4:
                fallback = "Table. " + " ".join(
                    "; ".join(f"{header}: {row[j] if j < len(row) else 'not provided'}" for j, header in enumerate(headers))
                    for row in rows
                )
            else:
                fallback = "A table compares " + ", ".join(headers) + f" across {len(rows)} rows. Consult the visual table for details."
            result.append(describe("tables", fallback))
            continue
        line = lines[i]
        # Explicit chart markers are author-controlled; never infer data from visuals.
        if re.search(r"<(?:Chart|AgentBaitingChart)\b|\{\{chart:", line):
            result.append(describe("charts", "An interactive chart appears here. Consult the visual article for the data."))
        elif not re.match(r"^\s*(?:<[^>]+>|\|[-: |]+\|)\s*$", line):
            result.append(clean(line))
        i += 1
    return re.sub(r"\s+", " ", " ".join(result)).strip()
