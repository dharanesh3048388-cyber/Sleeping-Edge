import React, { useState } from 'react';
import { Volume2, X, Timer, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';
import { sleepAudio, AmbientSoundType, SOUND_PROFILES } from '../utils/audioEngine';

interface AmbientAudioBarProps {
  isOpen: boolean;
  isPlaying: boolean;
  currentSound: AmbientSoundType;
  onSelectSound: (type: AmbientSoundType, volume: number) => void;
  onTogglePlay: (volume?: number) => void;
  onClose: () => void;
}

export const AmbientAudioBar: React.FC<AmbientAudioBarProps> = ({
  isOpen,
  isPlaying,
  currentSound,
  onSelectSound,
  onTogglePlay,
  onClose,
}) => {
  const [volume, setVolume] = useState<number>(0.35);
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'soundscapes' | 'noise'>('all');

  if (!isOpen) return null;

  const activeProfile = SOUND_PROFILES.find((s) => s.id === currentSound) || SOUND_PROFILES[0];

  const handleSelectSound = (type: AmbientSoundType) => {
    onSelectSound(type, volume);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    sleepAudio.setVolume(newVol);
  };

  const handleTimerChange = (min: number) => {
    setTimerMinutes(min);
    sleepAudio.setAutoOff(min);
  };

  const filteredProfiles = SOUND_PROFILES.filter((p) => {
    if (activeCategoryFilter === 'soundscapes') return p.category === 'Soundscape';
    if (activeCategoryFilter === 'noise') return p.category !== 'Soundscape';
    return true;
  });

  return (
    <div
      id="ambient-sounds"
      role="region"
      aria-label="Ambient noise and sleep soundscape player"
      className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-4 sm:bottom-4 z-40 max-w-md w-auto sm:w-[26rem] bg-white/95 dark:bg-[#0b111e]/95 backdrop-blur-2xl border border-sky-300/70 dark:border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-2xl text-xs transition-all duration-300 ring-1 ring-sky-400/20 dark:ring-emerald-400/10 max-h-[82vh] overflow-y-auto"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 dark:bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-900 dark:text-white">Ambient Noise Generator</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isMinimized ? 'Expand controls' : 'Minimize player'}
            aria-label={isMinimized ? 'Expand player' : 'Minimize player'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => onTogglePlay(volume)}
            className="p-1.5 text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause ambient sound' : 'Play selected ambient sound'}
            aria-label={isPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close ambient sound player"
            aria-label="Close ambient sound player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="space-y-3">
          {/* Active Profile Info */}
          <div className="p-2.5 rounded-xl border bg-sky-50/80 dark:bg-slate-900/60 border-sky-200/50 dark:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{activeProfile.name}</span>
              <span className="text-[10px] font-mono text-sky-700 dark:text-emerald-400 font-medium">
                {activeProfile.spectrum}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              {activeProfile.recommendedFor}
            </p>
            {!isPlaying && (
              <p className="mt-2 text-[11px] text-sky-700 dark:text-emerald-300">
                Ready when you are. Press Play to start; audio never starts automatically.
              </p>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 hover:dark:text-white'
              }`}
            >
              All ({SOUND_PROFILES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('soundscapes')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeCategoryFilter === 'soundscapes'
                  ? 'bg-sky-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 hover:dark:text-white'
              }`}
            >
              Soundscapes ({SOUND_PROFILES.filter((s) => s.category === 'Soundscape').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('noise')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeCategoryFilter === 'noise'
                  ? 'bg-sky-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 hover:dark:text-white'
              }`}
            >
              Color Noise ({SOUND_PROFILES.filter((s) => s.category !== 'Soundscape').length})
            </button>
          </div>

          {/* Sound selector grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
            {filteredProfiles.map((p) => {
              const isSelected = currentSound === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectSound(p.id)}
                  className={`py-1.5 px-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-sky-600 text-white font-semibold border-sky-500 shadow-sm dark:bg-emerald-500/25 dark:border-emerald-400 dark:text-white'
                      : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="block truncate font-medium">{p.name.replace('Pure ', '').replace('Deep ', '')}</span>
                </button>
              );
            })}
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 pt-1">
            <Volume2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              aria-label="Volume level"
              className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-sky-600 dark:accent-emerald-400"
            />
            <span className="w-8 text-right text-slate-800 dark:text-slate-200 font-bold">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Auto-off Sleep Timer */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Auto-off Timer:</span>
            </div>
            <div className="flex gap-1">
              {[15, 30, 45, 90, 0].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleTimerChange(m)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    timerMinutes === m
                      ? 'bg-sky-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m === 0 ? 'Off' : `${m}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isMinimized && (
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
              {activeProfile.name}
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
