import React, { useState } from 'react';
import { Activity, ShieldAlert, Sparkles, Brain, HeartPulse } from 'lucide-react';

interface StageInfo {
  id: string;
  name: string;
  frequency: string;
  pattern: string;
  color: string;
  primaryRole: string;
  description: string;
}

const STAGES: StageInfo[] = [
  {
    id: 'n1',
    name: 'Stage 1 (Light Drift)',
    frequency: 'Theta Waves',
    pattern: 'Transition into sleep',
    color: 'bg-slate-400 text-slate-900',
    primaryRole: 'Falling asleep',
    description: 'The transition from wakefulness into sleep. Brief awakenings and the experience of waking vary.'
  },
  {
    id: 'n2',
    name: 'Stage 2 (Light Sleep)',
    frequency: 'Sleep Spindles',
    pattern: 'Often the largest NREM stage',
    color: 'bg-teal-400 text-teal-950',
    primaryRole: 'Memory & learning',
    description: 'A common stage of NREM sleep associated with sleep spindles and other patterns measured in a sleep study.'
  },
  {
    id: 'n3',
    name: 'Stage 3 (Deep Sleep)',
    frequency: 'Delta Waves',
    pattern: 'More common earlier in the night',
    color: 'bg-emerald-400 text-emerald-950',
    primaryRole: 'Physical repair & immunity',
    description: 'Deep NREM sleep is usually more prominent earlier in the night. The effects of waking from it vary and cannot be predicted by a simple timer.'
  },
  {
    id: 'rem',
    name: 'REM (Dream Sleep)',
    frequency: 'Active Brain Waves',
    pattern: 'Often longer later in the night',
    color: 'bg-purple-400 text-purple-950',
    primaryRole: 'Mental clarity & mood balance',
    description: 'REM sleep involves vivid brain activity and temporary muscle atonia. Dreaming can occur in REM and other sleep stages.'
  }
];

export const SleepArchitectureSection: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<string>('n3');

  const activeStage = STAGES.find((s) => s.id === selectedStage) || STAGES[2];

  return (
    <section
      id="science"
      data-alias="sleep-stages"
      className="w-full py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 scroll-mt-20"
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="text-xs font-semibold tracking-widest uppercase text-sky-700 dark:text-emerald-400 mb-2">
          Sleep Stages
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-3">
          How Sleep Cycles Work
        </h2>
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-slate-600 dark:text-slate-300">
          Sleep alternates between NREM and REM stages in cycles that commonly last around 80–100 minutes, with variation across the night and between people.
        </p>
      </div>

      <div className="bg-white/85 dark:bg-[#0b111e]/85 backdrop-blur-2xl border border-sky-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-2xl">
        <div className="mb-8 p-4 sm:p-5 rounded-xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Sleep stages change across the night</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            A typical night moves repeatedly through non-REM and REM sleep. Deep sleep is usually more prominent earlier, while REM periods tend to lengthen later. The timing and proportions vary; the illustration below does not represent an individual night's measured sleep.
          </p>
        </div>

        {/* Stage Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {STAGES.map((s) => {
            const isSelected = selectedStage === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStage(s.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-500 shadow-sm dark:bg-slate-800 dark:border-white/30 dark:text-white'
                    : 'bg-slate-100/80 border-slate-200/90 text-slate-700 hover:text-slate-950 hover:bg-slate-200 dark:bg-slate-900/50 dark:border-white/10 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{s.name.split(' (')[0]}</div>
                <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-sky-100 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {s.pattern}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <div className="p-4 sm:p-6 rounded-xl bg-slate-50/95 dark:bg-slate-950/70 border border-slate-200/90 dark:border-white/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {activeStage.name}
              </h3>
              <p className="text-xs text-sky-700 dark:text-emerald-400 font-semibold">
                {activeStage.primaryRole}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
              <div>Wave: <strong className="text-slate-900 dark:text-white">{activeStage.frequency}</strong></div>
              <div>Pattern: <strong className="text-slate-900 dark:text-white">{activeStage.pattern}</strong></div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            {activeStage.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">When cut short: </span>
              <span className="text-slate-900 dark:text-slate-200 font-normal">
                {activeStage.id === 'rem'
                  ? 'Lower focus, mood irritability, and slower problem-solving.'
                  : activeStage.id === 'n3'
                  ? 'Physical fatigue, slower muscle recovery, and persistent brain fog.'
                  : 'General tiredness and fragmented rest.'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Waking experience: </span>
              <span className="text-slate-900 dark:text-slate-200 font-normal">
                {activeStage.id === 'n3'
                  ? 'Waking experience varies; no clock-based calculator can identify this stage.'
                  : 'Waking experience varies; this stage cannot be identified from clock time alone.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
