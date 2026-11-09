import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Volume2, VolumeX, SlidersHorizontal, Coffee, Bed, Clock, BatteryCharging, Brain } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onOpenSettings: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  isAudioPlaying,
  onToggleAudio,
  onOpenSettings,
  activeSection,
  onNavigate,
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeight = () => {
      setHeaderHeight(el.offsetHeight);
    };

    updateHeight();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => updateHeight());
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, []);

  const navItems = [
    { id: 'calculator', label: 'Sleep Calculator', icon: Bed, hash: '#sleep-calculator' },
    { id: 'caffeine', label: 'Caffeine Calculator', icon: Coffee, hash: '#caffeine-calculator' },
    { id: 'naps', label: 'Nap Optimizer', icon: Clock, hash: '#nap-optimizer' },
    { id: 'recovery', label: 'Sleep Debt', icon: BatteryCharging, hash: '#sleep-debt' },
    { id: 'science', label: 'Sleep Stages', icon: Brain, hash: '#sleep-stages' }
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#07090e]/90 border-b border-slate-200/80 dark:border-white/10 transition-colors duration-300 shadow-sm dark:shadow-none"
      >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark (Tap to refresh page) */}
        <a
          href={import.meta.env.BASE_URL}
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
          title="Refresh SleepingEdge"
          aria-label="SleepingEdge - Tap to refresh page"
          className="group flex items-center text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-emerald-400 rounded-md cursor-pointer select-none"
        >
          <span className="tracking-tight text-slate-900 dark:text-white">
            Sleeping<span className="text-sky-600 dark:text-emerald-400 font-semibold">Edge</span>
          </span>
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium whitespace-nowrap shrink-0">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.hash}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`transition-colors py-1 cursor-pointer font-medium ${
                  isActive
                    ? 'text-sky-700 dark:text-emerald-400 border-b-2 border-sky-600 dark:border-emerald-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Ambient Audio, Settings, Theme Toggle) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Ambient Noise Player Toggle */}
          <button
            type="button"
            onClick={onToggleAudio}
            title={isAudioPlaying ? 'Mute ambient noise player' : 'Open ambient noise player & soundscapes'}
            aria-label={isAudioPlaying ? 'Mute ambient noise player' : 'Open ambient noise soundscapes'}
            className={`relative flex items-center justify-center h-10 px-2.5 sm:px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              isAudioPlaying
                ? 'bg-sky-500/15 text-sky-700 border-sky-400 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/50 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300/80 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {isAudioPlaying ? (
              <Volume2 className="w-4 h-4 text-sky-600 dark:text-emerald-400 animate-pulse shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0" />
            )}
            <span className="hidden md:inline font-medium ml-1.5">
              {isAudioPlaying ? 'Noise Active' : 'Ambient Noise'}
            </span>
            {isAudioPlaying && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 dark:bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 dark:bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Preferences / Custom Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Adjust cycle length and sleep onset latency"
            aria-label="Adjust sleep parameters"
            className="flex items-center justify-center h-10 w-10 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 dark:text-slate-300 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
          </button>

          {/* Theme Toggle: Iconic dual-pill switch with Sun & Moon on all screens */}
          <button
            type="button"
            onClick={onToggleTheme}
            role="switch"
            aria-checked={isDark}
            title={isDark ? "Switch to Light Mode (Mann's Planet)" : 'Switch to Dark Mode (Northern Lights)'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center p-1 rounded-full bg-slate-200/90 dark:bg-slate-900 border border-slate-300 dark:border-white/20 transition-all cursor-pointer shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-emerald-400 gap-0.5"
          >
            {/* Sun indicator */}
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
                !isDark
                  ? 'bg-amber-400 text-amber-950 font-bold shadow-sm scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-4 h-4" />
            </span>

            {/* Moon indicator */}
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
                isDark
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-105'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Moon className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Quick-Navigation Scrollable Bar */}
      <div className="lg:hidden px-3 py-2 border-t border-slate-200/70 dark:border-white/5 overflow-x-auto scrollbar-none flex items-center gap-1.5 touch-pan-x">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.hash}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[38px] ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                  : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </header>
    {/* Always a placeholder to preserve document layout and prevent content from jumping or hiding underneath */}
    <div
      className="w-full shrink-0 pointer-events-none h-[118px] lg:h-16"
      style={headerHeight ? { height: `${headerHeight}px` } : undefined}
      aria-hidden="true"
    />
  </>
);
};
