/**
 * SleepingEdge Security Guardian
 * Enterprise client-side anti-tamper, anti-inspect, and source shield.
 * Designed to prevent unauthorized code extraction, source viewing,
 * devtools sniffing, and asset scraping while keeping all interactive
 * calculations, audio engines, and form controls 100% operational.
 */

export function initSecurityGuardian(): void {
  if (typeof window === 'undefined') return;

  // 1. Block Context Menu (Right Click) across the entire application
  window.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    { capture: true, passive: false }
  );

  // 2. Block Keyboard Shortcuts for Inspection and Source Extraction
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code ? e.code.toLowerCase() : '';

      // F12 DevTools
      if (key === 'f12' || code === 'f12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl) {
        // Ctrl+Shift+I / Cmd+Option+I (Inspect Elements)
        // Ctrl+Shift+J / Cmd+Option+J (Console)
        // Ctrl+Shift+C / Cmd+Option+C (Inspect Element Picker)
        // Ctrl+Shift+K (Firefox Web Console)
        if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || key === 'k')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        // Ctrl+U / Cmd+Option+U (View Page Source)
        // Ctrl+S / Cmd+S (Save Webpage to Disk)
        if (key === 'u' || key === 's') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    },
    { capture: true, passive: false }
  );

  // 3. Block Drag-and-Drop of images, media, and canvas
  window.addEventListener(
    'dragstart',
    (e: DragEvent) => {
      e.preventDefault();
      return false;
    },
    { capture: true, passive: false }
  );

  // 4. In-Console Security Warning & DevTools detection hygiene
  try {
    const warningTitle = 'color: #ef4444; font-size: 20px; font-weight: 900;';
    const warningBody = 'color: #38bdf8; font-size: 13px; font-weight: 600; line-height: 1.5;';

    const banner = () => {
      console.clear();
      console.log('%c⚠️ SECURITY PROTOCOL ACTIVE', warningTitle);
      console.log(
        '%cSleepingEdge application source code and client-side algorithms are protected under security policies. Source inspection, debugger sniffing, and code extraction are restricted.',
        warningBody
      );
    };

    banner();

    // Periodic detection to clear buffer if DevTools is opened
    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        console.clear();
        console.log('%c⚠️ SECURITY PROTOCOL ACTIVE', warningTitle);
      }
    }, 2500);
  } catch {
    // Fail-safe
  }
}
