import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const informationLinks = [
  { label: 'About', path: 'about/' },
  { label: 'Methodology', path: 'methodology/' },
  { label: 'Privacy', path: 'privacy/' },
  { label: 'Terms', path: 'terms/' },
  { label: 'Advertising & affiliates', path: 'affiliate-disclosure/' },
  { label: 'Contact', path: 'contact/' },
];

export const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 250);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll back to top"
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-35 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/95 hover:bg-slate-100 border border-slate-300 text-slate-800 hover:text-slate-950 shadow-xl backdrop-blur-xl dark:bg-[#0b111e]/90 dark:hover:bg-slate-900 dark:border-white/20 dark:text-slate-200 dark:hover:text-white dark:shadow-2xl transition-all duration-300 cursor-pointer min-h-[38px] ${isVisible ? 'opacity-100 translate-y-0 pointer-events-auto ring-1 ring-sky-500/30 dark:ring-emerald-500/20' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <span className="text-xs font-semibold">Back to top</span>
        <ArrowUp className="w-3.5 h-3.5 text-sky-600 dark:text-emerald-400" />
      </button>

      <footer className="w-full border-t border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#040609]/90 backdrop-blur-md py-10 px-4 sm:px-6 lg:px-8 relative z-10 text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-5xl mx-auto space-y-7">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-1.5 max-w-md">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                Sleeping<span className="text-sky-600 dark:text-emerald-400">Edge</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Free browser-based sleep-planning tools. Calculator inputs are processed in your browser; the site also requests fonts from Google Fonts. No account is required.
              </p>
            </div>
            <div className="max-w-md">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sleep timing and caffeine outputs are estimates based on the inputs and assumptions shown. They do not measure sleep stages or provide medical advice.
              </p>            </div>
          </div>
          <nav aria-label="Legal and information" className="flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-200/70 dark:border-white/10 pt-5">
            {informationLinks.map((item) => (
              <a key={item.path} href={`${import.meta.env.BASE_URL}${item.path}`} className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <p className="text-[11px] text-slate-500">© {new Date().getFullYear()} SleepingEdge. Informational tools, not medical care.</p>
        </div>
      </footer>
    </>
  );
};
