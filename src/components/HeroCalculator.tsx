import React, { useState, useEffect } from 'react';
import {
  Sunrise,
  Moon,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Share2
} from 'lucide-react';
import {
  calculateBedtimesForWake,
  calculateWakeTimesForBed,
  formatDurationHoursMinutes,
  formatTimeDisplay,
  CycleResult
} from '../utils/sleepScience';

type CalculatorMode = 'wake_at' | 'sleep_now' | 'sleep_at';

interface HeroCalculatorProps {
  latencyMinutes: number;
  cycleLength: number;
  is24Hour: boolean;
}

export const HeroCalculator: React.FC<HeroCalculatorProps> = ({
  latencyMinutes,
  cycleLength,
  is24Hour
}) => {
  const [mode, setMode] = useState<CalculatorMode>('wake_at');

  // Input states
  // Mode: wake_at (default: 7:00 AM)
  const [wakeHour, setWakeHour] = useState<number>(7);
  const [wakeMinute, setWakeMinute] = useState<number>(0);
  const [wakeAmpm, setWakeAmpm] = useState<'AM' | 'PM'>('AM');

  // Mode: sleep_at (default: 11:00 PM)
  const [bedHour, setBedHour] = useState<number>(11);
  const [bedMinute, setBedMinute] = useState<number>(0);
  const [bedAmpm, setBedAmpm] = useState<'AM' | 'PM'>('PM');

  // Real-time tick for sleep_now
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const createNextOccurrence = (hours: number, minutes: number): Date => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
    return target;
  };
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute 24h formatted inputs
  const get24Hour = (h: number, ampm: 'AM' | 'PM'): number => {
    if (is24Hour) return h;
    if (ampm === 'AM') return h === 12 ? 0 : h;
    return h === 12 ? 12 : h + 12;
  };

  // Generate results based on mode
  let results: CycleResult[] = [];
  let headingQuestion = '';
  let subPrompt = '';

  if (mode === 'wake_at') {
    const target24H = get24Hour(wakeHour, wakeAmpm);
    const targetDate = createNextOccurrence(target24H, wakeMinute);
    results = calculateBedtimesForWake(targetDate, latencyMinutes, cycleLength, is24Hour);
    headingQuestion = `To wake at ${formatTimeDisplay(targetDate, is24Hour)}, fall asleep at:`;
    subPrompt = `Illustrative timing options; actual sleep cycles vary`;
  } else if (mode === 'sleep_now') {
    results = calculateWakeTimesForBed(currentTime, latencyMinutes, cycleLength, is24Hour);
    headingQuestion = `If you drift off to sleep right now:`;
    subPrompt = `Factoring in ${latencyMinutes} min to drift off to sleep`;
  } else {
    const bed24H = get24Hour(bedHour, bedAmpm);
    const bedDate = createNextOccurrence(bed24H, bedMinute);
    results = calculateWakeTimesForBed(bedDate, latencyMinutes, cycleLength, is24Hour);
    headingQuestion = `If you go to bed at ${formatTimeDisplay(bedDate, is24Hour)}, set alarm for:`;
    subPrompt = `Illustrative timing options; actual sleep cycles vary`;
  }

  const handleCopy = (timeStr: string, index: number, cycles: number, bedMin: number) => {
    const text = `SleepingEdge Schedule: ${timeStr} (${cycles} cycles · ${formatDurationHoursMinutes(bedMin)} total). Calculated at sleepingedge.com`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section
      id="calculator"
      data-alias="sleep-calculator"
      className="w-full pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 scroll-mt-20"
    >
      {/* Title & Tagline */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="text-xs font-semibold tracking-widest uppercase text-sky-700 dark:text-emerald-400 mb-2">
          Master Your Sleep Architecture
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4">
          Plan your sleep timing.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 dark:from-emerald-300 dark:via-teal-200 dark:to-cyan-300">
            With realistic estimates.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          Sleep cycles vary from person to person and from night to night. SleepingEdge provides flexible timing estimates, not predictions of sleep stages or guarantees about how refreshed you will feel.
        </p>
      </div>

      {/* Main Glassmorphism Console Card */}
      <div className="bg-white/85 dark:bg-[#0b111e]/85 backdrop-blur-2xl border border-sky-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-2xl p-4 sm:p-8 transition-all">
        {/* Mode Selector Tabs (Segmented Control) */}
        <div className="flex flex-col sm:flex-row p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-white/10 gap-1 mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => setMode('wake_at')}
            className={`flex-1 min-h-[42px] py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'wake_at'
                ? 'bg-sky-600 text-white font-bold shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
            }`}
          >
            <Sunrise className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">I need to wake up at</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('sleep_now')}
            className={`flex-1 min-h-[42px] py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'sleep_now'
                ? 'bg-sky-600 text-white font-bold shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Going to bed now</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('sleep_at')}
            className={`flex-1 min-h-[42px] py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'sleep_at'
                ? 'bg-sky-600 text-white font-bold shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
            }`}
          >
            <Moon className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">I plan to sleep at</span>
          </button>
        </div>

        {/* Primary Interactive Time Input Area */}
        {mode === 'wake_at' && (
          <div className="flex flex-col items-center justify-center py-2 sm:py-4 mb-6 sm:mb-8">
            <label className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2 sm:mb-3">
              Target Wake Time
            </label>
            <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-50/90 dark:bg-slate-950/70 border border-slate-300/80 dark:border-white/15 px-3 py-2.5 sm:px-5 sm:py-4 rounded-2xl shadow-inner max-w-full">
              {/* Hour Dropdown */}
              <select
                value={wakeHour}
                onChange={(e) => setWakeHour(Number(e.target.value))}
                aria-label="Wake hour"
                className="bg-transparent text-2xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white text-center focus:outline-none cursor-pointer border-b border-transparent hover:border-sky-500 dark:hover:border-emerald-400 pb-0.5 sm:pb-1 appearance-none px-1"
              >
                {(is24Hour ? Array.from({ length: 24 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => i + 1)).map((h) => (
                  <option key={h} value={h} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {h < 10 ? `0${h}` : h}
                  </option>
                ))}
              </select>

              <span className="text-2xl sm:text-4xl font-bold text-slate-400 dark:text-slate-500 font-mono">:</span>

              {/* Minute Dropdown (5-min intervals) */}
              <select
                value={wakeMinute}
                onChange={(e) => setWakeMinute(Number(e.target.value))}
                aria-label="Wake minute"
                className="bg-transparent text-2xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white text-center focus:outline-none cursor-pointer border-b border-transparent hover:border-sky-500 dark:hover:border-emerald-400 pb-0.5 sm:pb-1 appearance-none px-1"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>

              {/* AM / PM Toggle */}
              {!is24Hour && (
                <div className="flex bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg p-0.5 sm:p-1 ml-1 sm:ml-2">
                  <button
                    type="button"
                    onClick={() => setWakeAmpm('AM')}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded cursor-pointer transition-colors ${
                      wakeAmpm === 'AM'
                        ? 'bg-sky-600 text-white font-bold dark:bg-emerald-500 dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setWakeAmpm('PM')}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded cursor-pointer transition-colors ${
                      wakeAmpm === 'PM'
                        ? 'bg-sky-600 text-white font-bold dark:bg-emerald-500 dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    PM
                  </button>
                </div>
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Quick presets:</span>
              {[
                { label: '6:00 AM', h: 6, m: 0, ampm: 'AM' as const },
                { label: '6:30 AM', h: 6, m: 30, ampm: 'AM' as const },
                { label: '7:00 AM', h: 7, m: 0, ampm: 'AM' as const },
                { label: '7:30 AM', h: 7, m: 30, ampm: 'AM' as const },
                { label: '8:00 AM', h: 8, m: 0, ampm: 'AM' as const }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setWakeHour(preset.h);
                    setWakeMinute(preset.m);
                    setWakeAmpm(preset.ampm);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 dark:hover:text-white dark:border-white/10 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'sleep_now' && (
          <div className="flex flex-col items-center justify-center py-6 mb-8 text-center">
            <span className="text-xs font-semibold tracking-wider uppercase text-sky-700 dark:text-emerald-400 mb-2">
              Live Real-Time Clock
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-slate-900 dark:text-white tracking-tight tabular-nums mb-2">
              {formatTimeDisplay(currentTime, is24Hour)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              If you go to bed now, these estimates include {latencyMinutes} min to fall asleep.
            </p>
          </div>
        )}

        {mode === 'sleep_at' && (
          <div className="flex flex-col items-center justify-center py-2 sm:py-4 mb-6 sm:mb-8">
            <label className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2 sm:mb-3">
              Planned Bedtime
            </label>
            <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-50/90 dark:bg-slate-950/70 border border-slate-300/80 dark:border-white/15 px-3 py-2.5 sm:px-5 sm:py-4 rounded-2xl shadow-inner max-w-full">
              <select
                value={bedHour}
                onChange={(e) => setBedHour(Number(e.target.value))}
                aria-label="Bed hour"
                className="bg-transparent text-2xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white text-center focus:outline-none cursor-pointer border-b border-transparent hover:border-sky-500 dark:hover:border-emerald-400 pb-0.5 sm:pb-1 appearance-none px-1"
              >
                {(is24Hour ? Array.from({ length: 24 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => i + 1)).map((h) => (
                  <option key={h} value={h} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {h < 10 ? `0${h}` : h}
                  </option>
                ))}
              </select>

              <span className="text-2xl sm:text-4xl font-bold text-slate-400 dark:text-slate-500 font-mono">:</span>

              <select
                value={bedMinute}
                onChange={(e) => setBedMinute(Number(e.target.value))}
                aria-label="Bed minute"
                className="bg-transparent text-2xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white text-center focus:outline-none cursor-pointer border-b border-transparent hover:border-sky-500 dark:hover:border-emerald-400 pb-0.5 sm:pb-1 appearance-none px-1"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>

              {!is24Hour && (
                <div className="flex bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg p-0.5 sm:p-1 ml-1 sm:ml-2">
                  <button
                    type="button"
                    onClick={() => setBedAmpm('AM')}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded cursor-pointer transition-colors ${
                      bedAmpm === 'AM'
                        ? 'bg-sky-600 text-white font-bold dark:bg-emerald-500 dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setBedAmpm('PM')}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded cursor-pointer transition-colors ${
                      bedAmpm === 'PM'
                        ? 'bg-sky-600 text-white font-bold dark:bg-emerald-500 dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    PM
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Quick presets:</span>
              {[
                { label: '10:00 PM', h: 10, m: 0, ampm: 'PM' as const },
                { label: '10:30 PM', h: 10, m: 30, ampm: 'PM' as const },
                { label: '11:00 PM', h: 11, m: 0, ampm: 'PM' as const },
                { label: '11:30 PM', h: 11, m: 30, ampm: 'PM' as const },
                { label: '12:00 AM', h: 12, m: 0, ampm: 'AM' as const }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setBedHour(preset.h);
                    setBedMinute(preset.m);
                    setBedAmpm(preset.ampm);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 dark:hover:text-white dark:border-white/10 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-emerald-400">
                {headingQuestion}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {subPrompt}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>Latency: {latencyMinutes}m</span>
              <span>·</span>
              <span>Cycle: {cycleLength}m</span>
            </div>
          </div>

          {/* Cards Grid: 4 options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((res, index) => {
              const isHero = res.quality === 'optimal';
              const isPeak = res.quality === 'recommended';

              return (
                <div
                  key={res.cycles}
                  className={`relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 shadow-sm ${
                    isHero
                      ? 'bg-sky-50/95 border-sky-400/80 ring-1 ring-sky-400/40 dark:bg-emerald-950/40 dark:border-emerald-400/50 dark:shadow-[0_0_25px_rgba(16,185,129,0.2)] dark:ring-emerald-400/30'
                      : isPeak
                      ? 'bg-teal-50/90 border-teal-300/80 dark:bg-teal-950/30 dark:border-teal-400/30 dark:shadow-[0_0_20px_rgba(45,212,191,0.15)]'
                      : 'bg-slate-50/90 border-slate-200/90 hover:border-slate-300 dark:bg-slate-900/50 dark:border-white/10 dark:hover:border-white/20'
                  }`}
                >
                  {/* Top status indicator */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span
                      className={`font-bold tracking-wide ${
                        isHero
                          ? 'text-sky-800 dark:text-emerald-300'
                          : isPeak
                          ? 'text-teal-800 dark:text-teal-300'
                          : res.quality === 'sufficient'
                          ? 'text-slate-600 dark:text-slate-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {res.label}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      {res.cycles} cycles
                    </span>
                  </div>

                  {/* Main Time Readout */}
                  <div className="mb-4">
                    <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums mb-1">
                      {res.timeStr}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>{formatDurationHoursMinutes(res.sleepMinutes)} asleep</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDurationHoursMinutes(res.totalBedMinutes)} in bed</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">Sleep stages are not estimated from this timing calculation.</p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {res.summary}
                  </p>

                  {/* Action row */}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleCopy(res.timeStr, index, res.cycles, res.totalBedMinutes)}
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {mode === 'wake_at' ? 'Bedtime' : 'Alarm'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Formula Math Drawer */}
          <div className="mt-8 pt-5 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowFormula(!showFormula)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors py-1 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600 dark:text-emerald-400" />
                <span>How the timing estimate works</span>
              </div>
              {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFormula && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <div className="font-mono text-sky-800 dark:text-emerald-300 font-semibold text-sm">
                  {mode === 'wake_at'
                    ? `Bedtime = WakeTime - (Cycles × ${cycleLength} min + ${latencyMinutes} min latency)`
                    : `WakeTime = Bedtime + ${latencyMinutes} min latency + (Cycles × ${cycleLength} min)`}
                </div>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  This calculator adds or subtracts a selected interval and your estimated time to fall asleep. Sleep cycles are not fixed at 90 minutes: research describes typical cycles of roughly 80–100 minutes, with variation across the night and between people. These estimates cannot identify your sleep stage or guarantee an easier wake-up.
                </p>
                <div className="flex flex-wrap gap-4 text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/5 font-mono text-[11px]">
                  <span>1 cycle = {cycleLength} min</span>
                  <span>·</span>
                  <span>Onset latency buffer = {latencyMinutes} min</span>
                  <span>·</span>
                  <span>Adult guidance: regularly aim for at least 7 hours; individual needs vary</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
