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
- Contact: no direct support or private privacy-request channel is currently available; one must be added before commercial launch.
- Legal operator identity: not supplied; no person, company, address or email is invented.
- Repository visibility: the source repository is public and the temporary Pages address identifies the account and repository. A custom domain can change the visitor-facing address, but cannot make browser-delivered HTML, CSS or JavaScript private.

## Release gate
Do not enable ads, affiliate tracking or analytics until real account details, consent requirements, privacy disclosures and production domain have been confirmed. A successful build or this checklist does not guarantee AdSense approval, search ranking, traffic or revenue.

## Zero-paid-services policy
- Operating requirement: no paid subscriptions, paid trials that auto-convert, pay-as-you-go APIs, paid SEO platforms, paid analytics platforms or paid spam/CAPTCHA products.
- Search Console is used directly at no charge; Google confirms it is a free service. Search Console property ownership verification still requires the owner to sign in to their Google account and complete the verification step.
- Use standard Google Analytics 4 directly at no charge only after the owner creates the property and provides its Measurement ID. Keep analytics disabled until an appropriate opt-in/consent design and privacy notice are in place.
- Do not depend on OpenSEO: its published free allowance is a one-time $0.50 signup credit with no monthly refill.
- Do not depend on Windsor.ai: its published forever-free tier falls back to one data source and one account after its trial, so it does not provide a durable combined Search Console + GA4 setup.
- Contact-form service selection must remain within a genuinely $0 recurring-cost plan. Evaluate its delivery reliability, data handling, privacy terms, spam protection, rate limits and free-tier submission cap before production use. Never enable a paid upgrade or overage.
- Keep all recipient addresses, delivery keys and provider credentials out of public HTML, JavaScript and Git history. Store provider-side recipient configuration or deployment secrets only.
