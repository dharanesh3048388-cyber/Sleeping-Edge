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
  nremDeepPercent: number;
  remPercent: number;
  nremLightPercent: number;
  summary: string;
}

export interface NapOption {
  id: 'power' | 'nasa' | 'full';
  name: string;
  durationMinutes: number;
  wakeTimeStr: string;
  wakeDate: Date;
  benefit: string;
  targetStages: string;
  riskOfInertia: 'None' | 'Very Low' | 'Moderate';
  circadianImpact: 'Safe' | 'Caution' | 'High Impact';
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
    note: 'Circadian phase naturally delays by ~2 hours during puberty.'
  },
  youngAdult: {
    group: 'Young Adults',
    ageRange: '18–25 years',
    recommendedHours: [7, 9],
    recommendedCycles: [5, 6],
    note: 'Critical window for neuroplasticity and memory consolidation.'
  },
  adult: {
    group: 'Adults',
    ageRange: '26–64 years',
    recommendedHours: [7, 9],
    recommendedCycles: [5, 6],
    note: '5 cycles (7.5 hours) is the sweet spot for peak cognitive and metabolic health.'
  },
  olderAdult: {
    group: 'Older Adults',
    ageRange: '65+ years',
    recommendedHours: [7, 8],
    recommendedCycles: [4.5, 5.5],
    note: 'Sleep architecture shifts with lighter sleep; consistent bedtimes become vital.'
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
  const results: CycleResult[] = [];
  
  // Cycles 6 down to 3
  const cycleCounts = [6, 5, 4, 3];

  cycleCounts.forEach((cycles) => {
    const sleepMinutes = cycles * cycleLength;
    const totalBedMinutes = sleepMinutes + latencyMinutes;
    const bedtime = new Date(wakeDate.getTime() - totalBedMinutes * 60 * 1000);

    let quality: CycleResult['quality'] = 'sufficient';
    let label = 'Sufficient';
    let summary = 'Covers basic restorative functions';

    if (cycles === 5) {
      quality = 'optimal';
      label = 'Optimal (Most Popular)';
      summary = '7.5 hrs of sleep. The sweet spot to wake up sharp, energized, and rested.';
    } else if (cycles === 6) {
      quality = 'recommended';
      label = 'Peak Recovery';
      summary = '9.0 hrs of sleep. Best for workouts, recovery, and catching up on rest.';
    } else if (cycles === 4) {
      quality = 'sufficient';
      label = 'Functional Minimum';
      summary = '6.0 hrs of sleep. Good for busy mornings without the heavy fog.';
    } else if (cycles === 3) {
      quality = 'minimum';
      label = 'Emergency Only';
      summary = '4.5 hrs of sleep. Quick recharge. Alert morning, but expect an afternoon dip.';
    }

    // Dynamic sleep stage proportions by cycle depth
    // Early cycles are deep-sleep heavy (N3), later cycles are REM heavy
    const nremDeepPercent = Math.max(15, Math.round(28 - (cycles - 3) * 2.5));
    const remPercent = Math.min(27, Math.round(18 + (cycles - 3) * 2.2));
    const nremLightPercent = 100 - nremDeepPercent - remPercent;

    results.push({
      cycles,
      timeStr: formatTimeDisplay(bedtime, is24Hour),
      date: bedtime,
      sleepMinutes,
      totalBedMinutes,
      quality,
      label,
      nremDeepPercent,
      remPercent,
      nremLightPercent,
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
  const results: CycleResult[] = [];
  const cycleCounts = [3, 4, 5, 6];

  cycleCounts.forEach((cycles) => {
    const sleepMinutes = cycles * cycleLength;
    const totalBedMinutes = sleepMinutes + latencyMinutes;
    const wakeTime = new Date(bedDate.getTime() + totalBedMinutes * 60 * 1000);

    let quality: CycleResult['quality'] = 'sufficient';
    let label = 'Sufficient';
    let summary = 'Covers basic restorative functions';

    if (cycles === 5) {
      quality = 'optimal';
      label = 'Optimal (Recommended)';
      summary = '7.5 hrs asleep. Leaves you energized with zero morning grogginess.';
    } else if (cycles === 6) {
      quality = 'recommended';
      label = 'Extended Recovery';
      summary = '9.0 hrs asleep. Deep physical and mental recharge.';
    } else if (cycles === 4) {
      quality = 'sufficient';
      label = 'Minimum Normal';
      summary = '6.0 hrs asleep. Clean wake-up for busy days.';
    } else if (cycles === 3) {
      quality = 'minimum';
      label = 'Short Night';
      summary = '4.5 hrs asleep. Alert at wake-up, but energy drops by late afternoon.';
    }

    const nremDeepPercent = Math.max(15, Math.round(28 - (cycles - 3) * 2.5));
    const remPercent = Math.min(27, Math.round(18 + (cycles - 3) * 2.2));
    const nremLightPercent = 100 - nremDeepPercent - remPercent;

    results.push({
      cycles,
      timeStr: formatTimeDisplay(wakeTime, is24Hour),
      date: wakeTime,
      sleepMinutes,
      totalBedMinutes,
      quality,
      label,
      nremDeepPercent,
      remPercent,
      nremLightPercent,
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
  const currentHour = currentTime.getHours();

  // If nap is after 4:30 PM (16:30), circadian impact increases
  const isLate = currentHour >= 16;
  const isVeryLate = currentHour >= 18;

  const options: NapOption[] = [
    {
      id: 'power',
      name: 'Power Nap',
      durationMinutes: 20,
      wakeDate: new Date(currentTime.getTime() + (20 + latencyMinutes) * 60 * 1000),
      wakeTimeStr: formatTimeDisplay(new Date(currentTime.getTime() + (20 + latencyMinutes) * 60 * 1000), is24Hour),
      benefit: 'Quick recharge for focus and reaction speed. Zero post-nap grogginess.',
      targetStages: 'Light sleep only (wakes before deep sleep starts)',
      riskOfInertia: 'None',
      circadianImpact: isVeryLate ? 'Caution' : 'Safe'
    },
    {
      id: 'nasa',
      name: 'NASA Fatigue Nap',
      durationMinutes: 26,
      wakeDate: new Date(currentTime.getTime() + (26 + latencyMinutes) * 60 * 1000),
      wakeTimeStr: formatTimeDisplay(new Date(currentTime.getTime() + (26 + latencyMinutes) * 60 * 1000), is24Hour),
      benefit: 'Proven pilot protocol: boosts alertness by 34% and working memory by 54%.',
      targetStages: 'Stage 2 light sleep (spindle memory lock)',
      riskOfInertia: 'Very Low',
      circadianImpact: isVeryLate ? 'Caution' : 'Safe'
    },
    {
      id: 'full',
      name: 'Full Cycle Reset',
      durationMinutes: 90,
      wakeDate: new Date(currentTime.getTime() + (90 + latencyMinutes) * 60 * 1000),
      wakeTimeStr: formatTimeDisplay(new Date(currentTime.getTime() + (90 + latencyMinutes) * 60 * 1000), is24Hour),
      benefit: 'Clears deep mental fatigue, resets creativity, and finishes a full dream cycle.',
      targetStages: 'Complete cycle: light sleep, deep repair, and dream sleep',
      riskOfInertia: 'Moderate',
      circadianImpact: isLate ? 'High Impact' : 'Safe'
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
  safeBedtimeMgThreshold: number = 25
): {
  activeMgAtBedtime: number;
  latestCutoffTime: Date;
  hoursNeededToClear: number;
  isSafeNow: boolean;
} {
  // Hours between intake and bedtime
  let diffMs = targetBedtime.getTime() - intakeTime.getTime();
  if (diffMs < 0) {
    // Bedtime is next day
    diffMs += 24 * 60 * 60 * 1000;
  }
  const hoursElapsed = diffMs / (1000 * 60 * 60);

  // Active mg at bedtime
  const activeMgAtBedtime = mg * Math.pow(0.5, hoursElapsed / halfLifeHours);

  // How many hours needed to drop to safe threshold?
  // threshold = mg * (0.5)^(t / halfLife)
  // t = halfLife * log2(mg / threshold)
  const hoursNeededToClear = mg > safeBedtimeMgThreshold
    ? halfLifeHours * (Math.log(mg / safeBedtimeMgThreshold) / Math.log(2))
    : 0;

  const latestCutoffTime = new Date(targetBedtime.getTime() - hoursNeededToClear * 60 * 60 * 1000);
  const isSafeNow = activeMgAtBedtime <= safeBedtimeMgThreshold;

  return {
    activeMgAtBedtime: Math.max(0, Math.round(activeMgAtBedtime * 10) / 10),
    latestCutoffTime,
    hoursNeededToClear: Math.round(hoursNeededToClear * 10) / 10,
    isSafeNow
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
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  recoveryStrategy: string;
  recommendedDailyBonusMinutes: number;
} {
  const totalActual = past7DaysActualHours.reduce((sum, h) => sum + h, 0);
  const totalTarget = dailyTargetHours * past7DaysActualHours.length;
  const debt = Math.max(0, totalTarget - totalActual);
  const average = totalActual / (past7DaysActualHours.length || 1);

  let severity: 'None' | 'Mild' | 'Moderate' | 'Severe' = 'None';
  let recoveryStrategy = 'Your sleep reserve is fully stocked! Maintain this regular rhythm.';
  let recommendedDailyBonusMinutes = 0;

  if (debt >= 8) {
    severity = 'Severe';
    recoveryStrategy = 'Add +45 to +60 minutes to your sleep window for the next 7-10 nights. Avoid sleeping in >1.5 hours on weekends to prevent circadian social jetlag.';
    recommendedDailyBonusMinutes = 60;
  } else if (debt >= 4) {
    severity = 'Moderate';
    recoveryStrategy = 'Add +30 minutes of bedtime buffer every night this week, paired with a 20-minute afternoon power nap around 1:30 PM.';
    recommendedDailyBonusMinutes = 30;
  } else if (debt > 0.5) {
    severity = 'Mild';
    recoveryStrategy = 'Easily repayable in 2 nights by going to bed 15-20 minutes earlier than normal.';
    recommendedDailyBonusMinutes = 20;
  }

  return {
    totalDebtHours: Math.round(debt * 10) / 10,
    averageSleepHours: Math.round(average * 10) / 10,
    severity,
    recoveryStrategy,
    recommendedDailyBonusMinutes
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
  rating: 'Exceptional' | 'Normal' | 'Fragmented' | 'Poor';
  advice: string;
} {
  const actualAsleepMinutes = Math.max(0, timeInBedMinutes - timeToFallAsleepMinutes - awakeningsMinutes);
  const efficiency = timeInBedMinutes > 0 ? (actualAsleepMinutes / timeInBedMinutes) * 100 : 0;
  const rounded = Math.round(efficiency * 10) / 10;

  if (rounded >= 90) {
    return {
      efficiencyPercent: rounded,
      rating: 'Exceptional',
      advice: 'Your sleep continuity is top-tier. Virtually no restorative time is lost.'
    };
  } else if (rounded >= 85) {
    return {
      efficiencyPercent: rounded,
      rating: 'Normal',
      advice: 'Healthy baseline. Over 85% sleep efficiency indicates solid, restorative continuity.'
    };
  } else if (rounded >= 75) {
    return {
      efficiencyPercent: rounded,
      rating: 'Fragmented',
      advice: 'Mild sleep fragmentation. Consider reducing evening screen blue light and avoiding alcohol within 3 hours of bed.'
    };
  } else {
    return {
      efficiencyPercent: rounded,
      rating: 'Poor',
      advice: 'High awake time in bed can condition insomnia. If awake for >20 min, get out of bed in dim light until drowsy.'
    };
  }
}
