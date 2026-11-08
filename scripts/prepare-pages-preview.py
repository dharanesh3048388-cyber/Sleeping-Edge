#!/usr/bin/env python3
"""Prepare the isolated static-site preview for GitHub Pages project hosting."""
from pathlib import Path
import re
import sys

PREFIX = "/Sleeping-Edge/preview"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: prepare-pages-preview.py <preview-directory>")

    root = Path(sys.argv[1]).resolve()
    if not root.is_dir():
        raise SystemExit(f"Preview directory does not exist: {root}")

    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".html", ".css", ".js"}:
            continue

        content = path.read_text(encoding="utf-8")
        content = re.sub(
            r"""(?i)(href|src|action)=(["'])/(?!/|Sleeping-Edge/preview/)""",
            lambda match: f"{match.group(1)}={match.group(2)}{PREFIX}/",
            content,
        )
        content = re.sub(
            r"""url\((["']?)/(?!/|Sleeping-Edge/preview/)""",
            lambda match: f"url({match.group(1)}{PREFIX}/",
            content,
        )

        if path.suffix.lower() == ".html" and not re.search(
            r"""<meta\b[^>]*name=["']robots["']""", content, flags=re.I
        ):
            content = re.sub(
                r"(?i)</head>",
                '  <meta name="robots" content="noindex,nofollow">\n</head>',
                content,
                count=1,
            )

        path.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    main()
