#!/usr/bin/env python3
"""Safely prepare an already-built SleepingEdge site for owner-configured Google tags.

No credentials or IDs are committed. Empty environment variables leave the site
without Google tags. The Search Console token is injected only into the homepage.
GA4 is activated only after a visitor accepts optional analytics in the browser.
"""
from __future__ import annotations

import os
import re
import sys
import tempfile
from pathlib import Path
from html import escape
import posixpath


GA4_PATTERN = re.compile(r"G-[A-Z0-9]+")
GSC_PATTERN = re.compile(r"[A-Za-z0-9_-]{10,200}")


def inject_before_head_end(html: str, snippet: str, page: Path) -> str:
    if re.search(r"</head\s*>", html, re.I) is None:
        raise ValueError(f"Missing closing </head> tag: {page}")
    return re.sub(r"</head\s*>", snippet + "\n</head>", html, count=1, flags=re.I)


def prepare_site(root: Path, verification_token: str = "", measurement_id: str = "") -> int:
    if not root.is_dir():
        raise FileNotFoundError(f"Build directory does not exist: {root}")

    verification_token = verification_token.strip()
    measurement_id = measurement_id.strip()

    if verification_token and not GSC_PATTERN.fullmatch(verification_token):
        raise ValueError("GSC_VERIFICATION_TOKEN must contain 10–200 letters, digits, underscores or hyphens.")
    if measurement_id and not GA4_PATTERN.fullmatch(measurement_id):
        raise ValueError("GA4_MEASUREMENT_ID must have the format G-XXXXXXXXXX.")

    pages = sorted(root.rglob("*.html"))
    if not pages:
        raise ValueError(f"No HTML pages found in {root}")

    analytics_asset = root / "site-analytics.js"
    if measurement_id and not analytics_asset.is_file():
        raise FileNotFoundError("GA4 is configured, but site-analytics.js is missing from the production build.")

    changed = 0
    for page in pages:
        relative_parts = page.relative_to(root).parts
        if "preview" in relative_parts:
            continue

        original = page.read_text(encoding="utf-8")
        content = original

        if page == root / "index.html" and verification_token:
            tag = f'<meta name="google-site-verification" content="{escape(verification_token, quote=True)}">'
            existing = re.search(
                r'<meta\s+name=["\']google-site-verification["\']\s+content=["\']([^"\']*)["\']\s*/?>',
                content,
                re.I,
            )
            if existing:
                if existing.group(1) != verification_token:
                    raise ValueError("A different Search Console verification token already exists in the homepage.")
            else:
                content = inject_before_head_end(content, "  " + tag, page)

        if measurement_id:
            if "window.SLEEPINGEDGE_GA4_ID" in content:
                if measurement_id not in content:
                    raise ValueError(f"A different GA4 measurement ID is already configured in {page}.")
            else:
                page_dir = page.parent.relative_to(root).as_posix()
                relative_script = posixpath.relpath("site-analytics.js", page_dir if page_dir != "." else ".")
                config = f'<script>window.SLEEPINGEDGE_GA4_ID="{measurement_id}";</script>'
                loader = f'<script defer src="{relative_script}"></script>'
                content = inject_before_head_end(content, "  " + config + "\n  " + loader, page)

        if content != original:
            page.write_text(content, encoding="utf-8")
            changed += 1

    return changed


def self_test() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        (root / "sleep-calculator").mkdir()
        (root / "preview").mkdir()
        (root / "index.html").write_text("<html><head></head><body>home</body></html>", encoding="utf-8")
        (root / "sleep-calculator" / "index.html").write_text("<html><head></head><body>tool</body></html>", encoding="utf-8")
        (root / "preview" / "index.html").write_text("<html><head></head><body>preview</body></html>", encoding="utf-8")
        (root / "site-analytics.js").write_text("/* test asset */", encoding="utf-8")

        assert prepare_site(root) == 0, "An unconfigured site must remain unchanged."
        changed = prepare_site(root, "Abcdefghijklmnopqrstuvwxyz_123456", "G-ABC123")
        assert changed == 2, f"Expected homepage and calculator page to be changed, got {changed}."

        home = (root / "index.html").read_text(encoding="utf-8")
        tool = (root / "sleep-calculator" / "index.html").read_text(encoding="utf-8")
        preview = (root / "preview" / "index.html").read_text(encoding="utf-8")

        assert 'name="google-site-verification"' in home, "Search Console verification tag missing."
        assert "G-ABC123" in home and "G-ABC123" in tool, "GA4 measurement ID missing."
        assert 'src="site-analytics.js"' in home, "Homepage analytics loader path is wrong."
        assert 'src="../site-analytics.js"' in tool, "Nested analytics loader path is wrong."
        assert "google-site-verification" not in tool, "Verification tag must only be in homepage."
        assert "SLEEPINGEDGE_GA4_ID" not in preview, "Noindex preview must not be tracked."
        assert "G-ABC123" not in preview, "Noindex preview must not get a GA4 ID."

        try:
            prepare_site(root, "", "not-a-measurement-id")
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid GA4 ID must be rejected.")

    print("Google integration preparation tests passed.")


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
    elif len(sys.argv) == 2:
        build_dir = Path(sys.argv[1]).resolve()
        token = os.environ.get("GSC_VERIFICATION_TOKEN", "")
        measurement = os.environ.get("GA4_MEASUREMENT_ID", "")
        count = prepare_site(build_dir, token, measurement)
        print(f"Google integration preparation complete: changed {count} production HTML page(s).")
        print(f"Search Console verification: {'configured' if token else 'not configured'}; GA4: {'consent-gated and configured' if measurement else 'not configured'}.")
    else:
        raise SystemExit("Usage: prepare-google-integrations.py <built-site-dir> | --self-test")
