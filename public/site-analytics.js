/* Optional SleepingEdge GA4 integration.
 * Google Analytics is not loaded until a visitor actively accepts.
 * No calculator values, sleep schedules, caffeine inputs or result contents
 * are read or sent. Only the standard page-view event is configured.
 */
(() => {
  'use strict';

  const measurementId = window.SLEEPINGEDGE_GA4_ID;
  if (typeof measurementId !== 'string' || !/^G-[A-Z0-9]+$/.test(measurementId)) return;

  const consentKey = 'sleepingedge_analytics_consent_v1';
  const script = document.currentScript;
  const rootPath = script?.src ? new URL('.', script.src).pathname : '/';
  const privacyLink = Array.from(document.querySelectorAll('a')).find((link) =>
    link.textContent.trim().toLowerCase() === 'privacy'
  );
  const privacyUrl = privacyLink?.href || rootPath + 'privacy/';

  let loaded = false;
  let banner = null;

  function getChoice() {
    try {
      const value = localStorage.getItem(consentKey);
      return value === 'accepted' || value === 'rejected' ? value : null;
    } catch {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      localStorage.setItem(consentKey, value);
    } catch {
      // Continue for this page view even when browser storage is disabled.
    }
  }

  function updateGoogleConsent(value) {
    if (typeof window.gtag !== 'function') return;
    const state = value === 'accepted' ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      analytics_storage: state,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function loadAnalyticsAfterConsent() {
    if (loaded) {
      updateGoogleConsent('accepted');
      return;
    }
    loaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    // Basic consent mode: Google tags are not downloaded before opt-in.
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    tag.onerror = () => {
      loaded = false;
    };
    document.head.appendChild(tag);
  }

  function removeBanner() {
    if (banner) {
      banner.remove();
      banner = null;
    }
  }

  function applyChoice(choice) {
    saveChoice(choice);
    if (choice === 'accepted') {
      loadAnalyticsAfterConsent();
    } else if (loaded) {
      updateGoogleConsent('rejected');
    }
    removeBanner();
  }

  function makeButton(label, choice, primary) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = [
      'min-height:40px',
      'padding:9px 14px',
      'border-radius:10px',
      'border:1px solid #64748b',
      'background:' + (primary ? '#065f46' : '#1e293b'),
      'color:#fff',
      'font:600 13px system-ui,sans-serif',
      'cursor:pointer'
    ].join(';');
    button.addEventListener('click', () => applyChoice(choice));
    return button;
  }

  function openPreferences() {
    removeBanner();

    banner = document.createElement('section');
    banner.id = 'sleepingedge-analytics-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'sleepingedge-consent-title');
    banner.style.cssText = [
      'position:fixed',
      'z-index:9999',
      'left:16px',
      'right:16px',
      'bottom:16px',
      'max-width:760px',
      'margin:0 auto',
      'padding:18px',
      'border:1px solid rgba(148,163,184,.45)',
      'border-radius:16px',
      'background:#101827',
      'color:#f8fafc',
      'box-shadow:0 16px 48px rgba(0,0,0,.35)',
      'font:14px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
    ].join(';');

    const heading = document.createElement('strong');
    heading.id = 'sleepingedge-consent-title';
    heading.textContent = 'Your privacy choices';
    heading.style.cssText = 'display:block;font-size:15px;margin-bottom:6px';

    const description = document.createElement('p');
    description.textContent = 'With your permission, SleepingEdge uses Google Analytics to count page visits and understand which pages are useful. Analytics is optional and is not loaded unless you accept. Calculator inputs and results are never sent. Advertising measurement and personalised advertising remain disabled.';
    description.style.cssText = 'margin:0 0 10px;color:#d1d5db';

    const privacy = document.createElement('a');
    privacy.href = privacyUrl;
    privacy.textContent = 'Read the Privacy Policy';
    privacy.rel = 'noopener';
    privacy.style.cssText = 'color:#a7f3d0;text-decoration:underline;text-underline-offset:3px';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:12px';

    actions.append(
      makeButton('Accept optional analytics', 'accepted', true),
      makeButton('Reject optional analytics', 'rejected', false)
    );

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.style.cssText = 'min-height:40px;padding:8px 14px;border-radius:10px;border:1px solid #64748b;background:transparent;color:#e2e8f0;font:600 13px system-ui;cursor:pointer';
    close.addEventListener('click', removeBanner);
    actions.append(close);

    banner.append(heading, description, privacy, actions);
    document.body.appendChild(banner);
  }

  function addPreferencesControl() {
    const footer = document.querySelector('footer');
    if (!footer || document.getElementById('sleepingedge-privacy-preferences')) return;

    const button = document.createElement('button');
    button.id = 'sleepingedge-privacy-preferences';
    button.type = 'button';
    button.textContent = 'Analytics preferences';
    button.style.cssText = 'margin:12px 0 0;padding:4px 0;border:0;background:none;color:inherit;text-decoration:underline;text-underline-offset:3px;font:inherit;cursor:pointer';
    button.addEventListener('click', openPreferences);
    footer.appendChild(button);
  }

  const choice = getChoice();
  if (choice === 'accepted') {
    loadAnalyticsAfterConsent();
  } else if (choice === null) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', openPreferences, { once: true });
    } else {
      openPreferences();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addPreferencesControl, { once: true });
  } else {
    addPreferencesControl();
  }
})();
