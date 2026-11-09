import React, { useState, useEffect } from 'react';
import { AlertTriangle, Copy, Check, Clock } from 'lucide-react';
import { calculateNapOptions, NapOption, formatTimeDisplay } from '../utils/sleepScience';

interface NapOptimizerProps {
  latencyMinutes: number;
  is24Hour: boolean;
}

export const NapOptimizer: React.FC<NapOptimizerProps> = ({
  latencyMinutes,
  is24Hour
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Use slightly shorter latency for naps (default 8-10m)
  const napLatency = Math.min(latencyMinutes, 10);
  const napOptions: NapOption[] = calculateNapOptions(currentTime, napLatency, is24Hour);

  const currentHour = currentTime.getHours();
  const isLateAfternoon = currentHour >= 16;

  const handleCopy = (nap: NapOption) => {
    const text = `SleepingEdge Nap: Wake at ${nap.wakeTimeStr} (${nap.name} · ${nap.durationMinutes} min).`;
    navigator.clipboard.writeText(text);
    setCopiedId(nap.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      id="naps"
      data-alias="nap-optimizer"
      className="w-full py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 scroll-mt-20"
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="text-xs font-semibold tracking-widest uppercase text-sky-700 dark:text-emerald-400 mb-2">
          Targeted Circadian Boost
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-3">
          Nap Optimizer
        </h2>
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-slate-600 dark:text-slate-300">
          Compare a brief or longer nap opportunity. Actual sleep onset, sleep stages and post-nap alertness vary.
        </p>
      </div>

      {/* Circadian Warning Banner if late */}
      {isLateAfternoon && (
        <div className="mb-6 p-4 rounded-xl bg-amber-100/90 border border-amber-300 dark:bg-amber-950/40 dark:border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-950 dark:text-amber-300">Late Afternoon Reminder: </span>
            It is past 4:00 PM ({formatTimeDisplay(currentTime, is24Hour)}). A late nap may make it harder to fall asleep at your usual bedtime. Consider your schedule and how naps affect you.
          </div>
        </div>
      )}

      {/* Live Current Time Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400 mb-4 px-1 font-mono">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-emerald-400 shrink-0" />
          <span>If falling asleep right now ({formatTimeDisplay(currentTime, is24Hour)})</span>
        </span>
        <span>Latency buffer: +{napLatency} min</span>
      </div>

      {/* Nap Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {napOptions.map((nap) => {
          const isPower = nap.id === 'power';

          return (
            <div
              key={nap.id}
              className={`flex flex-col justify-between p-4 sm:p-6 rounded-2xl border backdrop-blur-xl transition-all shadow-sm ${
                isPower
                  ? 'bg-sky-50/90 border-sky-300 ring-1 ring-sky-400/30 dark:bg-[#0b1322]/80 dark:border-emerald-500/30 dark:shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-white/85 border-slate-200 dark:bg-[#0b111e]/80 dark:border-white/10'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span
                    className={`font-bold tracking-wide ${
                      isPower
                        ? 'text-sky-800 dark:text-emerald-400'
                        : 'text-purple-800 dark:text-purple-400'
                    }`}
                  >
                    {nap.name}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{nap.durationMinutes} min sleep</span>
                </div>

                {/* Wake Time Readout */}
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                    Set Alarm For
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white tracking-tight tabular-nums">
                    {nap.wakeTimeStr}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {nap.durationMinutes + napLatency} min total rest window
                  </div>
                </div>

                {/* Science Benefit */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {nap.benefit}
                </p>

                {/* Stages targeted */}
                <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 dark:bg-slate-900/70 dark:border-white/5 dark:text-slate-400 mb-4">
                  <span className="text-slate-900 dark:text-slate-300 font-semibold">Sleep Stages: </span>
                  {nap.targetStages}
                </div>
              </div>

              {/* Footer row */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span>Post-nap alertness varies between people.</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(nap)}
                  className="inline-flex items-center gap-1 min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {copiedId === nap.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Alarm</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
