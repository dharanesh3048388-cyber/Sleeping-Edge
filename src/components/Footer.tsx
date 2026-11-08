import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Sticky Back to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-35 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/95 hover:bg-slate-100 border border-slate-300 text-slate-800 hover:text-slate-950 shadow-xl backdrop-blur-xl dark:bg-[#0b111e]/90 dark:hover:bg-slate-900 dark:border-white/20 dark:text-slate-200 dark:hover:text-white dark:shadow-2xl transition-all duration-300 cursor-pointer min-h-[38px] ${
          isVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto ring-1 ring-sky-500/30 dark:ring-emerald-500/20'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="text-xs font-semibold">Back to top</span>
        <ArrowUp className="w-3.5 h-3.5 text-sky-600 dark:text-emerald-400" />
      </button>

      <footer className="w-full border-t border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#040609]/90 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8 relative z-10 text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Privacy Statement */}
          <div className="text-center md:text-left space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              Sleeping<span className="text-sky-600 dark:text-emerald-400">Edge</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Engineered for natural sleep cycle alignment and caffeine timing. Zero tracking cookies, zero account walls, 100% private in-browser computation.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[11px] text-sky-700 dark:text-emerald-400 font-mono pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local Browser Privacy Guaranteed</span>
            </div>
          </div>

          {/* Scientific Citations */}
          <div className="text-center md:text-right space-y-1">
            <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
              AASM · NSF · NASA Fatigue Countermeasures
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Formulas derived from classic 90-min NREM/REM cycle medicine and hepatic clearance rates.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
