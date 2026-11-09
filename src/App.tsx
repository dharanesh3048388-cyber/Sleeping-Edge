/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { NorthernLightsCanvas } from './components/NorthernLightsCanvas';
import { MannsPlanetCanvas } from './components/MannsPlanetCanvas';
import { Header } from './components/Header';
import { HeroCalculator } from './components/HeroCalculator';
import { NapOptimizer } from './components/NapOptimizer';
import { CaffeineCutoff } from './components/CaffeineCutoff';
import { SleepDebtPlanner } from './components/SleepDebtPlanner';
import { SleepArchitectureSection } from './components/SleepArchitectureSection';
import { PreferencesDrawer } from './components/PreferencesDrawer';
import { AmbientAudioBar } from './components/AmbientAudioBar';
import { Footer } from './components/Footer';
import { sleepAudio, AmbientSoundType, SOUND_PROFILES } from './utils/audioEngine';

const readPreference = (key: string): string | null => {
  try { return window.localStorage.getItem(key); } catch { return null; }
};
const writePreference = (key: string, value: string): void => {
  try { window.localStorage.setItem(key, value); } catch { /* Continue with in-memory state. */ }
};
const removePreference = (key: string): void => {
  try { window.localStorage.removeItem(key); } catch { /* Continue with in-memory state. */ }
};

const getRequestedAmbientSound = (): AmbientSoundType | null => {
  try {
    const requested = new URLSearchParams(window.location.search).get('sound');
    return SOUND_PROFILES.find((profile) => profile.id === requested)?.id ?? null;
  } catch {
    return null;
  }
};

export default function App() {
  // Respect the saved theme; use Northern Lights dark mode for first-time visitors.
  const [isDark, setIsDark] = useState<boolean>(() => readPreference('sleepingedge_theme') !== 'light');

  // Soundscape state. Deep links preselect and open a sound, but never autoplay it.
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>(() => getRequestedAmbientSound() ?? 'mountain_wind');
  const [isAudioOpen, setIsAudioOpen] = useState<boolean>(() => getRequestedAmbientSound() !== null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Settings / Calibration state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [latencyMinutes, setLatencyMinutes] = useState<number>(() => {
    const saved = Number(readPreference('sleepingedge_latency'));
    return Number.isFinite(saved) && saved >= 5 && saved <= 45 ? saved : 14;
  });
  const [cycleLength, setCycleLength] = useState<number>(() => {
    const saved = Number(readPreference('sleepingedge_cycle'));
    return Number.isFinite(saved) && saved >= 75 && saved <= 110 ? saved : 90;
  });
  const [is24Hour, setIs24Hour] = useState<boolean>(() => {
    return readPreference('sleepingedge_24h') === 'true';
  });
  const [ageGroup, setAgeGroup] = useState<string>(() => {
    return readPreference('sleepingedge_age') || 'adult';
  });

  const [activeSection, setActiveSection] = useState<string>('calculator');

  // Sync dark class on html tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    writePreference('sleepingedge_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Persist preferences
  const handleLatencyChange = (val: number) => {
    setLatencyMinutes(val);
    writePreference('sleepingedge_latency', val.toString());
  };

  const handleCycleLengthChange = (val: number) => {
    setCycleLength(val);
    writePreference('sleepingedge_cycle', val.toString());
  };

  const handleToggle24Hour = (val: boolean) => {
    setIs24Hour(val);
    writePreference('sleepingedge_24h', val.toString());
  };

  const handleAgeGroupChange = (val: string) => {
    setAgeGroup(val);
    writePreference('sleepingedge_age', val);
  };

  const handleResetDefaults = () => {
    setLatencyMinutes(14);
    setCycleLength(90);
    setIs24Hour(false);
    setAgeGroup('adult');
    removePreference('sleepingedge_latency');
    removePreference('sleepingedge_cycle');
    removePreference('sleepingedge_24h');
    removePreference('sleepingedge_age');
  };

  // Deep linking and SEO direct navigation (e.g. #caffeine-calculator, #sleep-calculator, or ?tool=caffeine)
  useLayoutEffect(() => {
    const resolveTarget = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get('tool')?.toLowerCase();
      const soundParam = params.get('sound');
      const hasSoundPreset = SOUND_PROFILES.some((profile) => profile.id === soundParam);

      if (hash.includes('ambient') || hasSoundPreset) {
        return 'sound';
      }
      if (hash.includes('caffeine') || toolParam?.includes('caffeine')) {
        return 'caffeine';
      }
      if (hash.includes('nap') || toolParam?.includes('nap')) {
        return 'naps';
      }
      if (hash.includes('debt') || hash.includes('recovery') || toolParam?.includes('debt')) {
        return 'recovery';
      }
      if (hash.includes('science') || hash.includes('stage') || hash.includes('architecture')) {
        return 'science';
      }
      if (hash.includes('calc') || toolParam?.includes('calc')) {
        return 'calculator';
      }
      return null;
    };

    const target = resolveTarget();
    if (!target) {
      // A normal reload should start at the top. Explicit hash/query deep links still work.
      window.scrollTo(0, 0);
      return;
    }
    if (target === 'sound') {
      setActiveSection('sound');
      setIsAudioOpen(true);
      // Keep the app at the top while the fixed, preselected sound player is opened.
      window.scrollTo(0, 0);
      return;
    }
    if (target) {
      setActiveSection(target);
      // Small timeout to allow full DOM mount
      const timer = window.setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          el.classList.add('transition-all', 'duration-500', 'ring-2', 'ring-sky-500/60', 'dark:ring-emerald-400/60');
          window.setTimeout(() => {
            el.classList.remove('ring-2', 'ring-sky-500/60', 'dark:ring-emerald-400/60');
          }, 2400);
        }
      }, 250);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      sleepAudio.stop();
      setIsAudioPlaying(false);
    } else {
      setIsAudioOpen(true);
      sleepAudio.play(selectedSound, 0.35);
      setIsAudioPlaying(true);
    }
  };

  const handleSelectSound = (type: AmbientSoundType) => {
    setSelectedSound(type);
    setIsAudioOpen(true);
    sleepAudio.play(type, 0.35);
    setIsAudioPlaying(true);
  };

  const handleCloseAudio = () => {
    sleepAudio.stop();
    setIsAudioPlaying(false);
    setIsAudioOpen(false);
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === 'sound') {
      setIsAudioOpen(true);
      window.scrollTo(0, 0);
      return;
    }
    // Keep in-page navigation local to the current view. Do not persist a section hash,
    // otherwise a browser refresh restores the previous section instead of the page top.
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-sky-500/30 dark:selection:bg-emerald-500/30 selection:text-sky-950 dark:selection:text-emerald-200">
      {/* Background Visual Themes */}
      {isDark ? <NorthernLightsCanvas /> : <MannsPlanetCanvas />}

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          isAudioPlaying={isAudioPlaying}
          onToggleAudio={handleToggleAudio}
          onOpenSettings={() => setIsSettingsOpen(true)}
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 pb-16">
          <HeroCalculator
            latencyMinutes={latencyMinutes}
            cycleLength={cycleLength}
            is24Hour={is24Hour}
          />

          <NapOptimizer
            latencyMinutes={latencyMinutes}
            is24Hour={is24Hour}
          />

          <CaffeineCutoff
            is24Hour={is24Hour}
          />

          <SleepDebtPlanner />

          <SleepArchitectureSection />
        </main>

        <Footer />
      </div>

      {/* Preferences Drawer / Modal */}
      <PreferencesDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        latencyMinutes={latencyMinutes}
        onChangeLatency={handleLatencyChange}
        cycleLength={cycleLength}
        onChangeCycleLength={handleCycleLengthChange}
        is24Hour={is24Hour}
        onToggle24Hour={handleToggle24Hour}
        ageGroup={ageGroup}
        onChangeAgeGroup={handleAgeGroupChange}
        onResetDefaults={handleResetDefaults}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Floating Ambient Soundscape Control */}
      <AmbientAudioBar
        isOpen={isAudioOpen}
        isPlaying={isAudioPlaying}
        currentSound={selectedSound}
        onSelectSound={handleSelectSound}
        onTogglePlay={handleToggleAudio}
        onClose={handleCloseAudio}
      />
    </div>
  );
}
