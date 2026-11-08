/**
 * SleepingEdge - Core UI & Consent Manager
 * Handles:
 * - Theme switcher (Dark mode default with localStorage persistence)
 * - Mobile responsive drawer
 * - GDPR / CCPA Cookie Consent Manager (Accept / Reject / Custom Preferences)
 * - Plausible analytics custom event integration
 * - Accessible FAQ accordion toggles
 */

(function () {
  'use strict';

  // 1. Theme Management (Default: Dark Mode)
  const THEME_KEY = 'sleepingedge_theme';
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    btn.innerHTML = theme === 'dark' 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  }

  // 2. Cookie Consent Manager
  const CONSENT_KEY = 'sleepingedge_cookie_consent';

  function getConsent() {
    try {
      const data = localStorage.getItem(CONSENT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(preferences) {
    const payload = {
      necessary: true,
      analytics: !!preferences.analytics,
      advertising: !!preferences.advertising,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    hideCookieBanner();
    hideCookieModal();
    applyConsent(payload);
  }

  function applyConsent(consent) {
    if (consent.advertising) {
      enableAdSlots();
    }
    // Structure hook for Google-certified CMP integration
    window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: consent }));
  }

  function enableAdSlots() {
    const slots = document.querySelectorAll('.ad-slot');
    slots.forEach((slot) => {
      if (!slot.getAttribute('data-ad-loaded')) {
        slot.setAttribute('data-ad-loaded', 'true');
        // Placeholder for real AdSense / Mediavine insertion code
        const inner = slot.querySelector('.ad-inner-content');
        if (inner) {
          inner.innerHTML = '<span style="font-size:0.75rem;color:var(--text-muted)">Display Advertising Active (Scripts Ready)</span>';
        }
      }
    });
  }

  function showCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.add('show');
  }

  function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.remove('show');
  }

  function openCookiePreferences() {
    const modal = document.getElementById('cookie-modal');
    if (!modal) return;
    const current = getConsent() || { analytics: true, advertising: true };
    const analyticsCheckbox = document.getElementById('consent-analytics');
    const adCheckbox = document.getElementById('consent-advertising');
    if (analyticsCheckbox) analyticsCheckbox.checked = current.analytics;
    if (adCheckbox) adCheckbox.checked = current.advertising;
    modal.classList.add('show');
  }

  function hideCookieModal() {
    const modal = document.getElementById('cookie-modal');
    if (modal) modal.classList.remove('show');
  }

  // 3. Analytics Helper (Plausible Custom Events)
  window.trackCalcEvent = function (eventName, props) {
    if (window.plausible) {
      window.plausible(eventName, { props: props || {} });
    }
    // Fallback console log in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`[Plausible Event]: ${eventName}`, props);
    }
  };

  // 4. FAQ Accordion Logic
  function initFaqs() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const questionBtn = item.querySelector('.faq-question');
      if (questionBtn) {
        questionBtn.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          // Close other open FAQs
          faqItems.forEach((other) => other.classList.remove('open'));
          if (!isOpen) {
            item.classList.add('open');
          }
        });
      }
    });
  }

  // 5. Mobile Menu Toggle
  function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isOpen = menu.classList.contains('open');
        menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(!isOpen));
      });
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    updateThemeIcon(savedTheme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Cookie consent initialization
    const consent = getConsent();
    if (!consent) {
      showCookieBanner();
    } else {
      applyConsent(consent);
    }

    const btnAccept = document.getElementById('btn-cookie-accept');
    if (btnAccept) {
      btnAccept.addEventListener('click', () => saveConsent({ analytics: true, advertising: true }));
    }

    const btnReject = document.getElementById('btn-cookie-reject');
    if (btnReject) {
      btnReject.addEventListener('click', () => saveConsent({ analytics: false, advertising: false }));
    }

    const btnManage = document.getElementById('btn-cookie-manage');
    if (btnManage) {
      btnManage.addEventListener('click', () => {
        hideCookieBanner();
        openCookiePreferences();
      });
    }

    const btnSavePrefs = document.getElementById('btn-cookie-save-prefs');
    if (btnSavePrefs) {
      btnSavePrefs.addEventListener('click', () => {
        const analyticsCheckbox = document.getElementById('consent-analytics');
        const adCheckbox = document.getElementById('consent-advertising');
        saveConsent({
          analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
          advertising: adCheckbox ? adCheckbox.checked : false
        });
      });
    }

    const btnCloseModal = document.getElementById('btn-cookie-close-modal');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', hideCookieModal);
    }

    // Expose openCookiePreferences globally for footer links
    window.openCookiePreferences = openCookiePreferences;

    // Mobile nav & FAQs
    initMobileMenu();
    initFaqs();
  });
})();
