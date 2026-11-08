/**
 * SleepingEdge - Core Sleep & Caffeine Science Engine (Vanilla JS)
 * High-precision algorithms based on AASM & NSF sleep guidelines.
 * Features:
 * - 90-minute sleep cycles with standard 15-minute fall-asleep buffer
 * - Robust input validation & friendly inline error states
 * - Dual 12-hour (AM/PM) and 24-hour time formatting
 * - Zero external framework dependencies
 */

(function () {
  'use strict';

  // --- Utility Functions ---

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatTime(date, is24h) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    if (is24h) {
      return `${pad(hours)}:${pad(minutes)}`;
    }
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 is 12 AM
    return `${hours}:${pad(minutes)} ${ampm}`;
  }

  function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }

  // --- 1. SLEEP CYCLE & BEDTIME CALCULATOR ---
  window.initSleepCalculator = function () {
    const form = document.getElementById('sleep-calc-form');
    if (!form) return;

    const modeTabs = document.querySelectorAll('.sleep-mode-tab');
    const inputTimeWrap = document.getElementById('sleep-input-time-wrap');
    const timeInput = document.getElementById('sleep-time');
    const ampmSelect = document.getElementById('sleep-ampm');
    const formatToggle = document.getElementById('sleep-format-24h');
    const latencyInput = document.getElementById('sleep-latency');
    const feedback = document.getElementById('sleep-calc-feedback');
    const resultsContainer = document.getElementById('sleep-calc-results');

    let currentMode = 'wake_at'; // 'wake_at', 'sleep_now', 'bed_at'

    // Tab switcher
    modeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        modeTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.getAttribute('data-mode');

        if (currentMode === 'sleep_now') {
          inputTimeWrap.style.display = 'none';
        } else {
          inputTimeWrap.style.display = 'block';
          const label = document.getElementById('sleep-time-label');
          if (label) {
            label.textContent = currentMode === 'wake_at' ? 'Desired Wake-Up Time' : 'Planned Bedtime';
          }
        }
        calculate();
      });
    });

    if (formatToggle) {
      formatToggle.addEventListener('change', () => {
        const is24h = formatToggle.checked;
        if (ampmSelect) {
          ampmSelect.style.display = is24h ? 'none' : 'block';
        }
        calculate();
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });

    if (timeInput) timeInput.addEventListener('input', calculate);
    if (ampmSelect) ampmSelect.addEventListener('change', calculate);
    if (latencyInput) latencyInput.addEventListener('input', calculate);

    function calculate() {
      if (feedback) feedback.textContent = '';
      const is24h = formatToggle ? formatToggle.checked : false;
      const latency = parseInt(latencyInput ? latencyInput.value : '15', 10);
      const safeLatency = isNaN(latency) || latency < 0 ? 15 : Math.min(latency, 120);

      const cycleLength = 90; // minutes
      const now = new Date();
      let targetDate = new Date();

      if (currentMode !== 'sleep_now') {
        const timeVal = timeInput ? timeInput.value.trim() : '';
        if (!timeVal) {
          if (feedback) feedback.textContent = 'Please enter a valid time (e.g., 07:00).';
          return;
        }

        const parts = timeVal.split(':');
        if (parts.length !== 2) {
          if (feedback) feedback.textContent = 'Use HH:MM format.';
          return;
        }

        let hours = parseInt(parts[0], 10);
        let minutes = parseInt(parts[1], 10);

        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          if (feedback) feedback.textContent = 'Hours must be 0–23 and minutes 0–59.';
          return;
        }

        if (!is24h) {
          const ampm = ampmSelect ? ampmSelect.value : 'AM';
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }

        targetDate.setHours(hours, minutes, 0, 0);
      }

      // Track Plausible event
      if (window.trackCalcEvent) {
        window.trackCalcEvent('Calculate-Sleep', { mode: currentMode });
      }

      // Calculate Cycle Results
      let cardsHtml = '';
      const cycleCounts = currentMode === 'wake_at' ? [6, 5, 4, 3] : [3, 4, 5, 6];

      cycleCounts.forEach((cycles) => {
        const sleepMinutes = cycles * cycleLength;
        const totalBedMinutes = sleepMinutes + safeLatency;
        let eventDate;

        if (currentMode === 'wake_at') {
          eventDate = new Date(targetDate.getTime() - totalBedMinutes * 60 * 1000);
        } else if (currentMode === 'sleep_now') {
          eventDate = new Date(now.getTime() + totalBedMinutes * 60 * 1000);
        } else {
          eventDate = new Date(targetDate.getTime() + totalBedMinutes * 60 * 1000);
        }

        const isOptimal = cycles === 5;
        let qualityTag = 'Sufficient';
        let desc = `${cycles * 1.5} hrs asleep. Good recovery for busy days.`;

        if (cycles === 6) {
          qualityTag = 'Peak Recovery';
          desc = '9.0 hrs asleep. Recommended for physical healing and memory consolidation.';
        } else if (cycles === 5) {
          qualityTag = 'Optimal (Recommended)';
          desc = '7.5 hrs asleep. The natural human adult sweet spot for sharp mental clarity.';
        } else if (cycles === 3) {
          qualityTag = 'Short Sleep';
          desc = '4.5 hrs asleep. Quick recharge; prevents morning grogginess but energy drops later.';
        }

        cardsHtml += `
          <div class="result-card ${isOptimal ? 'optimal' : ''}">
            <div class="result-card-badge">${qualityTag} · ${cycles} Cycles</div>
            <div class="result-time">${formatTime(eventDate, is24h)}</div>
            <div class="result-meta">${formatDuration(sleepMinutes)} sleep (${formatDuration(totalBedMinutes)} in bed)</div>
            <div class="result-desc">${desc}</div>
          </div>
        `;
      });

      if (resultsContainer) {
        const promptText = currentMode === 'wake_at' 
          ? `To wake refreshed at ${formatTime(targetDate, is24h)}, drift off to sleep at:` 
          : (currentMode === 'sleep_now' ? 'If you drift off now, set your alarm for:' : `Going to bed at ${formatTime(targetDate, is24h)}, set your alarm for:`);

        resultsContainer.innerHTML = `
          <div class="results-heading">${promptText}</div>
          <div class="results-sub">Factoring in ${safeLatency} min to fall asleep + complete 90-min cycles</div>
          <div class="results-grid ${cycleCounts.length === 4 ? 'results-grid-4' : ''}">
            ${cardsHtml}
          </div>
        `;
      }
    }

    calculate();
  };

  // --- 2. CAFFEINE CUTOFF CALCULATOR ---
  window.initCaffeineCalculator = function () {
    const form = document.getElementById('caffeine-calc-form');
    if (!form) return;

    const presetSelect = document.getElementById('caffeine-preset');
    const mgInput = document.getElementById('caffeine-mg');
    const bedtimeInput = document.getElementById('caffeine-bedtime');
    const intakeInput = document.getElementById('caffeine-intake');
    const halfLifeInput = document.getElementById('caffeine-halflife');
    const halfLifeValDisplay = document.getElementById('halflife-val');
    const feedback = document.getElementById('caffeine-feedback');
    const resultsContainer = document.getElementById('caffeine-results');

    if (halfLifeInput && halfLifeValDisplay) {
      halfLifeInput.addEventListener('input', () => {
        halfLifeValDisplay.textContent = `${halfLifeInput.value} hours`;
      });
    }

    if (presetSelect && mgInput) {
      presetSelect.addEventListener('change', () => {
        if (presetSelect.value) {
          mgInput.value = presetSelect.value;
          calculate();
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });

    [mgInput, bedtimeInput, intakeInput, halfLifeInput].forEach((el) => {
      if (el) el.addEventListener('input', calculate);
    });

    function calculate() {
      if (feedback) feedback.textContent = '';
      const mg = parseFloat(mgInput.value);
      const halfLife = parseFloat(halfLifeInput ? halfLifeInput.value : '5.5');
      const bedtimeVal = bedtimeInput.value.trim();
      const intakeVal = intakeInput ? intakeInput.value.trim() : '';

      if (isNaN(mg) || mg <= 0) {
        if (feedback) feedback.textContent = 'Please enter a positive caffeine amount (e.g., 140 mg).';
        return;
      }

      if (mg > 1200) {
        if (feedback) feedback.textContent = 'Note: Daily caffeine intake above 400 mg may cause jitteriness and heart palpitations according to the FDA.';
      }

      if (!bedtimeVal) {
        if (feedback) feedback.textContent = 'Please select your target bedtime.';
        return;
      }

      // Track event
      if (window.trackCalcEvent) {
        window.trackCalcEvent('Calculate-Caffeine', { mg, halfLife });
      }

      const safeThreshold = 25; // mg at bedtime considered non-disruptive
      let hoursNeeded = 0;
      if (mg > safeThreshold) {
        hoursNeeded = halfLife * (Math.log(mg / safeThreshold) / Math.log(2));
      }

      // Calculate latest cutoff time
      const bParts = bedtimeVal.split(':');
      const bHour = parseInt(bParts[0], 10);
      const bMin = parseInt(bParts[1], 10);

      const bedtime = new Date();
      bedtime.setHours(bHour, bMin, 0, 0);

      const cutoffTime = new Date(bedtime.getTime() - hoursNeeded * 60 * 60 * 1000);

      // Current intake status if provided
      let currentActiveMg = null;
      if (intakeVal) {
        const iParts = intakeVal.split(':');
        const iHour = parseInt(iParts[0], 10);
        const iMin = parseInt(iParts[1], 10);
        const intake = new Date();
        intake.setHours(iHour, iMin, 0, 0);

        let diffMs = bedtime.getTime() - intake.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
        const elapsedHours = diffMs / (1000 * 60 * 60);
        currentActiveMg = Math.round(mg * Math.pow(0.5, elapsedHours / halfLife) * 10) / 10;
      }

      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="results-heading">Your Caffeine Cutoff Analysis</div>
          <div class="results-sub">Based on a metabolic half-life of ${halfLife} hours and a ${safeThreshold} mg sleep-friendly threshold</div>
          <div class="results-grid">
            <div class="result-card optimal">
              <div class="result-card-badge">Daily Caffeine Cutoff</div>
              <div class="result-time">${formatTime(cutoffTime, false)}</div>
              <div class="result-desc">To reach &lt;${safeThreshold} mg by bedtime, finish your last sip before this hour (${Math.round(hoursNeeded * 10) / 10} hours before bed).</div>
            </div>
            ${currentActiveMg !== null ? `
              <div class="result-card ${currentActiveMg <= safeThreshold ? 'optimal' : ''}">
                <div class="result-card-badge">Residual at Bedtime</div>
                <div class="result-time">${currentActiveMg} mg</div>
                <div class="result-desc">${currentActiveMg <= safeThreshold ? 'Safe zone! Your caffeine level will not disrupt REM or deep sleep.' : 'Caution: High residual caffeine will block adenosine receptors and delay deep sleep.'}</div>
              </div>
            ` : ''}
          </div>
        `;
      }
    }

    calculate();
  };

  // --- 3. POWER NAP CALCULATOR ---
  window.initNapCalculator = function () {
    const form = document.getElementById('nap-calc-form');
    if (!form) return;

    const latencyInput = document.getElementById('nap-latency');
    const resultsContainer = document.getElementById('nap-results');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });

    if (latencyInput) latencyInput.addEventListener('input', calculate);

    function calculate() {
      const latency = parseInt(latencyInput ? latencyInput.value : '10', 10);
      const safeLatency = isNaN(latency) || latency < 0 ? 10 : latency;
      const now = new Date();
      const hour = now.getHours();
      const isLateAfternoon = hour >= 16;

      if (window.trackCalcEvent) {
        window.trackCalcEvent('Calculate-Nap', { hour });
      }

      const naps = [
        {
          name: 'The Power Nap',
          sleepDuration: 20,
          badge: 'Fast Refresh',
          target: 'Stage 2 Light Sleep',
          desc: 'Wakes before deep slow-wave sleep starts. Boosts alertness, mood, and reaction time without any grogginess.'
        },
        {
          name: 'The NASA Pilot Nap',
          sleepDuration: 26,
          badge: 'NASA Tested',
          target: 'Motor Memory Lock',
          desc: 'NASA military study confirmed a 34% increase in pilot alertness and 54% gain in working memory efficiency.'
        },
        {
          name: 'Full Sleep Cycle Nap',
          sleepDuration: 90,
          badge: 'Full Recovery',
          target: 'Deep NREM + Dream REM',
          desc: 'Complete architectural cycle. Clears heavy mental exhaustion and sparks creative problem-solving.'
        }
      ];

      let cardsHtml = '';
      naps.forEach((nap) => {
        const totalMinutes = nap.sleepDuration + safeLatency;
        const wakeTime = new Date(now.getTime() + totalMinutes * 60 * 1000);
        cardsHtml += `
          <div class="result-card">
            <div class="result-card-badge">${nap.badge}</div>
            <div class="result-time">${formatTime(wakeTime, false)}</div>
            <div class="result-meta">Set alarm for ${totalMinutes} min (${nap.sleepDuration} min nap + ${safeLatency} min drift-off)</div>
            <div class="result-desc">${nap.desc}</div>
          </div>
        `;
      });

      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="results-heading">Optimal Nap Alarms (Starting Now: ${formatTime(now, false)})</div>
          <div class="results-sub">${isLateAfternoon ? '⚠️ Warning: It is past 4:00 PM. Napping late in the day can reduce your bedtime sleep drive (adenosine).' : 'Ideal afternoon circadian dip window.'}</div>
          <div class="results-grid">
            ${cardsHtml}
          </div>
        `;
      }
    }

    calculate();
  };

  // --- 4. SLEEP DEBT CALCULATOR ---
  window.initSleepDebtCalculator = function () {
    const form = document.getElementById('debt-calc-form');
    if (!form) return;

    const targetInput = document.getElementById('debt-target-hours');
    const feedback = document.getElementById('debt-feedback');
    const resultsContainer = document.getElementById('debt-results');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });

    function calculate() {
      if (feedback) feedback.textContent = '';
      const target = parseFloat(targetInput.value);
      if (isNaN(target) || target < 4 || target > 12) {
        if (feedback) feedback.textContent = 'Please enter a target between 4.0 and 12.0 hours (typically 7.5 to 8.5).';
        return;
      }

      let totalActual = 0;
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      for (let i = 0; i < days.length; i++) {
        const input = document.getElementById(`debt-day-${days[i]}`);
        const val = parseFloat(input ? input.value : '7.5');
        if (isNaN(val) || val < 0 || val > 24) {
          if (feedback) feedback.textContent = 'Daily sleep hours must be between 0 and 24.';
          return;
        }
        totalActual += val;
      }

      if (window.trackCalcEvent) {
        window.trackCalcEvent('Calculate-SleepDebt', { target, totalActual });
      }

      const totalTarget = target * 7;
      const debt = Math.max(0, totalTarget - totalActual);
      const avg = totalActual / 7;

      let severity = 'None (Fully Rested)';
      let advice = 'Your sleep reserve is in top shape! Maintain your current sleep timing.';
      let bonusMins = 0;

      if (debt >= 8) {
        severity = 'Severe Sleep Deficit';
        advice = 'Add +45 to +60 minutes to your sleep window for the next 7-10 nights. Avoid sleeping in >1.5 hours on weekends to prevent circadian social jetlag.';
        bonusMins = 60;
      } else if (debt >= 4) {
        severity = 'Moderate Sleep Deficit';
        advice = 'Go to bed 30 minutes earlier every night this week, paired with a 20-minute afternoon power nap around 1:30 PM.';
        bonusMins = 30;
      } else if (debt > 0.5) {
        severity = 'Mild Deficit';
        advice = 'Easily repayable in 2 nights by going to bed 15-20 minutes earlier than normal.';
        bonusMins = 20;
      }

      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="results-heading">Weekly Sleep Debt Summary</div>
          <div class="results-sub">Weekly Target: ${totalTarget} hrs · Logged: ${Math.round(totalActual * 10) / 10} hrs · Average: ${Math.round(avg * 10) / 10} hrs/night</div>
          <div class="results-grid">
            <div class="result-card ${debt <= 2 ? 'optimal' : ''}">
              <div class="result-card-badge">${severity}</div>
              <div class="result-time">${Math.round(debt * 10) / 10} Hours Debt</div>
              <div class="result-desc">${advice}</div>
            </div>
            ${bonusMins > 0 ? `
              <div class="result-card">
                <div class="result-card-badge">Daily Recovery Buffer</div>
                <div class="result-time">+${bonusMins} min / night</div>
                <div class="result-desc">Shift your bedtime earlier by this duration until your weekly balance normalizes.</div>
              </div>
            ` : ''}
          </div>
        `;
      }
    }

    calculate();
  };

  // --- 5. SLEEP STAGES & EFFICIENCY CALCULATOR ---
  window.initStagesCalculator = function () {
    const form = document.getElementById('stages-calc-form');
    if (!form) return;

    const bedMinutesInput = document.getElementById('stages-bed-minutes');
    const latencyInput = document.getElementById('stages-latency');
    const awakeningsInput = document.getElementById('stages-awakenings');
    const resultsContainer = document.getElementById('stages-results');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });

    function calculate() {
      const bed = parseFloat(bedMinutesInput.value);
      const latency = parseFloat(latencyInput.value);
      const awakenings = parseFloat(awakeningsInput.value);

      if (isNaN(bed) || bed <= 0) return;

      const asleepMinutes = Math.max(0, bed - latency - awakenings);
      const efficiency = bed > 0 ? Math.round((asleepMinutes / bed) * 1000) / 10 : 0;

      if (window.trackCalcEvent) {
        window.trackCalcEvent('Calculate-SleepEfficiency', { efficiency });
      }

      let rating = 'Exceptional';
      let tip = 'Your sleep continuity is excellent with virtually zero lost restorative time.';
      if (efficiency < 75) {
        rating = 'Poor (Sleep Fragmentation)';
        tip = 'High time awake in bed can condition cognitive insomnia. If unable to sleep after 20 minutes, leave bed in dim light.';
      } else if (efficiency < 85) {
        rating = 'Fragmented';
        tip = 'Consider cutting off blue screens 1 hour before bed and eliminating evening alcohol.';
      } else if (efficiency < 90) {
        rating = 'Normal & Healthy';
        tip = 'Over 85% sleep efficiency indicates solid, restorative continuity.';
      }

      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="results-heading">Sleep Efficiency Score</div>
          <div class="results-sub">Clinical ratio of time spent asleep versus total time in bed</div>
          <div class="results-grid">
            <div class="result-card ${efficiency >= 85 ? 'optimal' : ''}">
              <div class="result-card-badge">${rating}</div>
              <div class="result-time">${efficiency}%</div>
              <div class="result-meta">${Math.round(asleepMinutes)} min actual sleep / ${bed} min in bed</div>
              <div class="result-desc">${tip}</div>
            </div>
          </div>
        `;
      }
    }

    calculate();
  };
})();
