from pathlib import Path
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
public = root / "public"
required = ["about", "methodology", "privacy", "terms", "contact", "affiliate-disclosure"]
for slug in required:
    page = public / slug / "index.html"
    assert page.is_file(), f"Missing production information page: {page}"
    html = page.read_text(encoding="utf-8")
    assert '<meta name="robots" content="index,follow">' in html, f"Page not indexable: {slug}"
    assert "<title>" in html and 'name="description"' in html, f"Missing SEO metadata: {slug}"
    assert "YOURDOMAIN" not in html and "YOUR_EMAIL" not in html, f"Unresolved placeholder in {slug}"

robots = (public / "robots.txt").read_text(encoding="utf-8")
assert "Disallow: /preview/" in robots, "Preview must remain excluded from crawling"
sitemap_path = public / "sitemap.xml"
xml = ET.parse(sitemap_path).getroot()
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
locs = [node.text or "" for node in xml.findall("sm:url/sm:loc", ns)]
assert locs and all("dharanesh3048388-cyber.github.io/Sleeping-Edge/" in url for url in locs)
assert not any("/preview/" in url or "YOURDOMAIN" in url for url in locs)
for slug in required:
    assert any(url.endswith(f"/{slug}/") for url in locs), f"Sitemap missing {slug}"

# Public-facing pages must never expose direct repository or issue-tracker links.
public_files = [root / "index.html", root / "src/components/Footer.tsx"] + [public / slug / "index.html" for slug in required]
for path in public_files:
    body = path.read_text(encoding="utf-8")
    assert "https://github.com/" not in body, f"Direct repository/tracker URL found in {path}"
    assert "Project repository" not in body, f"Repository promotion found in {path}"
    assert "issue tracker" not in body.lower(), f"Public issue tracker reference found in {path}"

preview_files = list((root / "static-site").rglob("*.html"))
for path in preview_files:
    body = path.read_text(encoding="utf-8")
    assert "github.com/" not in body.lower(), f"Direct GitHub link found in preview page {path}"

home = (root / "index.html").read_text(encoding="utf-8")
assert "https://dharanesh3048388-cyber.github.io/Sleeping-Edge/" in home
assert "YOURDOMAIN" not in home
print(f"Production SEO/trust readiness passed: {len(required)} information pages and {len(locs)} sitemap URLs.")
