# SleepingEdge — monetization readiness checklist

This repository change prepares the current GitHub Pages production app for a global English-language audience and an eventual advertising + affiliate model. It does not activate monetisation.

## Implemented in this foundation PR
- Production crawl rules and sitemap for the root React app and its trust pages.
- Public About, Methodology, Privacy, Terms, Contact and Advertising/Affiliate Disclosure pages.
- Footer navigation to those pages.
- A CI guard for production metadata, page presence, sitemap validity and placeholder/domain leakage.
- No fabricated publisher, analytics, affiliate, contact or legal identity values.

## Owner actions before commercial launch
1. **Domain:** choose and purchase a brand-appropriate domain; configure DNS, HTTPS and GitHub Pages custom domain. Then update canonical URLs, Open Graph URLs, robots.txt and sitemap.xml together and verify redirects/Search Console coverage.
2. **Publisher:** create the actual AdSense publisher account and add the verified site. Do not paste IDs into source control. Configure the official script only after approval and policy review.
3. **Consent:** choose a Google-certified CMP appropriate to the target regions. Configure consent signals and regional behaviour before personalised advertising or non-essential tracking. Do not invent a consent banner or claim consent compliance without a working vendor configuration.
4. **Analytics:** optionally create GA4 and Search Console properties. Add verified measurement IDs through protected deployment secrets/configuration, not committed source. Gate non-essential analytics on the chosen consent approach and never transmit raw sleep/caffeine inputs or calculator results.
5. **Contact/legal:** provide a real monitored contact channel and the correct operator/business details and jurisdiction. Have privacy, terms, advertising disclosures and any required cookie notices reviewed for the actual operating entity and countries served.
6. **Affiliates:** apply to relevant programmes; use real approved tracking IDs only; disclose qualifying links close to recommendations; maintain editorial independence and check programme rules.
7. **Content quality:** publish original, useful, reviewed sleep education with named, qualified reviewers only when their consent and credentials are verified. Cite primary/authoritative sources and keep pages current. Avoid mass-produced thin SEO pages.
8. **Performance/accessibility:** run mobile Core Web Vitals, keyboard/screen-reader, contrast, privacy and cross-browser checks on the deployed custom-domain build. Keep ads away from calculator controls and reserve layout space to avoid layout shifts.

## Current configuration truth
- Temporary host: https://dharanesh3048388-cyber.github.io/Sleeping-Edge/.
- Custom domain: not supplied; no custom domain is configured by this change.
- AdSense: not configured; no ad script or publisher ID is included.
- Affiliate IDs: not configured; no tracked affiliate links are included.
- Analytics: no analytics ID or analytics script is added by this change.
- Contact: public GitHub issue tracker is provided for non-sensitive feedback only; it is not a private support channel.
- Legal operator identity: not supplied; no person, company, address or email is invented.

## Release gate
Do not enable ads, affiliate tracking or analytics until real account details, consent requirements, privacy disclosures and production domain have been confirmed. A successful build or this checklist does not guarantee AdSense approval, search ranking, traffic or revenue.
