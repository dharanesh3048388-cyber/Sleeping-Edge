from pathlib import Path
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
public = root / "public"
trust_pages = ["about", "methodology", "privacy", "terms", "contact", "affiliate-disclosure"]
sound_pages = [
    "sleep-sounds", "white-noise-for-sleep", "pink-noise-for-sleep",
    "brown-noise-for-sleep", "rain-sounds-for-sleep",
    "ocean-sounds-for-sleep", "wind-sounds-for-sleep"
]
required = trust_pages + sound_pages
for slug in required:
    page = public / slug / "index.html"
    assert page.is_file(), f"Missing production information page: {page}"
    html = page.read_text(encoding="utf-8")
    assert '<meta name="robots" content="index,follow">' in html, f"Page not indexable: {slug}"
    assert "<title>" in html and 'name="description"' in html, f"Missing SEO metadata: {slug}"
    assert "YOURDOMAIN" not in html and "YOUR_EMAIL" not in html, f"Unresolved placeholder in {slug}"
    assert 'rel="canonical"' in html, f"Missing canonical URL: {slug}"

robots = (public / "robots.txt").read_text(encoding="utf-8")
# Preview HTML carries noindex,nofollow. Crawlers must be allowed to fetch it
# so they can actually discover and honor that page-level directive.
assert "Disallow: /preview/" not in robots, "Do not block crawlers from reading preview noindex tags"
sitemap_path = public / "sitemap.xml"
xml = ET.parse(sitemap_path).getroot()
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
locs = [node.text or "" for node in xml.findall("sm:url/sm:loc", ns)]
assert locs and all("dharanesh3048388-cyber.github.io/Sleeping-Edge/" in url for url in locs)
assert not any("/preview/" in url or "YOURDOMAIN" in url for url in locs)
for slug in required:
    assert any(url.endswith(f"/{slug}/") for url in locs), f"Sitemap missing {slug}"

# Search landing pages must route directly to the exact existing sound preset.
sound_targets = {
    "white-noise-for-sleep": "white_noise",
    "pink-noise-for-sleep": "pink_noise",
    "brown-noise-for-sleep": "brown_noise",
    "rain-sounds-for-sleep": "rain_skylight",
    "ocean-sounds-for-sleep": "deep_ocean",
    "wind-sounds-for-sleep": "mountain_wind",
}
for slug, preset in sound_targets.items():
    page = (public / slug / "index.html").read_text(encoding="utf-8")
    target = f'href="../?sound={preset}#ambient-sounds"'
    assert target in page, f"Sound landing page does not deep-link to {preset}: {slug}"
    assert '<meta name="robots" content="index,follow">' in page
    assert "no autoplay" in page.lower() or "not play until you press play" in page.lower(), f"Missing autoplay disclosure: {slug}"
hub = (public / "sleep-sounds" / "index.html").read_text(encoding="utf-8")
for slug in sound_targets:
    assert f'../{slug}/' in hub, f"Sound hub does not link to {slug}"

# The static site is deployed only as a noindex preview below /preview/.
# Its own nested robots.txt is not the host's crawler policy, and its old
# standalone sitemap used an unresolved custom-domain placeholder.
assert not (root / "static-site" / "robots.txt").exists(), "Do not ship a misleading nested preview robots.txt"
assert not (root / "static-site" / "sitemap.xml").exists(), "Do not ship a placeholder preview sitemap"

# Public-facing pages must never expose direct repository or issue-tracker links.
public_files = [root / "index.html", root / "src/components/Footer.tsx"] + [public / slug / "index.html" for slug in required] + list((root / "static-site").rglob("*.html"))
for path in public_files:
    body = path.read_text(encoding="utf-8")
    assert "https://github.com/" not in body, f"Direct repository/tracker URL found in {path}"
    assert "Project repository" not in body, f"Repository promotion found in {path}"
    assert "issue tracker" not in body.lower(), f"Public issue tracker reference found in {path}"
    assert "github.com/" not in body.lower(), f"Clickable GitHub destination found in {path}"

preview_files = list((root / "static-site").rglob("*.html"))
for path in preview_files:
    body = path.read_text(encoding="utf-8")
    assert "github.com/" not in body.lower(), f"Direct GitHub link found in preview page {path}"

readiness = (root / "MONETIZATION_READINESS.md").read_text(encoding="utf-8")
assert "no direct support or private privacy-request channel is currently available" in readiness.lower()
assert "public github issue tracker is provided" not in readiness.lower()

home = (root / "index.html").read_text(encoding="utf-8")
assert "https://dharanesh3048388-cyber.github.io/Sleeping-Edge/" in home
assert "YOURDOMAIN" not in home
print(f"Production SEO/trust readiness passed: {len(trust_pages)} trust pages, {len(sound_pages)} sound landing pages and {len(locs)} sitemap URLs.")
