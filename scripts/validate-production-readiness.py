from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
public = root / "public"
base_url = "https://dharanesh3048388-cyber.github.io/Sleeping-Edge/"

trust_pages = ["about", "methodology", "privacy", "terms", "contact", "affiliate-disclosure"]
sound_pages = [
    "sleep-sounds", "white-noise-for-sleep", "pink-noise-for-sleep",
    "brown-noise-for-sleep", "rain-sounds-for-sleep",
    "ocean-sounds-for-sleep", "wind-sounds-for-sleep"
]
tool_pages = [
    "sleep-tools", "sleep-calculator", "nap-calculator",
    "caffeine-calculator", "sleep-debt-calculator", "sleep-stages"
]
required = trust_pages + sound_pages + tool_pages

titles = {}
descriptions = {}
canonicals = {}
for slug in required:
    page = public / slug / "index.html"
    assert page.is_file(), f"Missing production page: {page}"
    html = page.read_text(encoding="utf-8")

    title_match = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    description_match = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', html, re.I)
    canonical_match = re.search(r'<link[^>]*rel="canonical"[^>]*href="([^"]*)"', html, re.I)
    robots_match = re.search(r'<meta\s+name="robots"\s+content="([^"]*)"', html, re.I)
    h1_count = len(re.findall(r"<h1(?:\s[^>]*)?>", html, re.I))

    assert title_match and description_match, f"Missing title/description: {slug}"
    title = title_match.group(1).strip()
    description = description_match.group(1).strip()
    assert 20 <= len(title) <= 70, f"Title length outside guardrail ({len(title)}): {slug}"
    assert 70 <= len(description) <= 180, f"Description length outside guardrail ({len(description)}): {slug}"
    assert robots_match and robots_match.group(1) == "index,follow", f"Page not indexable: {slug}"
    assert canonical_match and canonical_match.group(1) == f"{base_url}{slug}/", f"Canonical mismatch: {slug}"
    assert h1_count == 1, f"Expected exactly one H1 in {slug}; found {h1_count}"
    assert "YOURDOMAIN" not in html and "YOUR_EMAIL" not in html, f"Unresolved placeholder in {slug}"

    titles[slug] = title
    descriptions[slug] = description
    canonicals[slug] = canonical_match.group(1)

    if slug in tool_pages:
        assert re.search(r'<meta\s+property="og:title"', html), f"Missing Open Graph title: {slug}"
        assert re.search(r'<meta\s+property="og:description"', html), f"Missing Open Graph description: {slug}"
        assert re.search(r'<meta\s+name="twitter:card"', html), f"Missing Twitter card metadata: {slug}"
        scripts = re.findall(r'<script\s+type="application/ld\+json">(.*?)</script>', html, re.I | re.S)
        assert scripts, f"Missing JSON-LD: {slug}"
        parsed = [json.loads(script) for script in scripts]
        graph_types = {
            item.get("@type")
            for data in parsed
            for item in (data.get("@graph", []) if isinstance(data, dict) else [])
            if isinstance(item, dict)
        }
        assert "WebPage" in graph_types and "BreadcrumbList" in graph_types, f"Missing WebPage/BreadcrumbList JSON-LD: {slug}"
        assert 'aria-label="Breadcrumb"' in html, f"Missing visible breadcrumb navigation: {slug}"

assert len(set(titles.values())) == len(titles), "Duplicate SEO title detected"
assert len(set(descriptions.values())) == len(descriptions), "Duplicate meta description detected"
assert len(set(canonicals.values())) == len(canonicals), "Duplicate canonical URL detected"

robots = (public / "robots.txt").read_text(encoding="utf-8")
# Preview HTML carries noindex,nofollow. Crawlers must be allowed to fetch it
# so they can actually discover and honor that page-level directive.
assert "Disallow: /preview/" not in robots, "Do not block crawlers from reading preview noindex tags"
assert f"Sitemap: {base_url}sitemap.xml" in robots, "robots.txt must point to the production sitemap"

sitemap_path = public / "sitemap.xml"
xml = ET.parse(sitemap_path).getroot()
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
locs = [node.text or "" for node in xml.findall("sm:url/sm:loc", ns)]
assert len(locs) == len(set(locs)), "Duplicate URL in sitemap"
assert locs and all(url.startswith(base_url) for url in locs), "Sitemap contains an off-site URL"
assert not any("/preview/" in url or "YOURDOMAIN" in url for url in locs), "Preview/placeholder URL in sitemap"
for slug in required:
    assert f"{base_url}{slug}/" in locs, f"Sitemap missing {slug}"

# Calculator landing pages must lead directly to their matching, existing app section.
tool_targets = {
    "sleep-calculator": "../#sleep-calculator",
    "nap-calculator": "../#nap-optimizer",
    "caffeine-calculator": "../#caffeine-calculator",
    "sleep-debt-calculator": "../#sleep-debt",
    "sleep-stages": "../#sleep-stages",
}
for slug, target in tool_targets.items():
    html = (public / slug / "index.html").read_text(encoding="utf-8")
    assert f'href="{target}"' in html, f"Landing page does not deep-link to the matching app section: {slug}"
    assert "../sleep-tools/" in html, f"Landing page does not link back to the tool directory: {slug}"

hub = (public / "sleep-tools" / "index.html").read_text(encoding="utf-8")
for slug in tool_targets:
    assert f'href="../{slug}/"' in hub, f"Tool directory is missing {slug}"
assert 'href="../sleep-sounds/"' in hub, "Tool directory is missing sleep sounds library"

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
    assert "no autoplay" in page.lower() or "not play until you press play" in page.lower(), f"Missing autoplay disclosure: {slug}"
sound_hub = (public / "sleep-sounds" / "index.html").read_text(encoding="utf-8")
for slug in sound_targets:
    assert f'../{slug}/' in sound_hub, f"Sound hub does not link to {slug}"
extra_presets = ["arctic_wind", "solar_storm", "celestial_drone", "binaural_delta"]
for preset in extra_presets:
    assert f'href="../?sound={preset}#ambient-sounds"' in sound_hub, f"Sound hub does not expose preset {preset}"

# The static site is deployed only as a noindex preview below /preview/.
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

readiness = (root / "MONETIZATION_READINESS.md").read_text(encoding="utf-8")
assert "no direct support or private privacy-request channel is currently available" in readiness.lower()
assert "public github issue tracker is provided" not in readiness.lower()

home = (root / "index.html").read_text(encoding="utf-8")
assert f'"https://dharanesh3048388-cyber.github.io/Sleeping-Edge/"' in home
assert "YOURDOMAIN" not in home
# Sleep evidence page must stay accurate about provenance and its lack of clinician review.
methodology = (public / "methodology" / "index.html").read_text(encoding="utf-8")
assert "not currently clinician-reviewed" in methodology.lower(), "Do not imply clinical review without a verified reviewer"
for source in [
    "https://www.cdc.gov/sleep/about/index.html",
    "https://aasm.org/resources/pdf/pressroom/adult-sleep-duration-consensus.pdf",
    "https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep",
    "https://pubmed.ncbi.nlm.nih.gov/36870101/",
]:
    assert source in methodology, f"Missing authoritative sleep reference: {source}"
assert "80–100 minutes" in methodology or "80-100 minutes" in methodology or "80–100" in methodology, "Sleep-cycle range must remain sourced"
assert "not a universal biological constant" in methodology, "90-minute setting must be described as an assumption"

print(f"Production SEO/trust validation passed: {len(trust_pages)} trust pages, {len(sound_pages)} sound pages, {len(tool_pages)} tool pages and {len(locs)} sitemap URLs.")
