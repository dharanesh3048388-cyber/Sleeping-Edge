import React, { useState } from 'react';
import { BatteryCharging, Compass, AlertCircle, CheckCircle, Sunrise, Sunset, Moon, Brain } from 'lucide-react';
import { calculateSleepDebt } from '../utils/sleepScience';

type Chronotype = 'earlier' | 'intermediate' | 'later' | 'variable';

interface ChronotypeProfile {
  name: string;
  pattern: string;
  optimalSleep: string;
  peakFocus: string;
  description: string;
  strategy: string;
}

const CHRONOTYPE_PROFILES: Record<Chronotype, ChronotypeProfile> = {
  earlier: {
    name: 'Earlier timing tendency',
    pattern: 'May prefer earlier sleep and wake times',
    optimalSleep: 'No universal clock time',
    peakFocus: 'Varies by individual',
    description: 'Some people naturally feel more alert earlier in the day and prefer an earlier sleep schedule. This is a broad tendency, not a diagnosis.',
    strategy: 'Keep a reasonably consistent sleep and wake schedule that allows enough sleep and fits your daily responsibilities.'
  },
  intermediate: {
    name: 'Intermediate timing tendency',
    pattern: 'May prefer middle-of-the-day schedules',
    optimalSleep: 'No universal clock time',
    peakFocus: 'Varies by individual',
    description: 'Some people prefer sleep and wake times closer to conventional daytime schedules. Individual preferences and work demands vary.',
    strategy: 'Aim for a regular schedule and adequate sleep duration. Morning light and consistent routines can help support circadian timing.'
  },
  later: {
    name: 'Later timing tendency',
    pattern: 'May prefer later sleep and wake times',
    optimalSleep: 'No universal clock time',
    peakFocus: 'Varies by individual',
    description: 'Some people naturally feel more alert later in the day. Social and work schedules can make it harder to follow a preferred timing.',
    strategy: 'Keep sleep timing as consistent as practical and seek professional advice if your schedule causes persistent impairment.'
  },
  variable: {
    name: 'Variable sleep timing',
    pattern: 'Sleep timing varies or feels irregular',
    optimalSleep: 'Depends on personal and work schedule',
    peakFocus: 'Varies by individual',
    description: 'Sleep timing can vary with routines, light exposure, work schedules and health. This category is not a clinical diagnosis.',
    strategy: 'Track sleep and wake times for a couple of weeks. If irregularity or daytime sleepiness persists, consider discussing it with a healthcare professional.'
  }
};

export const SleepDebtPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'debt' | 'chronotype'>('debt');

  // Sleep Debt Tracker State (last 7 days actual hours)
  const [targetHours, setTargetHours] = useState<number>(7.5);
  const [days, setDays] = useState<number[]>([7, 6.5, 6, 7.5, 6, 8, 8.5]);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const debtResult = calculateSleepDebt(targetHours, days);

  // Chronotype Quick Selector State
  const [selectedChronotype, setSelectedChronotype] = useState<Chronotype>('intermediate');

  const updateDay = (index: number, val: number) => {
    const updated = [...days];
    updated[index] = Math.max(3, Math.min(12, val));
    setDays(updated);
  };

  return (
    <section
      id="recovery"
      data-alias="sleep-debt"
      className="w-full py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 scroll-mt-20"
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="text-xs font-semibold tracking-widest uppercase text-sky-700 dark:text-emerald-400 mb-2">
          Weekly Recovery
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-3">
          Sleep Debt & Rhythm
        </h2>
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-slate-600 dark:text-slate-300">
          Compare your reported sleep with a personal weekly target. This is a simple arithmetic difference, not a clinical measure of sleep debt or a repayment prescription.
        </p>
      </div>

      {/* Segmented Switcher */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs gap-1 sm:gap-0">
          <button
            type="button"
            onClick={() => setActiveTab('debt')}
            className={`flex-1 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'debt'
                ? 'bg-sky-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            7-Day Sleep Target Comparison
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chronotype')}
            className={`flex-1 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'chronotype'
                ? 'bg-sky-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950 font-bold'
                : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Chronotype overview
          </button>
        </div>
      </div>

      {/* Tab 1: Sleep Debt */}
      {activeTab === 'debt' && (
        <div className="bg-white/85 dark:bg-[#0b111e]/85 backdrop-blur-2xl border border-sky-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left 7 cols: Day Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Weekly Sleep Log</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Adjust hours slept for each night this past week</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Daily Target:</span>
                  <select
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded px-2 py-1 text-sky-700 dark:text-emerald-400 font-bold"
                  >
                    {[6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((t) => (
                      <option key={t} value={t} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                        {t} hrs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day rows */}
              <div className="space-y-3">
                {days.map((hours, idx) => {
                  const diff = hours - targetHours;
                  return (
                    <div key={dayLabels[idx]} className="flex items-center gap-3 text-xs">
                      <span className="w-10 font-mono text-slate-600 dark:text-slate-400 font-semibold">{dayLabels[idx]}</span>
                      <input
                        type="range"
                        min="4"
                        max="11"
                        step="0.5"
                        value={hours}
                        onChange={(e) => updateDay(idx, Number(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-emerald-400"
                      />
                      <span className="w-14 font-mono text-right text-slate-900 dark:text-white font-bold">{hours}h</span>
                      <span
                        className={`w-14 text-right font-mono text-[11px] font-semibold ${
                          diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {diff >= 0 ? `+${diff.toFixed(1)}h` : `${diff.toFixed(1)}h`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 5 cols: Debt Telemetry */}
            <div className="lg:col-span-5 bg-slate-50/95 dark:bg-slate-950/70 border border-slate-200/90 dark:border-white/15 rounded-xl p-5 flex flex-col justify-between h-full shadow-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Weekly Difference from Target
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-bold text-slate-900 dark:text-white tracking-tight tabular-nums mb-1">
                  {debtResult.totalDebtHours > 0 ? `-${debtResult.totalDebtHours}h` : '0.0h'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono mb-6">
                  <span>Avg: {debtResult.averageSleepHours}h / night</span>
                  <span>·</span>
                  <span
                    className={
                      debtResult.totalDebtHours > 0
                        ? 'text-amber-600 dark:text-amber-400 font-bold'
                        : 'text-emerald-600 dark:text-emerald-400 font-bold'
                    }
                  >
                    Weekly comparison
                  </span>
                </div>

                {/* Science Recovery Protocol */}
                <div className="p-4 rounded-xl bg-sky-50/90 dark:bg-slate-900/60 border border-sky-200/80 dark:border-white/10 mb-4 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 dark:text-emerald-300 mb-2">
                    <BatteryCharging className="w-4 h-4 text-sky-600 dark:text-emerald-400" />
                    <span>How to interpret this estimate</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    This is the difference between the hours you entered and your chosen target. It does not measure biological sleep debt or tell you exactly how much extra sleep to add.
                  </p>
                </div>


              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                If you have ongoing daytime sleepiness or difficulty sleeping, consider discussing it with a healthcare professional.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chronotype overview */}
      {activeTab === 'chronotype' && (
        <div className="bg-white/85 dark:bg-[#0b111e]/85 backdrop-blur-2xl border border-sky-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {(Object.keys(CHRONOTYPE_PROFILES) as Chronotype[]).map((type) => {
              const p = CHRONOTYPE_PROFILES[type];
              const isSelected = selectedChronotype === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedChronotype(type)}
                  className={`p-3 sm:p-4 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-sky-600 text-white font-semibold border-sky-500 shadow-md ring-1 ring-sky-400/40 dark:bg-emerald-500/15 dark:border-emerald-400 dark:text-white dark:ring-emerald-400/30'
                      : 'bg-slate-100/80 border-slate-200/90 text-slate-700 hover:border-slate-300 hover:text-slate-950 dark:bg-slate-900/60 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white'
                  }`}
                >
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                      isSelected ? 'text-sky-100 dark:text-emerald-400' : 'text-sky-700 dark:text-emerald-400'
                    }`}
                  >
                    {type}
                  </div>
                  <div className="text-sm font-semibold mb-1">{p.name.split(' ')[0]}</div>
                  <div className={`text-[11px] ${isSelected ? 'text-sky-100 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{p.pattern}</div>
                </button>
              );
            })}
          </div>

          {/* Active Chronotype Deep Dive */}
          {CHRONOTYPE_PROFILES[selectedChronotype] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 p-4 sm:p-6 rounded-xl bg-slate-50/95 dark:bg-slate-950/70 border border-slate-200/90 dark:border-white/10 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {CHRONOTYPE_PROFILES[selectedChronotype].name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {CHRONOTYPE_PROFILES[selectedChronotype].description}
                </p>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Typical timing</span>
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {CHRONOTYPE_PROFILES[selectedChronotype].optimalSleep}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Brain className="w-4 h-4 text-sky-600 dark:text-emerald-400" />
                      <span>Alertness pattern</span>
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {CHRONOTYPE_PROFILES[selectedChronotype].peakFocus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-emerald-400 mb-2">
                    General schedule guidance
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {CHRONOTYPE_PROFILES[selectedChronotype].strategy}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-100/90 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="text-slate-900 dark:text-slate-200 font-semibold">Important: </span>
                  These informal categories are not validated diagnostic results. Alertness is influenced by sleep duration, circadian timing, health and daily routines.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
