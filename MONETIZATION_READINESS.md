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
4. **Google measurement:** create Google Search Console and a standard Google Analytics 4 property directly with Google at no charge. Search Console needs owner verification; use the URL-prefix property and add the verification token as the GitHub Actions secret `GSC_VERIFICATION_TOKEN`. Add the GA4 web-stream ID as repository variable `GA4_MEASUREMENT_ID`. The deployment injects these only at build time. GA4 is basic-consent-gated: its tag does not load until a visitor accepts optional analytics. Do not transmit calculator inputs or results.
5. **Contact/legal:** provide a real monitored contact channel and the correct operator/business details and jurisdiction. Have privacy, terms, advertising disclosures and any required cookie notices reviewed for the actual operating entity and countries served.
6. **Affiliates:** apply to relevant programmes; use real approved tracking IDs only; disclose qualifying links close to recommendations; maintain editorial independence and check programme rules.
7. **Content quality:** publish original, useful, reviewed sleep education with named, qualified reviewers only when their consent and credentials are verified. Cite primary/authoritative sources and keep pages current. Avoid mass-produced thin SEO pages.
8. **Performance/accessibility:** run mobile Core Web Vitals, keyboard/screen-reader, contrast, privacy and cross-browser checks on the deployed custom-domain build. Keep ads away from calculator controls and reserve layout space to avoid layout shifts.

## Current configuration truth
- Temporary host: https://dharanesh3048388-cyber.github.io/Sleeping-Edge/.
- Custom domain: not supplied; no custom domain is configured by this change.
- AdSense: not configured; no ad script or publisher ID is included.
- Affiliate IDs: not configured; no tracked affiliate links are included.
- Analytics: optional GA4 integration code is present but inactive until a real `GA4_MEASUREMENT_ID` is configured. Even when configured, the Google tag loads only after visitor opt-in.
- Contact: owner-supplied public email link; visitor sends via their own email application, not a site form.
- Legal operator identity: not supplied; no person, company, address or email is invented.
- Repository visibility: the source repository is public and the temporary Pages address identifies the account and repository. A custom domain can change the visitor-facing address, but cannot make browser-delivered HTML, CSS or JavaScript private.

## Free Google measurement setup\n- Google Search Console is free. Create a URL-prefix property for `https://dharanesh3048388-cyber.github.io/Sleeping-Edge/`, choose HTML tag verification and copy only the `content` value from Google's meta tag. Add it in GitHub repository Settings → Secrets and variables → Actions → New repository secret, named `GSC_VERIFICATION_TOKEN`.\n- Create one Google Analytics 4 property and Web data stream for the same site. Copy the `G-...` Measurement ID. Add it under Settings → Secrets and variables → Actions → Variables → New repository variable, named `GA4_MEASUREMENT_ID`. A measurement ID is not a password, but it is kept out of committed source for clean configuration management.\n- Once the values are present, the next deployment injects the Search Console verification meta tag into the homepage and the optional GA4 loader into production HTML. No tag is added to the noindex preview.\n- The owner must sign in to Search Console once, click Verify, and submit `https://dharanesh3048388-cyber.github.io/Sleeping-Edge/sitemap.xml` in the Sitemaps report. Google account ownership and property access cannot be completed from this GitHub integration.\n- The current sitemap and robots.txt already point to each other correctly. Submission is a discovery hint, not a ranking or indexing guarantee.\n\n## Release gate
Do not enable ads, affiliate tracking or analytics until real account details, consent requirements, privacy disclosures and production domain have been confirmed. A successful build or this checklist does not guarantee AdSense approval, search ranking, traffic or revenue.
