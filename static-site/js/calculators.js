/**
 * SleepingEdge - Core Sleep & Caffeine Science Engine (Vanilla JS)
 * Browser-side sleep timing and related arithmetic estimates.
 * Sleep-cycle lengths and caffeine clearance vary; outputs are illustrative only.
 * No external framework or analytics dependency is required.
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
        calculate();
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });

    if (timeInput) timeInput.addEventListener('input', calculate);
    if (latencyInput) latencyInput.addEventListener('input', calculate);

    function calculate() {
      if (feedback) feedback.textContent = '';
      const is24h = formatToggle ? formatToggle.checked : false;
      const latencyRaw = latencyInput ? latencyInput.value.trim() : '15';
      const latency = Number(latencyRaw);
      if (latencyRaw === '' || !Number.isInteger(latency) || latency < 0 || latency > 120) {
        if (feedback) feedback.textContent = 'Enter a fall-asleep buffer from 0 to 120 whole minutes.';
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }
      const safeLatency = latency;

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

        targetDate.setHours(hours, minutes, 0, 0);
        if (targetDate.getTime() <= now.getTime()) targetDate.setDate(targetDate.getDate() + 1);
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

        const qualityTag = (cycles * 1.5) + ' hours planned';
        let desc;
        if (cycles <= 4) desc = 'This duration is below the usual adult recommendation of at least 7 hours. Repeated short sleep may affect health and alertness.';
        else if (cycles === 5) desc = 'A 7.5-hour sleep opportunity falls within the commonly recommended adult range for many people. Individual needs vary.';
        else desc = 'A 9-hour sleep opportunity may suit some adults. Sleep needs vary by person and circumstance.';
        cardsHtml += '<div class="result-card">' + '<div class="result-card-badge">Illustrative option · ' + qualityTag + '</div>' + '<div class="result-time">' + formatTime(eventDate, is24h) + '</div>' + '<div class="result-meta">' + formatDuration(sleepMinutes) + ' sleep (' + formatDuration(totalBedMinutes) + ' in bed)</div>' + '<div class="result-desc">' + desc + '</div></div>';
      });

      if (resultsContainer) {
        const promptText = currentMode === 'wake_at' 
          ? `For a planned wake time of ${formatTime(targetDate, is24h)}, estimated bedtimes are:` 
          : (currentMode === 'sleep_now' ? 'If you try to sleep now, these are illustrative alarm options:' : `For a planned bedtime of ${formatTime(targetDate, is24h)}, estimated wake times are:`);

        resultsContainer.innerHTML = `
          <div class="results-heading">${promptText}</div>
          <div class="results-sub">Uses a ${safeLatency}-minute fall-asleep buffer and illustrative 90-minute intervals. Actual sleep cycles vary and cannot be predicted by this tool.</div>
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
      const mg = Number(mgInput.value);
      const halfLife = Number(halfLifeInput ? halfLifeInput.value : 5.5);
      const bedtimeVal = bedtimeInput.value.trim();
      const intakeVal = intakeInput ? intakeInput.value.trim() : '';

      if (!Number.isFinite(mg) || mg < 1 || mg > 1500) {
        if (feedback) feedback.textContent = 'Enter a caffeine amount from 1 to 1,500 mg.';
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }
      if (!Number.isFinite(halfLife) || halfLife < 3 || halfLife > 9.5) {
        if (feedback) feedback.textContent = 'Choose a half-life between 3 and 9.5 hours.';
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }

      if (mg > 400) {
        if (feedback) feedback.textContent = 'Note: If this is your total daily intake, more than 400 mg is above the FDA level generally considered not to be associated with negative effects for most healthy adults. Individual sensitivity and medical circumstances vary.';
      }

      const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
      if (!validTime(bedtimeVal)) {
        if (feedback) feedback.textContent = 'Please enter a valid target bedtime.';
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }
      if (intakeVal && !validTime(intakeVal)) {
        if (feedback) feedback.textContent = 'Please enter a valid caffeine intake time.';
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }

      // Track event
      if (window.trackCalcEvent) {
        window.trackCalcEvent('Calculate-Caffeine', { mg, halfLife });
      }

      const estimatedResidualTarget = 25; // illustrative modelling target only; not a proven safe or non-disruptive level
      let hoursNeeded = 0;
      if (mg > estimatedResidualTarget) {
        hoursNeeded = halfLife * (Math.log(mg / estimatedResidualTarget) / Math.log(2));
      }

      // Calculate latest cutoff time
      const bParts = bedtimeVal.split(':');
      const bHour = parseInt(bParts[0], 10);
      const bMin = parseInt(bParts[1], 10);

      const bedtime = new Date();
      bedtime.setHours(bHour, bMin, 0, 0);
      if (bedtime.getTime() <= Date.now()) bedtime.setDate(bedtime.getDate() + 1);

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
          <div class="results-sub">Modelled with a ${halfLife}-hour half-life and an illustrative ${estimatedResidualTarget} mg residual target. This target is not a guaranteed safe level.</div>
          <div class="results-grid">
            <div class="result-card optimal">
              <div class="result-card-badge">Illustrative timing estimate</div>
              <div class="result-time">${formatTime(cutoffTime, false)}</div>
              <div class="result-desc">To reach the illustrative target of about ${estimatedResidualTarget} mg by bedtime, finish your last sip before this hour (${Math.round(hoursNeeded * 10) / 10} hours before bed).</div>
            </div>
            ${currentActiveMg !== null ? `
              <div class="result-card ${currentActiveMg <= estimatedResidualTarget ? 'optimal' : ''}">
                <div class="result-card-badge">Residual at Bedtime</div>
                <div class="result-time">${currentActiveMg} mg</div>
                <div class="result-desc">${currentActiveMg <= estimatedResidualTarget ? 'The model estimates a lower residual amount. This does not guarantee that sleep will be unaffected.' : 'The model estimates a higher residual amount; caffeine may affect sleep differently from person to person.'}</div>
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
      const latencyRaw = latencyInput ? latencyInput.value.trim() : '10';
      const latency = Number(latencyRaw);
      if (latencyRaw === '' || !Number.isInteger(latency) || latency < 0 || latency > 60) {
        if (resultsContainer) resultsContainer.innerHTML = '<p class="input-feedback" role="alert">Enter a fall-asleep buffer from 0 to 60 whole minutes.</p>';
        return;
      }
      const safeLatency = latency;
      const now = new Date();
      const hour = now.getHours();
      const isLateAfternoon = hour >= 16;

      if (window.trackCalcEvent) {
        window.trackCalcEvent('Calculate-Nap', { hour });
      }

      const naps = [
        {
          name: 'Brief Nap', sleepDuration: 20, badge: 'Short rest', target: 'Brief nap opportunity',
          desc: 'A short nap around 10–20 minutes is a common starting point. Actual sleep onset and alertness after waking vary; grogginess is still possible.'
        },
        {
          name: 'Longer Nap', sleepDuration: 90, badge: 'Longer rest', target: 'Longer nap opportunity',
          desc: 'A longer nap allows more time for sleep but may cause grogginess after waking. Ninety minutes is not a guaranteed complete sleep cycle.'
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
          <div class="results-heading">Estimated nap alarm options (starting ${formatTime(now, false)})</div>
          <div class="results-sub">${isLateAfternoon ? 'A late nap may make it harder for some people to fall asleep at their usual bedtime.' : 'Choose a nap time that fits your schedule and leaves enough time before your usual bedtime.'}</div>
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

      let severity = 'No estimated shortfall';
      let advice = 'Your recorded total meets or exceeds the weekly target you entered. This simple comparison does not assess sleep quality or daytime alertness.';

      if (debt > 0) {
        severity = 'Estimated weekly shortfall';
        advice = 'This is the arithmetic difference from your chosen weekly target, not a precise amount that must be repaid. Prioritize regular, adequate sleep; seek professional advice for persistent sleepiness or sleep difficulties.';
      }

      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="results-heading">Weekly Sleep Hours Comparison</div>
          <div class="results-sub">Weekly Target: ${totalTarget} hrs · Logged: ${Math.round(totalActual * 10) / 10} hrs · Average: ${Math.round(avg * 10) / 10} hrs/night</div>
          <div class="results-grid">
            <div class="result-card ${debt <= 2 ? 'optimal' : ''}">
              <div class="result-card-badge">${severity}</div>
              <div class="result-time">${Math.round(debt * 10) / 10} Hours Below Target</div>
              <div class="result-desc">${advice}</div>
            </div>
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

      if (!Number.isFinite(bed) || !Number.isFinite(latency) || !Number.isFinite(awakenings) ||
          bed < 60 || bed > 900 || latency < 0 || latency > 180 ||
          awakenings < 0 || awakenings > 240 || latency + awakenings > bed) {
        if (resultsContainer) resultsContainer.innerHTML = '<p class="input-feedback" role="alert">Please enter valid values: time in bed 60–900 minutes, time to fall asleep 0–180 minutes, and awake time 0–240 minutes. Awake time cannot exceed time in bed.</p>';
        return;
      }

      const asleepMinutes = bed - latency - awakenings;
      const efficiency = bed > 0 ? Math.round((asleepMinutes / bed) * 1000) / 10 : 0;

      if (window.trackCalcEvent) {
        window.trackCalcEvent('Calculate-SleepEfficiency', { efficiency });
      }

      let rating = 'Estimated sleep efficiency';
      let tip = 'This estimate suggests a relatively high proportion of time in bed was spent asleep. It is not a diagnosis or a measure of sleep quality.';
      if (efficiency < 75) {
        rating = 'Lower estimated efficiency';
        tip = 'A lower estimate can have many causes and does not diagnose insomnia. If sleep difficulties persist, consider discussing them with a healthcare professional.';
      } else if (efficiency < 85) {
        rating = 'Moderate estimated efficiency';
        tip = 'This estimate alone cannot identify the cause. Consistent sleep habits and a comfortable sleep environment may help.';
      } else if (efficiency < 90) {
        rating = 'Higher estimated efficiency';
        tip = 'Sleep efficiency is one measure only; it does not establish whether sleep is restorative or healthy.';
      }

      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="results-heading">Sleep Efficiency Score</div>
          <div class="results-sub">Estimated ratio of time spent asleep versus total time in bed (not a clinical diagnosis)</div>
          <div class="results-grid">
            <div class="result-card">
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
