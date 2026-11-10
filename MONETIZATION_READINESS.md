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
4. **Google measurement:** create Google Search Console and a standard Google Analytics 4 property directly with Google at no charge. Search Console needs owner verification; use the URL-prefix property and add the verification token as the GitHub Actions secret `GSC_VERIFICATION_TOKEN`. Add the GA4 web-stream ID as repository variable `GA4_MEASUREMENT_ID`. Deployment injects these only at build time. GA4 is basic-consent-gated: its tag does not load until a visitor accepts optional analytics. Never transmit raw sleep/caffeine inputs or calculator results.
5. **Contact/legal:** a public Contact page now opens the visitor's own mail application with a pre-filled email to the owner-supplied Outlook address. No contact form, form processor, message database or paid spam product is used. The operator's legal identity, business address and jurisdiction still need to be provided and the legal pages reviewed for the actual operating entity and countries served.
6. **Affiliates:** apply to relevant programmes; use real approved tracking IDs only; disclose qualifying links close to recommendations; maintain editorial independence and check programme rules.
7. **Content quality:** publish original, useful, reviewed sleep education with named, qualified reviewers only when their consent and credentials are verified. Cite primary/authoritative sources and keep pages current. Avoid mass-produced thin SEO pages.
8. **Performance/accessibility:** run mobile Core Web Vitals, keyboard/screen-reader, contrast, privacy and cross-browser checks on the deployed custom-domain build. Keep ads away from calculator controls and reserve layout space to avoid layout shifts.

## Current configuration truth
- Temporary host: https://dharanesh3048388-cyber.github.io/Sleeping-Edge/.
- Custom domain: not supplied; no custom domain is configured by this change.
- AdSense: not configured; no ad script or publisher ID is included.
- Affiliate IDs: not configured; no tracked affiliate links are included.
- Analytics: optional GA4 integration code is present but inactive until a real `GA4_MEASUREMENT_ID` is configured. Even when configured, the Google tag loads only after visitor opt-in.
- Contact: direct email link configured to the owner-supplied Outlook mailbox; mail is sent by the visitor through their own email provider, not through a website form.
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
- Contact is intentionally handled through a visitor-initiated mailto link. This avoids a website form endpoint, server-side message database, form subscription, CAPTCHA bill and automated form-spam surface. It depends on the visitor having an email application configured.
- The public contact mailbox is intentionally displayed because the owner supplied it for public contact. No email password, mailbox login, OAuth token or delivery credential is stored in the website or GitHub repository.

## Free Google measurement setup
- Google Search Console is free. Create a URL-prefix property for `https://dharanesh3048388-cyber.github.io/Sleeping-Edge/`, choose HTML tag verification and copy only the `content` value from Google's meta tag. Add it in GitHub repository Settings → Secrets and variables → Actions → New repository secret, named `GSC_VERIFICATION_TOKEN`.
- Create one Google Analytics 4 property and Web data stream for the same site. Copy the `G-...` Measurement ID. Add it under Settings → Secrets and variables → Actions → Variables → New repository variable, named `GA4_MEASUREMENT_ID`.
- Once values are present, the next deployment injects the Search Console verification meta tag into the homepage and the optional GA4 loader into production HTML. No tag is added to the noindex preview. GA4 does not load before visitor opt-in.
- The owner must sign in to Search Console once, click Verify, and submit `https://dharanesh3048388-cyber.github.io/Sleeping-Edge/sitemap.xml` in the Sitemaps report. Google account ownership and property access cannot be completed through this GitHub integration.
- The current sitemap and robots.txt already point to each other correctly. Sitemap submission is a discovery hint, not a ranking or indexing guarantee.
