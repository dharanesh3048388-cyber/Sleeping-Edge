import { describe, expect, test } from "bun:test";
import {
  calculateBedtimesForWake,
  calculateWakeTimesForBed,
  calculateNapOptions,
  calculateCaffeineCutoff,
  calculateSleepDebt,
  calculateSleepEfficiency,
  formatTimeDisplay
} from "../src/utils/sleepScience";

describe("sleep timing estimates", () => {
  test("calculates bedtime options from a wake time and latency", () => {
    const wake = new Date(2026, 0, 2, 7, 0, 0, 0);
    const results = calculateBedtimesForWake(wake, 15, 90, true);
    expect(results.map((r) => r.date.getTime())).toEqual([
      new Date(2026, 0, 1, 21, 45).getTime(),
      new Date(2026, 0, 1, 23, 15).getTime(),
      new Date(2026, 0, 2, 0, 45).getTime(),
      new Date(2026, 0, 2, 2, 15).getTime()
    ]);
    expect(results[1].sleepMinutes).toBe(450);
    expect(results[1].totalBedMinutes).toBe(465);
  });

  test("calculates wake options across midnight", () => {
    const bedtime = new Date(2026, 0, 1, 23, 0, 0, 0);
    const results = calculateWakeTimesForBed(bedtime, 15, 90, true);
    expect(results[2].date.getDate()).toBe(2);
    expect(results[2].date.getHours()).toBe(6);
    expect(results[2].date.getMinutes()).toBe(45);
  });

  test("rejects invalid timing inputs", () => {
    expect(() => calculateBedtimesForWake(new Date(NaN), 15, 90)).toThrow(RangeError);
    expect(() => calculateWakeTimesForBed(new Date(), -1, 90)).toThrow(RangeError);
    expect(() => calculateWakeTimesForBed(new Date(), 15, 0)).toThrow(RangeError);
  });

  test("nap estimates contain only the supported brief and longer options", () => {
    const start = new Date(2026, 0, 1, 23, 55, 0, 0);
    const results = calculateNapOptions(start, 10, true);
    expect(results.map((r) => r.durationMinutes)).toEqual([20, 90]);
    expect(results[0].wakeDate.getDate()).toBe(2);
    expect(results[0].wakeDate.getHours()).toBe(0);
    expect(results[0].wakeDate.getMinutes()).toBe(25);
  });

  test("models caffeine decay with the exponential half-life formula", () => {
    const bedtime = new Date(2026, 0, 1, 23, 0, 0, 0);
    const intake = new Date(2026, 0, 1, 14, 0, 0, 0);
    const result = calculateCaffeineCutoff(200, bedtime, intake, 5.5, 25);
    expect(result.activeMgAtBedtime).toBeCloseTo(200 * Math.pow(0.5, 9 / 5.5), 1);
    expect(result.hoursNeededToClear).toBeCloseTo(16.5, 1);
    expect(result.latestCutoffTime.getHours()).toBe(6);
    expect(result.latestCutoffTime.getMinutes()).toBe(30);
    expect(result.isBelowIllustrativeReference).toBe(false);
  });

  test("handles caffeine consumed the previous day", () => {
    const bedtime = new Date(2026, 0, 2, 7, 0, 0, 0);
    const intake = new Date(2026, 0, 1, 22, 0, 0, 0);
    const result = calculateCaffeineCutoff(100, bedtime, intake, 5, 25);
    expect(result.activeMgAtBedtime).toBe(28.7);
  });

  test("rejects invalid caffeine parameters", () => {
    expect(() => calculateCaffeineCutoff(0, new Date(), new Date())).toThrow(RangeError);
    expect(() => calculateCaffeineCutoff(100, new Date(), new Date(), 0)).toThrow(RangeError);
  });
});

describe("sleep duration comparisons", () => {
  test("calculates weekly difference without calling it biological sleep debt", () => {
    const result = calculateSleepDebt(8, [7, 6, 8, 8, 7, 9, 8]);
    expect(result.totalDebtHours).toBe(3);
    expect(result.totalTargetHours).toBe(56);
    expect(result.totalActualHours).toBe(53);
    expect(result.averageSleepHours).toBeCloseTo(7.6, 1);
  });

  test("requires exactly seven valid daily values", () => {
    expect(() => calculateSleepDebt(8, [7, 7])).toThrow(RangeError);
    expect(() => calculateSleepDebt(8, [7, 7, 7, 7, 7, 7, 25])).toThrow(RangeError);
  });

  test("calculates estimated sleep efficiency from supplied durations", () => {
    const result = calculateSleepEfficiency(480, 20, 15);
    expect(result.efficiencyPercent).toBe(92.7);
    expect(result.rating).toBe("Higher estimate");
  });

  test("rejects impossible sleep efficiency inputs", () => {
    expect(() => calculateSleepEfficiency(480, 200, 0)).toThrow(RangeError);
    expect(() => calculateSleepEfficiency(60, 50, 20)).toThrow(RangeError);
  });
});

test("formats midnight correctly", () => {
  const midnight = new Date(2026, 0, 1, 0, 5);
  expect(formatTimeDisplay(midnight, true)).toBe("00:05");
  expect(formatTimeDisplay(midnight, false)).toBe("12:05 AM");
});
