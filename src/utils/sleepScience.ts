/**
 * SleepingEdge Sleep Science Core Engine
 * 
 * Based on peer-reviewed sleep medicine and chronobiology guidelines:
 * - AASM (American Academy of Sleep Medicine)
 * - NSF (National Sleep Foundation)
 * - Horne-Östberg Morningness-Eveningness principles
 */

export interface CycleResult {
  cycles: number;
  timeStr: string; // formatted HH:MM AM/PM or 24h
  date: Date;
  sleepMinutes: number; // actual asleep duration
  totalBedMinutes: number; // asleep duration + latency
  quality: 'optimal' | 'recommended' | 'sufficient' | 'minimum' | 'short';
  label: string;
  summary: string;
}

export interface NapOption {
  id: 'power' | 'full';
  name: string;
  durationMinutes: number;
  wakeTimeStr: string;
  wakeDate: Date;
  benefit: string;
  targetStages: string;
  riskOfInertia: 'Variable';
  circadianImpact: 'Consider usual bedtime';
}

export interface AgeGuideline {
  group: string;
  ageRange: string;
  recommendedHours: [number, number]; // min, max
  recommendedCycles: [number, number];
  note: string;
}

export const AGE_GUIDELINES: Record<string, AgeGuideline> = {
  teen: {
    group: 'Teens',
    ageRange: '14–17 years',
    recommendedHours: [8, 10],
    recommendedCycles: [5, 7],
    note: 'A later body-clock timing is common during adolescence.'
  },
  youngAdult: {
    group: 'Young Adults',
    ageRange: '18–25 years',
    recommendedHours: [7, 9],
    recommendedCycles: [5, 6],
    note: 'Sleep needs and schedules vary across individuals.'
  },
  adult: {
    group: 'Adults',
    ageRange: '26–64 years',
    recommendedHours: [7, 9],
    recommendedCycles: [5, 6],
    note: 'Sleep needs vary. Most adults in this age range should regularly get at least 7 hours; individual needs can be higher.'
  },
  olderAdult: {
    group: 'Older Adults',
    ageRange: '65+ years',
    recommendedHours: [7, 8],
    recommendedCycles: [4.5, 5.5],
    note: 'Sleep patterns can change with age; individual needs vary.'
  }
};

/**
 * Parses time string like "07:00" or "19:30" or creates Date from hour/minute
 */
export function createTimeDate(hours: number, minutes: number, baseDate: Date = new Date()): Date {
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function formatTimeDisplay(date: Date, is24Hour: boolean = false): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const padMin = minutes < 10 ? `0${minutes}` : `${minutes}`;

  if (is24Hour) {
    const padHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${padHours}:${padMin}`;
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12 AM
  return `${hours}:${padMin} ${ampm}`;
}

export function formatDurationHoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculates optimal bedtimes given a desired wake time.
 * Formula: Bedtime = WakeTime - (cycles * cycleLength + latencyMinutes)
 */
export function calculateBedtimesForWake(
  wakeDate: Date,
  latencyMinutes: number = 14,
  cycleLength: number = 90,
  is24Hour: boolean = false
): CycleResult[] {
  if (!Number.isFinite(wakeDate.getTime()) || !Number.isFinite(latencyMinutes) || latencyMinutes < 0 || latencyMinutes > 120 || !Number.isFinite(cycleLength) || cycleLength < 60 || cycleLength > 120) {
    throw new RangeError('Wake time, latency (0–120 minutes), and interval (60–120 minutes) must be valid.');
  }
  const results: CycleResult[] = [];
  
  // Cycles 6 down to 3
  const cycleCounts = [6, 5, 4, 3];

  cycleCounts.forEach((cycles) => {
    const sleepMinutes = cycles * cycleLength;
    const totalBedMinutes = sleepMinutes + latencyMinutes;
    const bedtime = new Date(wakeDate.getTime() - totalBedMinutes * 60 * 1000);

    let quality: CycleResult['quality'] = 'sufficient';
    let label = 'Illustrative timing option';
    let summary = 'A timing estimate only. It does not predict sleep stages or how refreshed you will feel.';

    if (cycles === 5) {
      quality = 'recommended';
      label = `${formatDurationHoursMinutes(sleepMinutes)} sleep opportunity`;
      summary = sleepMinutes < 420
        ? 'Below the usual adult recommendation when obtained regularly.'
        : sleepMinutes <= 540
          ? 'Within a commonly recommended adult sleep-duration range for many people. Individual needs vary.'
          : 'A longer sleep opportunity may suit some people. Individual needs vary.';
    } else if (cycles === 6) {
      quality = 'recommended';
      label = `${formatDurationHoursMinutes(sleepMinutes)} sleep opportunity`;
      summary = sleepMinutes < 420
        ? 'Below the usual adult recommendation when obtained regularly.'
        : sleepMinutes <= 540
          ? 'Within a commonly recommended adult sleep-duration range for many people. Individual needs vary.'
          : 'A longer sleep opportunity may suit some people. Individual needs vary.';
    } else if (cycles === 4) {
      quality = 'short';
      label = `${formatDurationHoursMinutes(sleepMinutes)} sleep opportunity`;
      summary = sleepMinutes < 420
        ? 'Below the usual adult recommendation when obtained regularly.'
        : 'A longer sleep opportunity may suit some people. Individual needs vary.';
    } else if (cycles === 3) {
      quality = 'short';
      label = `${formatDurationHoursMinutes(sleepMinutes)} sleep opportunity`;
      summary = 'Below the usual adult recommendation when obtained regularly. It should not be treated as a regular target.';
    }

    results.push({
      cycles,
      timeStr: formatTimeDisplay(bedtime, is24Hour),
      date: bedtime,
      sleepMinutes,
      totalBedMinutes,
      quality,
      label,
      summary
    });
  });

  return results;
}

/**
 * Calculates optimal wake times given a planned bedtime or current time.
 * Formula: WakeTime = Bedtime + latencyMinutes + (cycles * cycleLength)
 */
export function calculateWakeTimesForBed(
  bedDate: Date,
  latencyMinutes: number = 14,
  cycleLength: number = 90,
  is24Hour: boolean = false
): CycleResult[] {
  if (!Number.isFinite(bedDate.getTime()) || !Number.isFinite(latencyMinutes) || latencyMinutes < 0 || latencyMinutes > 120 || !Number.isFinite(cycleLength) || cycleLength < 60 || cycleLength > 120) {
    throw new RangeError('Bedtime, latency (0–120 minutes), and interval (60–120 minutes) must be valid.');
  }
  const results: CycleResult[] = [];
  const cycleCounts = [3, 4, 5, 6];

  cycleCounts.forEach((cycles) => {
    const sleepMinutes = cycles * cycleLength;
    const totalBedMinutes = sleepMinutes + latencyMinutes;
    const wakeTime = new Date(bedDate.getTime() + totalBedMinutes * 60 * 1000);

    let quality: CycleResult['quality'] = 'sufficient';
    let label = 'Illustrative timing option';
    let summary = 'A timing estimate only. It does not predict sleep stages or how refreshed you will feel.';

    if (cycles === 5) {
      quality = 'recommended';
      label = '7.5-hour sleep opportunity';
      summary = 'Falls within the commonly recommended duration range for many adults. Individual sleep needs vary.';
    } else if (cycles === 6) {
      quality = 'recommended';
      label = '9-hour sleep opportunity';
      summary = 'A longer sleep opportunity may suit some people. Individual sleep needs vary.';
    } else if (cycles === 4) {
      quality = 'short';
      label = '6-hour sleep opportunity';
      summary = 'Below the usual minimum recommendation for adults when obtained regularly.';
    } else if (cycles === 3) {
      quality = 'short';
      label = '4.5-hour sleep opportunity';
      summary = 'A short sleep opportunity and below adult recommendations. It should not be treated as a regular target.';
    }

    results.push({
      cycles,
      timeStr: formatTimeDisplay(wakeTime, is24Hour),
      date: wakeTime,
      sleepMinutes,
      totalBedMinutes,
      quality,
      label,
      summary
    });
  });

  return results;
}

/**
 * Calculates nap options based on current time
 */
export function calculateNapOptions(
  currentTime: Date,
  latencyMinutes: number = 10,
  is24Hour: boolean = false
): NapOption[] {
  if (!Number.isFinite(currentTime.getTime()) || !Number.isInteger(latencyMinutes) || latencyMinutes < 0 || latencyMinutes > 60) {
    throw new RangeError('Nap start time and latency (0–60 whole minutes) must be valid.');
  }
  const options: NapOption[] = [
    {
      id: 'power',
      name: 'Brief nap option',
      durationMinutes: 20,
      wakeDate: new Date(currentTime.getTime() + (20 + latencyMinutes) * 60 * 1000),
      wakeTimeStr: formatTimeDisplay(new Date(currentTime.getTime() + (20 + latencyMinutes) * 60 * 1000), is24Hour),
      benefit: 'A short nap opportunity may help with alertness for some people. Sleep onset and how you feel after waking vary.',
      targetStages: 'Sleep stages cannot be predicted from nap duration alone.',
      riskOfInertia: 'Variable',
      circadianImpact: 'Consider usual bedtime'
    },
    {
      id: 'full',
      name: 'Longer nap option',
      durationMinutes: 90,
      wakeDate: new Date(currentTime.getTime() + (90 + latencyMinutes) * 60 * 1000),
      wakeTimeStr: formatTimeDisplay(new Date(currentTime.getTime() + (90 + latencyMinutes) * 60 * 1000), is24Hour),
      benefit: 'A longer nap provides more time for sleep, but may leave some people groggy or make nighttime sleep harder.',
      targetStages: 'A 90-minute nap is not a guaranteed complete sleep cycle.',
      riskOfInertia: 'Variable',
      circadianImpact: 'Consider usual bedtime'
    }
  ];

  return options;
}

/**
 * Caffeine decay calculator: C(t) = C0 * 0.5^(t / halfLife)
 */
export interface CaffeineBeverage {
  id: string;
  name: string;
  defaultMg: number;
  category: string;
}

export const CAFFEINE_PRESETS: CaffeineBeverage[] = [
  { id: 'drip', name: 'Drip Coffee (12 oz)', defaultMg: 140, category: 'Coffee' },
  { id: 'coldbrew', name: 'Cold Brew (16 oz)', defaultMg: 200, category: 'Coffee' },
  { id: 'espresso', name: 'Espresso (Single shot)', defaultMg: 64, category: 'Coffee' },
  { id: 'double_espresso', name: 'Double Espresso', defaultMg: 128, category: 'Coffee' },
  { id: 'energy_drink', name: 'Energy Drink (16 oz)', defaultMg: 160, category: 'Energy' },
  { id: 'matcha', name: 'Matcha Latte', defaultMg: 70, category: 'Tea' },
  { id: 'black_tea', name: 'Black Tea (8 oz)', defaultMg: 47, category: 'Tea' },
  { id: 'green_tea', name: 'Green Tea (8 oz)', defaultMg: 30, category: 'Tea' },
  { id: 'diet_soda', name: 'Diet Cola (12 oz)', defaultMg: 45, category: 'Soda' }
];

export function calculateCaffeineCutoff(
  mg: number,
  targetBedtime: Date,
  intakeTime: Date,
  halfLifeHours: number = 5.5,
  illustrativeReferenceMg: number = 25
): {
  activeMgAtBedtime: number;
  latestCutoffTime: Date;
  hoursNeededToClear: number;
  isBelowIllustrativeReference: boolean;
} {
  if (!Number.isFinite(mg) || mg <= 0 || mg > 1500 || !Number.isFinite(halfLifeHours) || halfLifeHours < 3 || halfLifeHours > 9.5 || !Number.isFinite(illustrativeReferenceMg) || illustrativeReferenceMg <= 0 || !Number.isFinite(targetBedtime.getTime()) || !Number.isFinite(intakeTime.getTime())) {
    throw new RangeError('Caffeine amount, half-life, reference amount, and times must be valid.');
  }

  // Hours between intake and bedtime
  let diffMs = targetBedtime.getTime() - intakeTime.getTime();
  if (diffMs < 0) {
    // Bedtime is next day
    diffMs += 24 * 60 * 60 * 1000;
  }
  const hoursElapsed = diffMs / (1000 * 60 * 60);

  // Active mg at bedtime
  const activeMgAtBedtime = mg * Math.pow(0.5, hoursElapsed / halfLifeHours);

  // Time required to reach an illustrative reference amount; this is not a safety threshold.
  // reference = mg * (0.5)^(t / halfLife)
  const hoursNeededToClear = mg > illustrativeReferenceMg
    ? halfLifeHours * (Math.log(mg / illustrativeReferenceMg) / Math.log(2))
    : 0;

  const latestCutoffTime = new Date(targetBedtime.getTime() - hoursNeededToClear * 60 * 60 * 1000);
  const isBelowIllustrativeReference = activeMgAtBedtime <= illustrativeReferenceMg;

  return {
    activeMgAtBedtime: Math.max(0, Math.round(activeMgAtBedtime * 10) / 10),
    latestCutoffTime,
    hoursNeededToClear: Math.round(hoursNeededToClear * 10) / 10,
    isBelowIllustrativeReference
  };
}

/**
 * Sleep debt & recovery calculator
 */
export function calculateSleepDebt(
  dailyTargetHours: number,
  past7DaysActualHours: number[]
): {
  totalDebtHours: number;
  averageSleepHours: number;
  totalActualHours: number;
  totalTargetHours: number;
} {
  if (!Number.isFinite(dailyTargetHours) || dailyTargetHours < 4 || dailyTargetHours > 12 || past7DaysActualHours.length !== 7 || past7DaysActualHours.some((h) => !Number.isFinite(h) || h < 0 || h > 24)) {
    throw new RangeError('Provide a daily target from 4–12 hours and exactly seven daily sleep values from 0–24 hours.');
  }
  const totalActual = past7DaysActualHours.reduce((sum, h) => sum + h, 0);
  const totalTarget = dailyTargetHours * past7DaysActualHours.length;
  const shortfall = Math.max(0, totalTarget - totalActual);
  const average = totalActual / (past7DaysActualHours.length || 1);

  return {
    totalDebtHours: Math.round(shortfall * 10) / 10,
    averageSleepHours: Math.round(average * 10) / 10,
    totalActualHours: Math.round(totalActual * 10) / 10,
    totalTargetHours: Math.round(totalTarget * 10) / 10
  };
}

/**
 * Sleep Efficiency: (asleep minutes / total bed minutes) * 100
 */
export function calculateSleepEfficiency(
  timeInBedMinutes: number,
  timeToFallAsleepMinutes: number,
  awakeningsMinutes: number
): {
  efficiencyPercent: number;
  rating: 'Higher estimate' | 'Mid-range estimate' | 'Lower estimate';
  advice: string;
} {
  if (!Number.isFinite(timeInBedMinutes) || !Number.isFinite(timeToFallAsleepMinutes) || !Number.isFinite(awakeningsMinutes) || timeInBedMinutes < 60 || timeInBedMinutes > 900 || timeToFallAsleepMinutes < 0 || timeToFallAsleepMinutes > 180 || awakeningsMinutes < 0 || awakeningsMinutes > 240 || timeToFallAsleepMinutes + awakeningsMinutes > timeInBedMinutes) {
    throw new RangeError('Sleep efficiency inputs are outside the supported ranges.');
  }
  const actualAsleepMinutes = Math.max(0, timeInBedMinutes - timeToFallAsleepMinutes - awakeningsMinutes);
  const efficiency = timeInBedMinutes > 0 ? (actualAsleepMinutes / timeInBedMinutes) * 100 : 0;
  const rounded = Math.round(efficiency * 10) / 10;

  if (rounded >= 90) {
    return {
      efficiencyPercent: rounded,
      rating: 'Higher estimate',
      advice: 'A larger share of your reported time in bed was spent asleep. This estimate does not measure sleep quality or health.'
    };
  } else if (rounded >= 85) {
    return {
      efficiencyPercent: rounded,
      rating: 'Higher estimate',
      advice: 'This is only a time ratio based on your estimates; it cannot establish whether sleep was restorative.'
    };
  } else if (rounded >= 75) {
    return {
      efficiencyPercent: rounded,
      rating: 'Mid-range estimate',
      advice: 'This estimate alone cannot identify why you were awake or diagnose a sleep problem.'
    };
  } else {
    return {
      efficiencyPercent: rounded,
      rating: 'Lower estimate',
      advice: 'A lower estimate can have many causes. If sleep difficulties persist, discuss them with a qualified healthcare professional.'
    };
  }
}
