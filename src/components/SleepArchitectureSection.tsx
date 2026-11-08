import React, { useState } from 'react';
import { Activity, ShieldAlert, Sparkles, Brain, HeartPulse } from 'lucide-react';

interface StageInfo {
  id: string;
  name: string;
  frequency: string;
  shareNight: string;
  color: string;
  primaryRole: string;
  description: string;
}

const STAGES: StageInfo[] = [
  {
    id: 'n1',
    name: 'Stage 1 (Light Drift)',
    frequency: 'Theta Waves',
    shareNight: '5% of night',
    color: 'bg-slate-400 text-slate-900',
    primaryRole: 'Falling asleep',
    description: 'Heart rate and breathing slow down as muscles relax. You can be awakened easily with zero grogginess.'
  },
  {
    id: 'n2',
    name: 'Stage 2 (Light Sleep)',
    frequency: 'Sleep Spindles',
    shareNight: '45–55% of night',
    color: 'bg-teal-400 text-teal-950',
    primaryRole: 'Memory & learning',
    description: 'Body temperature drops and eye movements stop. Your brain organizes daily memories and shields you from light noises.'
  },
  {
    id: 'n3',
    name: 'Stage 3 (Deep Sleep)',
    frequency: 'Delta Waves',
    shareNight: '15–25% of night',
    color: 'bg-emerald-400 text-emerald-950',
    primaryRole: 'Physical repair & immunity',
    description: 'Growth hormone releases to repair muscles and tissues while your body recharges. Waking during deep sleep triggers heavy grogginess.'
  },
  {
    id: 'rem',
    name: 'REM (Dream Sleep)',
    frequency: 'Active Brain Waves',
    shareNight: '20–25% of night',
    color: 'bg-purple-400 text-purple-950',
    primaryRole: 'Mental clarity & mood balance',
    description: 'Your brain is as active as when awake. Dreams help process emotions and solve problems while muscles stay relaxed.'
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
          Sleep occurs in 90-minute waves. Waking up at the end of a cycle lets you feel fresh and alert rather than groggy.
        </p>
      </div>

      <div className="bg-white/85 dark:bg-[#0b111e]/85 backdrop-blur-2xl border border-sky-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-2xl">
        {/* Hypnogram Visual Timeline of 5 Cycles */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
            <span>Cycle 1 (Deep SWS Dominant)</span>
            <span>Cycle 3 (Balanced)</span>
            <span>Cycle 5 (REM Dominant)</span>
          </div>

          {/* Cycles bar progression */}
          <div className="grid grid-cols-5 gap-2 h-16 sm:h-20 bg-slate-100/90 dark:bg-slate-950/80 p-2 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-inner">
            {/* Cycle 1: Heavy Deep */}
            <div className="flex flex-col justify-end h-full rounded bg-white dark:bg-slate-900/60 p-1 text-[10px] font-mono border border-slate-200/70 dark:border-white/5 relative overflow-hidden">
              <div className="w-full h-3 bg-purple-500/70 rounded-t mb-0.5" title="REM: 10 min" />
              <div className="w-full h-8 bg-sky-500/70 dark:bg-teal-500/70 mb-0.5" title="Light: 35 min" />
              <div className="w-full h-8 bg-emerald-500 dark:bg-emerald-400 rounded-b" title="Deep SWS: 45 min" />
              <div className="absolute top-1 left-1.5 text-slate-500 dark:text-slate-400 font-semibold">C1</div>
            </div>

            {/* Cycle 2 */}
            <div className="flex flex-col justify-end h-full rounded bg-white dark:bg-slate-900/60 p-1 text-[10px] font-mono border border-slate-200/70 dark:border-white/5 relative overflow-hidden">
              <div className="w-full h-4 bg-purple-500/70 rounded-t mb-0.5" title="REM: 15 min" />
              <div className="w-full h-9 bg-sky-500/70 dark:bg-teal-500/70 mb-0.5" title="Light: 40 min" />
              <div className="w-full h-6 bg-emerald-500 dark:bg-emerald-400 rounded-b" title="Deep SWS: 35 min" />
              <div className="absolute top-1 left-1.5 text-slate-500 dark:text-slate-400 font-semibold">C2</div>
            </div>

            {/* Cycle 3 */}
            <div className="flex flex-col justify-end h-full rounded bg-white dark:bg-slate-900/60 p-1 text-[10px] font-mono border border-slate-200/70 dark:border-white/5 relative overflow-hidden">
              <div className="w-full h-6 bg-purple-500/80 rounded-t mb-0.5" title="REM: 25 min" />
              <div className="w-full h-10 bg-sky-500/70 dark:bg-teal-500/70 mb-0.5" title="Light: 45 min" />
              <div className="w-full h-4 bg-emerald-500 dark:bg-emerald-400 rounded-b" title="Deep SWS: 20 min" />
              <div className="absolute top-1 left-1.5 text-slate-500 dark:text-slate-400 font-semibold">C3</div>
            </div>

            {/* Cycle 4 */}
            <div className="flex flex-col justify-end h-full rounded bg-white dark:bg-slate-900/60 p-1 text-[10px] font-mono border border-slate-200/70 dark:border-white/5 relative overflow-hidden">
              <div className="w-full h-8 bg-purple-500/90 rounded-t mb-0.5" title="REM: 35 min" />
              <div className="w-full h-9 bg-sky-500/70 dark:bg-teal-500/70 mb-0.5" title="Light: 45 min" />
              <div className="w-full h-2 bg-emerald-500 dark:bg-emerald-400 rounded-b" title="Deep SWS: 10 min" />
              <div className="absolute top-1 left-1.5 text-slate-500 dark:text-slate-400 font-semibold">C4</div>
            </div>

            {/* Cycle 5 */}
            <div className="flex flex-col justify-end h-full rounded bg-white dark:bg-slate-900/60 p-1 text-[10px] font-mono border border-slate-200/70 dark:border-white/5 relative overflow-hidden">
              <div className="w-full h-11 bg-purple-500 rounded-t mb-0.5" title="REM: 45 min" />
              <div className="w-full h-7 bg-sky-500/70 dark:bg-teal-500/70 rounded-b" title="Light: 45 min" />
              <div className="absolute top-1 left-1.5 text-slate-500 dark:text-slate-400 font-semibold">C5</div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-sky-500 dark:bg-teal-400" />
              <span>Light Sleep (N1/N2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-400" />
              <span>Slow-Wave Deep (N3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-purple-500 dark:bg-purple-400" />
              <span>REM Sleep (Dreams)</span>
            </div>
          </div>
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
                  {s.shareNight}
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
              <div>Share: <strong className="text-slate-900 dark:text-white">{activeStage.shareNight}</strong></div>
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
                  ? 'Avoid alarms here. Causes up to 45 minutes of heavy grogginess.'
                  : 'Easy wake window. You will feel alert almost right away.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
