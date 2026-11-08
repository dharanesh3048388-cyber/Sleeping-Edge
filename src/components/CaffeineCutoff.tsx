import React, { useState } from 'react';
import { Coffee, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';
import {
  CAFFEINE_PRESETS,
  calculateCaffeineCutoff,
  createTimeDate,
  formatTimeDisplay
} from '../utils/sleepScience';

interface CaffeineCutoffProps {
  is24Hour: boolean;
}

export const CaffeineCutoff: React.FC<CaffeineCutoffProps> = ({ is24Hour }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('coldbrew');
  const [customMg, setCustomMg] = useState<number>(200);

  // Planned bedtime: default 11:00 PM
  const [bedHour, setBedHour] = useState<number>(23);
  const [bedMinute, setBedMinute] = useState<number>(0);

  // Time of caffeine intake: default 2:00 PM (14:00)
  const [intakeHour, setIntakeHour] = useState<number>(14);
  const [intakeMinute, setIntakeMinute] = useState<number>(0);

  // Half life (default 5.5 hours)
  const [halfLife, setHalfLife] = useState<number>(5.5);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = CAFFEINE_PRESETS.find((x) => x.id === presetId);
    if (p) {
      setCustomMg(p.defaultMg);
    }
  };

  const bedtimeDate = createTimeDate(bedHour, bedMinute);
  const intakeDate = createTimeDate(intakeHour, intakeMinute);

  const cutoffResult = calculateCaffeineCutoff(customMg, bedtimeDate, intakeDate, halfLife, 25);

  return (
    <section
      id="caffeine"
      data-alias="caffeine-calculator"
      className="w-full py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 scroll-mt-20"
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="text-xs font-semibold tracking-widest uppercase text-sky-600 dark:text-emerald-400 mb-2">
          Caffeine Timing & Clearance
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-3">
          Caffeine Calculator
        </h2>
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-slate-600 dark:text-slate-300">
          Caffeine stays active in your system for 5 to 7 hours. Even if you fall asleep easily, lingering caffeine fragments deep slow-wave sleep.
        </p>
      </div>

      <div className="bg-white/85 dark:bg-[#0b111e]/85 backdrop-blur-2xl border border-sky-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-2xl transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Preset selection and dose slider */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                1. Select Beverage or Dose
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAFFEINE_PRESETS.map((b) => {
                  const isSelected = selectedPresetId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectPreset(b.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white font-semibold border-sky-500 shadow-sm dark:bg-emerald-500/15 dark:border-emerald-400 dark:text-white'
                          : 'bg-slate-100/80 text-slate-700 border-slate-200/90 hover:bg-slate-200 hover:text-slate-950 dark:bg-slate-900/60 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white'
                      }`}
                    >
                      <div className="font-semibold">{b.name}</div>
                      <div
                        className={`text-[11px] font-mono mt-0.5 ${
                          isSelected ? 'text-sky-100 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {b.defaultMg} mg
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dose fine-tuner */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-mono">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Caffeine Amount:</span>
                <span className="text-sky-700 dark:text-emerald-400 font-bold">{customMg} mg</span>
              </div>
              <input
                type="range"
                min="20"
                max="400"
                step="5"
                value={customMg}
                onChange={(e) => {
                  setCustomMg(Number(e.target.value));
                  setSelectedPresetId('custom');
                }}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>20 mg (Tea)</span>
                <span>200 mg (Cold Brew)</span>
                <span>400 mg (Max Safe Daily)</span>
              </div>
            </div>

            {/* Timing Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-slate-200 dark:border-white/10">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Your Target Bedtime
                </label>
                <select
                  value={bedHour}
                  onChange={(e) => setBedHour(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-emerald-400 min-h-[42px]"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => {
                    const temp = new Date();
                    temp.setHours(h, 0, 0, 0);
                    return (
                      <option key={h} value={h} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                        {formatTimeDisplay(temp, is24Hour)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Intake / Last Cup Time
                </label>
                <select
                  value={intakeHour}
                  onChange={(e) => setIntakeHour(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-emerald-400 min-h-[42px]"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => {
                    const temp = new Date();
                    temp.setHours(h, 0, 0, 0);
                    return (
                      <option key={h} value={h} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                        {formatTimeDisplay(temp, is24Hour)}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Advanced Metabolism Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer font-medium"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-600 dark:text-emerald-400" />
                <span>Adjust Individual Metabolism ({halfLife}h half-life)</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3.5 rounded-lg bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-mono">
                    <span>Hepatic CYP1A2 Enzyme Half-life:</span>
                    <span className="text-sky-700 dark:text-emerald-400 font-bold">{halfLife} hours</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="8.0"
                    step="0.5"
                    value={halfLife}
                    onChange={(e) => setHalfLife(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>4.0h (Fast metabolizer)</span>
                    <span>5.5h (Average)</span>
                    <span>8.0h (Sensitive / slow)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Clearance Telemetry Card */}
          <div className="lg:col-span-5 bg-slate-50/95 dark:bg-slate-950/70 border border-slate-200/90 dark:border-white/15 rounded-xl p-5 flex flex-col justify-between h-full shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                Recommended Cutoff Time
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 dark:text-white tracking-tight tabular-nums mb-1">
                {formatTimeDisplay(cutoffResult.latestCutoffTime, is24Hour)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                To have less than 25mg active caffeine by bedtime, finish your last cup of {customMg}mg before this time.
              </p>

              {/* Status at Bedtime */}
              <div className="p-4 rounded-xl border mb-4 bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-700 dark:text-slate-300">Active at Bedtime</span>
                  <span className="font-mono text-sky-700 dark:text-emerald-400 font-bold">{cutoffResult.activeMgAtBedtime} mg</span>
                </div>

                {cutoffResult.isSafeNow ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Caffeine cleared. Deep sleep ready.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>High caffeine remains. Expect lighter, restless sleep.</span>
                  </div>
                )}
              </div>

              {/* Biological Clearance Time */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                  <span>Time needed to clear:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{cutoffResult.hoursNeededToClear} hours</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                  <span>Body half-life:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{halfLife} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Safe bedtime limit:</span>
                  <span className="text-slate-900 dark:text-white font-bold">&lt; 25 mg</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Tiredness builds up naturally during the day. Caffeine temporarily blocks your brain's tiredness receptors rather than providing real energy.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
