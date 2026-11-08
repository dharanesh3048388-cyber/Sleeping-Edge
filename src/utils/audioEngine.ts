/**
 * SleepingEdge Sleep Audio Synthesizer
 * High-precision procedural Web Audio API sound generator.
 * Zero external audio files, zero bandwidth, zero latency.
 * Engineered to match medical-grade white/pink noise sleep machines
 * and high-fidelity ambient soundscapes.
 */

export type AmbientSoundType =
  | 'pink_noise'
  | 'brown_noise'
  | 'white_noise'
  | 'mountain_wind'
  | 'deep_ocean'
  | 'solar_storm'
  | 'arctic_wind'
  | 'binaural_delta'
  | 'celestial_drone'
  | 'rain_skylight';

export interface SoundProfile {
  id: AmbientSoundType;
  name: string;
  tagline: string;
  category: 'Clinical Color Noise' | 'Soundscape' | 'Brainwave Entrainment';
  recommendedFor: string;
  spectrum: string;
}

export const SOUND_PROFILES: SoundProfile[] = [
  // --- Atmospheric Soundscapes ---
  {
    id: 'mountain_wind',
    name: 'Mountain Wind',
    tagline: 'High-altitude pine & alpine pass gale',
    category: 'Soundscape',
    recommendedFor: 'Deep respiratory grounding & cold mountain atmosphere',
    spectrum: 'Dual-pole resonant sweep'
  },
  {
    id: 'deep_ocean',
    name: 'Deep Ocean',
    tagline: 'Subsurface oceanic tidal swell & abyssal rumble',
    category: 'Soundscape',
    recommendedFor: 'Womb-like tranquility & slow breathing rhythm',
    spectrum: 'Infrasonic wave surge (40–180Hz)'
  },
  {
    id: 'solar_storm',
    name: 'Solar Storm',
    tagline: 'Cosmic plasma drone & heliosphere flux',
    category: 'Soundscape',
    recommendedFor: 'Silencing racing thoughts & meditative sleep induction',
    spectrum: 'Harmonic plasma resonance'
  },
  {
    id: 'arctic_wind',
    name: 'Glacial Arctic Wind',
    tagline: 'Mann’s Planet atmospheric wind',
    category: 'Soundscape',
    recommendedFor: 'Immersive alpine tranquility & cool wind drift',
    spectrum: 'Dynamic resonant sweep'
  },
  {
    id: 'celestial_drone',
    name: 'Celestial Cosmic Drone',
    tagline: 'Warm analog harmonic pads',
    category: 'Soundscape',
    recommendedFor: 'Bedtime meditation, winding down & tension release',
    spectrum: 'Rich harmonic detuned 5ths'
  },
  {
    id: 'rain_skylight',
    name: 'Midnight Rain on Glass',
    tagline: 'Organic stochastic rain cadence',
    category: 'Soundscape',
    recommendedFor: 'Continuous natural rhythmic soothing',
    spectrum: 'Acoustic stochastic filter'
  },

  // --- Clinical Color Noise & Entrainment ---
  {
    id: 'pink_noise',
    name: 'Pure Pink Noise',
    tagline: '1/f equal energy per octave',
    category: 'Clinical Color Noise',
    recommendedFor: 'Synchronizes slow-wave deep sleep & memory storage',
    spectrum: 'Balanced warmth (-3dB/oct)'
  },
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    tagline: '1/f² low-frequency acoustic warmth',
    category: 'Clinical Color Noise',
    recommendedFor: 'Quieting racing thoughts, ADHD calm & anxiety relief',
    spectrum: 'Heavy deep rumble (-6dB/oct)'
  },
  {
    id: 'white_noise',
    name: 'Pure White Noise',
    tagline: 'Uniform multi-frequency sound shield',
    category: 'Clinical Color Noise',
    recommendedFor: 'Acoustic masking for traffic, snoring & city sounds',
    spectrum: 'Full spectrum flat'
  },
  {
    id: 'binaural_delta',
    name: 'Binaural Delta (2.5 Hz)',
    tagline: '108 Hz + 110.5 Hz carrier sine waves',
    category: 'Brainwave Entrainment',
    recommendedFor: 'Inducing deep delta sleep state (best with headphones)',
    spectrum: 'Sub-harmonic carrier'
  }
];

class SleepAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private currentSound: AmbientSoundType = 'mountain_wind';
  private stopTimerId: number | null = null;
  private activeNodes: (AudioNode | number)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public play(type: AmbientSoundType, volume: number = 0.35) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentSound = type;
    this.isRunning = true;
    this.setVolume(volume);

    switch (type) {
      case 'mountain_wind':
        this.startMountainWind();
        break;
      case 'deep_ocean':
        this.startDeepOcean();
        break;
      case 'solar_storm':
        this.startSolarStorm();
        break;
      case 'pink_noise':
        this.startPinkNoise();
        break;
      case 'brown_noise':
        this.startBrownNoise();
        break;
      case 'white_noise':
        this.startWhiteNoise();
        break;
      case 'arctic_wind':
        this.startArcticWind();
        break;
      case 'binaural_delta':
        this.startBinauralDelta();
        break;
      case 'celestial_drone':
        this.startCelestialDrone();
        break;
      case 'rain_skylight':
        this.startRainSkylight();
        break;
    }
  }

  public stop() {
    if (this.stopTimerId) {
      window.clearTimeout(this.stopTimerId);
      this.stopTimerId = null;
    }

    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // Safe disconnection cleanup
        }
      }
    });

    this.activeNodes = [];
    this.isRunning = false;
  }

  public setAutoOff(minutes: number) {
    if (this.stopTimerId) {
      window.clearTimeout(this.stopTimerId);
      this.stopTimerId = null;
    }
    if (minutes > 0) {
      this.stopTimerId = window.setTimeout(() => {
        this.stop();
      }, minutes * 60 * 1000);
    }
  }

  public getState() {
    return {
      isPlaying: this.isRunning,
      currentSound: this.currentSound
    };
  }

  // --- 1. Mountain Wind (Alpine pass gale with dual resonant filters) ---
  private startMountainWind() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Warm filtered pink noise buffer
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.055;
      b1 = 0.99332 * b1 + white * 0.075;
      b2 = 0.96900 * b2 + white * 0.15;
      b3 = 0.86650 * b3 + white * 0.31;
      output[i] = (b0 + b1 + b2 + b3) * 0.14;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter 1: Deep mountain gorge resonant body
    const gorgeFilter = ctx.createBiquadFilter();
    gorgeFilter.type = 'bandpass';
    gorgeFilter.frequency.setValueAtTime(220, ctx.currentTime);
    gorgeFilter.Q.setValueAtTime(2.2, ctx.currentTime);

    // Filter 2: High alpine crag ridge howl
    const ridgeFilter = ctx.createBiquadFilter();
    ridgeFilter.type = 'bandpass';
    ridgeFilter.frequency.setValueAtTime(540, ctx.currentTime);
    ridgeFilter.Q.setValueAtTime(3.6, ctx.currentTime);

    // Asynchronous dual LFOs for natural mountain gusts
    const lfo1 = ctx.createOscillator();
    lfo1.frequency.setValueAtTime(0.065, ctx.currentTime); // ~15-second mountain wave
    const lfoGain1 = ctx.createGain();
    lfoGain1.gain.setValueAtTime(110, ctx.currentTime);
    lfo1.connect(lfoGain1);
    lfoGain1.connect(gorgeFilter.frequency);

    const lfo2 = ctx.createOscillator();
    lfo2.frequency.setValueAtTime(0.14, ctx.currentTime); // ~7-second gust wave
    const lfoGain2 = ctx.createGain();
    lfoGain2.gain.setValueAtTime(190, ctx.currentTime);
    lfo2.connect(lfoGain2);
    lfoGain2.connect(ridgeFilter.frequency);

    const merger = ctx.createGain();
    merger.gain.setValueAtTime(1.1, ctx.currentTime);

    noiseSource.connect(gorgeFilter);
    noiseSource.connect(ridgeFilter);
    gorgeFilter.connect(merger);
    ridgeFilter.connect(merger);
    merger.connect(this.masterGain);

    noiseSource.start();
    lfo1.start();
    lfo2.start();

    this.activeNodes.push(noiseSource, gorgeFilter, ridgeFilter, lfo1, lfo2, lfoGain1, lfoGain2, merger);
  }

  // --- 2. Deep Ocean (Subsurface tidal swell & abyssal rumble) ---
  private startDeepOcean() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Brownian motion noise generator
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 4.0;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Deep lowpass filter (ocean water absorbs high frequencies completely)
    const oceanFilter = ctx.createBiquadFilter();
    oceanFilter.type = 'lowpass';
    oceanFilter.frequency.setValueAtTime(170, ctx.currentTime);
    oceanFilter.Q.setValueAtTime(1.6, ctx.currentTime);

    // Swell swell gain modulated by slow tidal LFO (9-second wave period)
    const swellGain = ctx.createGain();
    swellGain.gain.setValueAtTime(0.5, ctx.currentTime);

    const swellLfo = ctx.createOscillator();
    swellLfo.frequency.setValueAtTime(0.11, ctx.currentTime); // 9 sec cycle
    const swellLfoGain = ctx.createGain();
    swellLfoGain.gain.setValueAtTime(0.38, ctx.currentTime);

    swellLfo.connect(swellLfoGain);
    swellLfoGain.connect(swellGain.gain);

    // Infrasonic deep rumble sine wave (44 Hz) simulating ocean pressure
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(44.0, ctx.currentTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.06, ctx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    noiseSource.connect(oceanFilter);
    oceanFilter.connect(swellGain);
    swellGain.connect(this.masterGain);

    noiseSource.start();
    swellLfo.start();
    subOsc.start();

    this.activeNodes.push(noiseSource, oceanFilter, swellGain, swellLfo, swellLfoGain, subOsc, subGain);
  }

  // --- 3. Solar Storm (Cosmic plasma drone & heliosphere flux) ---
  private startSolarStorm() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Planetary electromagnetic chord: 55Hz (A1), 82.4Hz (E2), 110Hz (A2), 164.8Hz (E3)
    const frequencies = [55.0, 82.4, 110.0, 164.8];
    const oscillators: OscillatorNode[] = [];
    const plasmaGain = ctx.createGain();
    plasmaGain.gain.setValueAtTime(0.14, ctx.currentTime);

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Subtle organic detuning for shimmer
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.3 : idx === 3 ? -0.35 : 0), ctx.currentTime);
      osc.connect(plasmaGain);
      osc.start();
      oscillators.push(osc);
    });

    // Modulated pink noise plasma stream
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.08;
      b1 = 0.95 * b1 + white * 0.12;
      output[i] = (b0 + b1) * 0.09;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Sweeping solar flare bandpass filter
    const plasmaFilter = ctx.createBiquadFilter();
    plasmaFilter.type = 'bandpass';
    plasmaFilter.frequency.setValueAtTime(340, ctx.currentTime);
    plasmaFilter.Q.setValueAtTime(2.8, ctx.currentTime);

    const fluxLfo = ctx.createOscillator();
    fluxLfo.frequency.setValueAtTime(0.045, ctx.currentTime); // ~22 sec cosmic sweep
    const fluxLfoGain = ctx.createGain();
    fluxLfoGain.gain.setValueAtTime(140, ctx.currentTime);

    fluxLfo.connect(fluxLfoGain);
    fluxLfoGain.connect(plasmaFilter.frequency);

    noiseSource.connect(plasmaFilter);
    plasmaFilter.connect(plasmaGain);

    // Warm master lowpass
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(420, ctx.currentTime);

    plasmaGain.connect(masterFilter);
    masterFilter.connect(this.masterGain);

    noiseSource.start();
    fluxLfo.start();

    this.activeNodes.push(...oscillators, noiseSource, plasmaFilter, fluxLfo, fluxLfoGain, plasmaGain, masterFilter);
  }

  // --- 4. Pure Clinical Pink Noise ---
  private startPinkNoise() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(7500, ctx.currentTime);

    source.connect(filter);
    filter.connect(this.masterGain);
    source.start();

    this.activeNodes.push(source, filter);
  }

  // --- 5. Deep Brown Noise ---
  private startBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.8;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, ctx.currentTime);

    source.connect(filter);
    filter.connect(this.masterGain);
    source.start();

    this.activeNodes.push(source, filter);
  }

  // --- 6. Pure White Noise ---
  private startWhiteNoise() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.18;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(11000, ctx.currentTime);

    source.connect(filter);
    filter.connect(this.masterGain);
    source.start();

    this.activeNodes.push(source, filter);
  }

  // --- 7. Glacial Arctic Wind ---
  private startArcticWind() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.055;
      b1 = 0.99332 * b1 + white * 0.075;
      b2 = 0.96900 * b2 + white * 0.15;
      output[i] = (b0 + b1 + b2) * 0.16;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(2.2, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(190, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);

    whiteNoise.start();
    lfo.start();

    this.activeNodes.push(whiteNoise, filter, lfo, lfoGain);
  }

  // --- 8. Binaural Delta ---
  private startBinauralDelta() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const merger = ctx.createChannelMerger(2);

    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(108.0, ctx.currentTime);

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(110.5, ctx.currentTime);

    const gainL = ctx.createGain();
    const gainR = ctx.createGain();
    gainL.gain.setValueAtTime(0.24, ctx.currentTime);
    gainR.gain.setValueAtTime(0.24, ctx.currentTime);

    oscLeft.connect(gainL);
    oscRight.connect(gainR);

    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.activeNodes.push(oscLeft, oscRight, gainL, gainR, merger);
  }

  // --- 9. Celestial Cosmic Drone ---
  private startCelestialDrone() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const freqs = [65.41, 98.0, 130.81, 164.81];
    const oscillators: OscillatorNode[] = [];
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.12, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, ctx.currentTime);

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f + (idx % 2 === 0 ? 0.35 : -0.35), ctx.currentTime);
      osc.connect(droneGain);
      osc.start();
      oscillators.push(osc);
    });

    droneGain.connect(filter);
    filter.connect(this.masterGain);

    this.activeNodes.push(...oscillators, droneGain, filter);
  }

  // --- 10. Midnight Rain on Glass ---
  private startRainSkylight() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.05 * white) / 1.05;
      lastOut = data[i];
      if (Math.random() < 0.003) {
        data[i] += (Math.random() - 0.5) * 0.45;
      }
      data[i] *= 1.8;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    source.connect(filter);
    filter.connect(this.masterGain);
    source.start();

    this.activeNodes.push(source, filter);
  }
}

export const sleepAudio = new SleepAudioEngine();
