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

home = (root / "index.html").read_text(encoding="utf-8")
assert "https://dharanesh3048388-cyber.github.io/Sleeping-Edge/" in home
assert "YOURDOMAIN" not in home
print(f"Production SEO/trust readiness passed: {len(required)} information pages and {len(locs)} sitemap URLs.")
