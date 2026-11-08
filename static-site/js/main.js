(function () {
  'use strict';
  const THEME_KEY = 'sleepingedge_theme';
  function applyTheme(theme) {
    const selected = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', selected);
    const button = document.getElementById('theme-toggle-btn');
    if (button) {
      button.setAttribute('aria-label', 'Switch to ' + (selected === 'dark' ? 'light' : 'dark') + ' mode');
      button.innerHTML = selected === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
  }
  function init() {
    let savedTheme = 'dark';
    try { savedTheme = localStorage.getItem(THEME_KEY) || 'dark'; } catch (_) {}
    applyTheme(savedTheme);
    const themeButton = document.getElementById('theme-toggle-btn');
    if (themeButton) themeButton.addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
    });
    const menuButton = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (menuButton && menu) {
      menuButton.addEventListener('click', function () {
        const open = menu.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      });
      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menu.classList.remove('open');
          menuButton.setAttribute('aria-expanded', 'false');
          menuButton.setAttribute('aria-label', 'Open navigation menu');
        });
      });
    }
    document.querySelectorAll('.faq-question').forEach(function (button, index) {
      const answer = button.nextElementSibling;
      if (answer && !answer.id) answer.id = 'faq-answer-' + (index + 1);
      if (answer) button.setAttribute('aria-controls', answer.id);
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', function () {
        const item = button.closest('.faq-item');
        const opening = item ? !item.classList.contains('open') : false;
        document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          openItem.classList.remove('open');
          const openButton = openItem.querySelector('.faq-question');
          if (openButton) openButton.setAttribute('aria-expanded', 'false');
        });
        if (item && opening) { item.classList.add('open'); button.setAttribute('aria-expanded', 'true'); }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
