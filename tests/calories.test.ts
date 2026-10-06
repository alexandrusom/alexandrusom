import { describe, expect, it } from "vitest";
import {
  calculatePlan,
  cmToFtIn,
  ftInToCm,
  kgToLb,
  lbToKg,
  minHealthyWeightKg,
  type CalorieInput,
} from "../supabase/functions/_shared/calories";

const base: CalorieInput = {
  sex: "male",
  age: 30,
  heightCm: 180,
  weightKg: 85,
  goalWeightKg: 78,
  weeks: 12,
  activity: "moderate",
};

describe("calculatePlan", () => {
  it("returns a deficit plan for a realistic fat-loss goal", () => {
    // BMR 1830, maintenance 1830 * 1.55 = 2836.5, deficit 7 kg * 7700 / 84 days = 641.7
    const result = calculatePlan(base);
    expect(result).toEqual({
      ok: true,
      plan: {
        goal: "lose",
        bmr: 1830,
        maintenanceCalories: 2840,
        targetCalories: 2190,
        dailyAdjustment: -640,
        weeklyChangeKg: -0.58,
      },
    });
  });

  it("returns maintenance when the goal equals current weight", () => {
    const result = calculatePlan({ ...base, goalWeightKg: 85 });
    expect(result.ok && result.plan).toMatchObject({ goal: "maintain", targetCalories: 2840, dailyAdjustment: 0 });
  });

  it("flags a goal faster than recommended as ambitious, but still gives the result", () => {
    // 5 kg in 5 weeks: faster than recommended, above the calorie floor and within 2%/week
    const result = calculatePlan({ ...base, weightKg: 80, goalWeightKg: 75, weeks: 5 });
    expect(result).toEqual({
      ok: true,
      plan: {
        goal: "lose",
        bmr: 1780,
        maintenanceCalories: 2760,
        targetCalories: 1660,
        dailyAdjustment: -1100,
        weeklyChangeKg: -1,
        warning: { level: "ambitious", recommendedWeeklyKg: 0.62 },
      },
    });
  });

  it("shows a target below the calorie floor with a danger warning", () => {
    const result = calculatePlan({
      sex: "female",
      age: 30,
      heightCm: 170,
      weightKg: 65,
      goalWeightKg: 60,
      weeks: 5,
      activity: "moderate",
    });
    expect(result.ok && result.plan).toMatchObject({
      targetCalories: 1070,
      warning: { level: "dangerous", belowFloor: true, calorieFloor: 1200, tooFast: false, maxWeeklyPct: 2 },
    });
  });

  it("shows very fast gain with a danger warning", () => {
    const result = calculatePlan({
      sex: "male",
      age: 25,
      heightCm: 175,
      weightKg: 70,
      goalWeightKg: 80,
      weeks: 12,
      activity: "moderate",
    });
    expect(result.ok && result.plan).toMatchObject({
      goal: "gain",
      targetCalories: 3510,
      warning: { level: "dangerous", belowFloor: false, tooFast: true, maxWeeklyPct: 1 },
    });
  });

  it("warns when maintenance is already near the calorie floor", () => {
    const result = calculatePlan({
      sex: "female",
      age: 75,
      heightCm: 150,
      weightKg: 45,
      goalWeightKg: 43,
      weeks: 20,
      activity: "sedentary",
    });
    expect(result.ok && result.plan).toMatchObject({ targetCalories: 910, warning: { level: "dangerous", belowFloor: true } });
  });

  it("never shows a target below the medical minimum of 800 kcal", () => {
    expect(calculatePlan({ ...base, goalWeightKg: 70, weeks: 8 })).toEqual({
      ok: false,
      issue: { code: "below_medical_minimum", medicalMinimum: 800 },
    });
    const extreme = calculatePlan({ ...base, age: 40, weightKg: 150, goalWeightKg: 80, weeks: 20, activity: "sedentary" });
    expect(!extreme.ok && extreme.issue.code).toBe("below_medical_minimum");
  });

  it("does not warn about a healthy surplus for heavier people", () => {
    const result = calculatePlan({ ...base, weightKg: 140, goalWeightKg: 145, weeks: 52 });
    expect(result.ok && result.plan.warning).toBeUndefined();
  });

  it("flags a goal weight below a healthy BMI", () => {
    const result = calculatePlan({
      sex: "female",
      age: 28,
      heightCm: 165,
      weightKg: 55,
      goalWeightKg: 48,
      weeks: 20,
      activity: "light",
    });
    expect(result).toEqual({ ok: false, issue: { code: "goal_below_healthy_bmi", minHealthyWeightKg: 50.4 } });
  });

  it("rejects under-18s and out-of-range values", () => {
    expect(calculatePlan({ ...base, age: 16 })).toEqual({ ok: false, issue: { code: "under_18" } });
    expect(calculatePlan({ ...base, heightCm: 250 })).toEqual({
      ok: false,
      issue: { code: "out_of_range", field: "heightCm", min: 140, max: 220 },
    });
    expect(!calculatePlan({ ...base, weeks: Number.NaN }).ok).toBe(true);
  });
});

describe("helpers", () => {
  it("computes the lowest healthy weight from height", () => {
    expect(minHealthyWeightKg(180)).toBe(60);
  });

  it("converts units both ways", () => {
    expect(lbToKg(kgToLb(80))).toBeCloseTo(80, 10);
    expect(ftInToCm(5, 11)).toBeCloseTo(180.34, 2);
    expect(cmToFtIn(180)).toEqual({ ft: 5, in: 11 });
  });
});
