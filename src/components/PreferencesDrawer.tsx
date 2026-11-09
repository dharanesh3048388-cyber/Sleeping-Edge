import React from 'react';
import { X, RotateCcw, Moon, Sun } from 'lucide-react';
import { AGE_GUIDELINES } from '../utils/sleepScience';

interface PreferencesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  latencyMinutes: number;
  onChangeLatency: (val: number) => void;
  cycleLength: number;
  onChangeCycleLength: (val: number) => void;
  is24Hour: boolean;
  onToggle24Hour: (val: boolean) => void;
  ageGroup: string;
  onChangeAgeGroup: (val: string) => void;
  onResetDefaults: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const PreferencesDrawer: React.FC<PreferencesDrawerProps> = ({
  isOpen,
  onClose,
  latencyMinutes,
  onChangeLatency,
  cycleLength,
  onChangeCycleLength,
  is24Hour,
  onToggle24Hour,
  ageGroup,
  onChangeAgeGroup,
  onResetDefaults,
  isDark,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  const currentAgeInfo = AGE_GUIDELINES[ageGroup] || AGE_GUIDELINES.adult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0b111e] border border-slate-200/90 dark:border-white/15 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 id="preferences-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Sleep Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize calculations to match how you sleep
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Sleep Onset Latency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Time to Fall Asleep</span>
            <span className="font-mono text-sky-700 dark:text-emerald-400 font-bold">{latencyMinutes} minutes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Set an estimate for how long you usually take to fall asleep. This is a planning input, not an assessment of sleep health.
          </p>
          <input
            type="range"
            min="5"
            max="45"
            step="1"
            value={latencyMinutes}
            onChange={(e) => onChangeLatency(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>5 min</span>
            <span>25 min</span>
            <span>45 min</span>
          </div>
        </div>

        {/* 2. Custom Cycle Length */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Sleep Cycle Length</span>
            <span className="font-mono text-sky-700 dark:text-emerald-400 font-bold">{cycleLength} minutes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sleep timing intervals vary. This adjustable value is a planning assumption, not a measurement or prediction of your actual sleep stages.
          </p>
          <input
            type="range"
            min="75"
            max="110"
            step="5"
            value={cycleLength}
            onChange={(e) => onChangeCycleLength(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>75 min</span>
            <span>90 min (Example)</span>
            <span>110 min</span>
          </div>
        </div>

        {/* 3. Age Group Guidelines */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            Age Group Guidelines
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(AGE_GUIDELINES).map((key) => {
              const g = AGE_GUIDELINES[key];
              const isSelected = ageGroup === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChangeAgeGroup(key)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white font-semibold border-sky-500 shadow-sm dark:bg-emerald-500/15 dark:border-emerald-400 dark:text-white'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-950 dark:bg-slate-900/60 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">{g.group}</div>
                  <div className={`text-[11px] font-mono ${isSelected ? 'text-sky-100 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {g.recommendedHours[0]}–{g.recommendedHours[1]} hrs
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            {currentAgeInfo.note}
          </p>
        </div>

        {/* Visual Theme Selection */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            Display Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isDark) onToggleTheme();
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                isDark
                  ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span className="font-semibold text-xs text-slate-900 dark:text-white">Dark Mode</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Northern Lights Aurora</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isDark) onToggleTheme();
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                !isDark
                  ? 'bg-sky-500/15 border-sky-500 text-slate-900 shadow-sm'
                  : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-xs text-slate-900 dark:text-white">Light Mode</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Mann’s Planet Ice</span>
            </button>
          </div>
        </div>

        {/* 4. Clock Format */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">24-Hour Military Time</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Display 22:30 instead of 10:30 PM</span>
          </div>
          <button
            type="button"
            onClick={() => onToggle24Hour(!is24Hour)}
            aria-label="Toggle 24-hour clock format"
            aria-pressed={is24Hour}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              is24Hour ? 'bg-sky-600 dark:bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer py-1 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
