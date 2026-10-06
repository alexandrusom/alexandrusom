// Calorie engine shared by the website (calculator) and the submit-lead Edge Function.
// Keep this file free of imports so it runs unchanged in Node, the browser and Deno.

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "gain" | "maintain";

export const ACTIVITY_LEVELS: Record<ActivityLevel, { multiplier: number; label: string; description: string }> = {
  sedentary: { multiplier: 1.2, label: "Sedentary", description: "Desk job, little or no exercise" },
  light: { multiplier: 1.375, label: "Lightly active", description: "Training 1–3 days a week" },
  moderate: { multiplier: 1.55, label: "Moderately active", description: "Training 3–5 days a week" },
  active: { multiplier: 1.725, label: "Very active", description: "Training 6–7 days a week" },
  very_active: { multiplier: 1.9, label: "Extremely active", description: "Physical job plus daily training" },
};

export const LIMITS = {
  age: { min: 18, max: 80 },
  heightCm: { min: 140, max: 220 },
  weightKg: { min: 40, max: 250 },
  weeks: { min: 2, max: 52 },
  minHealthyBmi: 18.5,
  // Recommended pace. Goals faster than this still get a result, flagged as "ambitious".
  /** Recommended loss: up to 1% of body weight per week. */
  maxWeeklyLossPct: 0.01,
  /** Recommended lean gain: up to 0.5% of body weight per week. Faster is mostly fat. */
  maxWeeklyGainPct: 0.005,
  maxDailySurplus: 500,
  /** Recommended deficit: at most 25% below maintenance. */
  maxDeficitPct: 0.25,

  // Danger limits. Goals beyond these still get a result, with a clear warning.
  hardMaxWeeklyLossPct: 0.02,
  hardMaxWeeklyGainPct: 0.01,
  hardMaxDailySurplus: 1000,
  /** Lowest recommended daily intake. Targets below this are shown with a danger warning. */
  calorieFloor: { male: 1500, female: 1200 } as Record<Sex, number>,
  /** Below this a diet needs medical supervision, so the calculator never shows a lower target. */
  medicalMinimum: 800,
  kcalPerKg: 7700,
  /** Goals within this many kg of current weight count as maintenance. */
  maintainToleranceKg: 0.5,
};

export interface CalorieInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goalWeightKg: number;
  weeks: number;
  activity: ActivityLevel;
}

export interface Plan {
  goal: Goal;
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  /** Negative for a deficit, positive for a surplus. */
  dailyAdjustment: number;
  /** Negative for loss, positive for gain. */
  weeklyChangeKg: number;
  /** Set when the goal is faster than recommended ("ambitious") or beyond the danger limits ("dangerous"). */
  warning?: Warning;
}

export type Warning =
  | { level: "ambitious"; recommendedWeeklyKg: number }
  | {
      level: "dangerous";
      /** Target is below LIMITS.calorieFloor */
      belowFloor: boolean;
      calorieFloor: number;
      /** Pace is beyond the hard weekly limit */
      tooFast: boolean;
      maxWeeklyPct: number;
    };

/** How a lead's goal was classified, stored with the lead so it's clear who needs a careful conversation. */
export type Risk = "none" | Warning["level"];
export const riskOf = (plan: Plan): Risk => plan.warning?.level ?? "none";

export type RangeField = "age" | "heightCm" | "weightKg" | "goalWeightKg" | "weeks";

export type Issue =
  | { code: "under_18" }
  | { code: "out_of_range"; field: RangeField; min: number; max: number }
  | { code: "goal_below_healthy_bmi"; minHealthyWeightKg: number }
  | { code: "below_medical_minimum"; medicalMinimum: number };

export type CalorieResult = { ok: true; plan: Plan } | { ok: false; issue: Issue };

export const isSex = (v: unknown): v is Sex => v === "male" || v === "female";
export const isActivityLevel = (v: unknown): v is ActivityLevel =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(ACTIVITY_LEVELS, v);

/** Mifflin-St Jeor resting energy expenditure. */
export function bmr({ sex, age, heightCm, weightKg }: Pick<CalorieInput, "sex" | "age" | "heightCm" | "weightKg">): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
}

export function minHealthyWeightKg(heightCm: number): number {
  const m = heightCm / 100;
  return ceilTo(LIMITS.minHealthyBmi * m * m, 0.1);
}

function checkRanges(input: CalorieInput): Issue | null {
  if (input.age < LIMITS.age.min) return { code: "under_18" };
  const checks: [RangeField, number, { min: number; max: number }][] = [
    ["age", input.age, LIMITS.age],
    ["heightCm", input.heightCm, LIMITS.heightCm],
    ["weightKg", input.weightKg, LIMITS.weightKg],
    ["goalWeightKg", input.goalWeightKg, LIMITS.weightKg],
    ["weeks", input.weeks, LIMITS.weeks],
  ];
  for (const [field, value, { min, max }] of checks) {
    if (!Number.isFinite(value) || value < min || value > max) return { code: "out_of_range", field, min, max };
  }
  return null;
}

export function calculatePlan(input: CalorieInput): CalorieResult {
  const rangeIssue = checkRanges(input);
  if (rangeIssue) return { ok: false, issue: rangeIssue };

  const restingCalories = bmr(input);
  const maintenance = restingCalories * ACTIVITY_LEVELS[input.activity].multiplier;
  const deltaKg = input.goalWeightKg - input.weightKg;

  if (Math.abs(deltaKg) < LIMITS.maintainToleranceKg) {
    return {
      ok: true,
      plan: {
        goal: "maintain",
        bmr: Math.round(restingCalories),
        maintenanceCalories: roundTo(maintenance, 10),
        targetCalories: roundTo(maintenance, 10),
        dailyAdjustment: 0,
        weeklyChangeKg: 0,
      },
    };
  }

  const goal: Goal = deltaKg < 0 ? "lose" : "gain";

  if (goal === "lose") {
    const minHealthy = minHealthyWeightKg(input.heightCm);
    if (input.goalWeightKg < minHealthy) {
      return { ok: false, issue: { code: "goal_below_healthy_bmi", minHealthyWeightKg: minHealthy } };
    }
  }

  const floor = LIMITS.calorieFloor[input.sex];
  const kcalPerWeekPct = (pct: number) => (pct * input.weightKg * LIMITS.kcalPerKg) / 7;
  const requiredDailyAdjustment = (Math.abs(deltaKg) * LIMITS.kcalPerKg) / (input.weeks * 7);
  const sign = goal === "lose" ? -1 : 1;
  const target = maintenance + sign * requiredDailyAdjustment;

  if (target < LIMITS.medicalMinimum) {
    return { ok: false, issue: { code: "below_medical_minimum", medicalMinimum: LIMITS.medicalMinimum } };
  }

  let warning: Warning | undefined;
  if (goal === "lose") {
    const belowFloor = target < floor;
    const tooFast = requiredDailyAdjustment > kcalPerWeekPct(LIMITS.hardMaxWeeklyLossPct);
    const recommendedMax = Math.min(
      kcalPerWeekPct(LIMITS.maxWeeklyLossPct),
      LIMITS.maxDeficitPct * maintenance,
      maintenance - floor,
    );
    if (belowFloor || tooFast) {
      warning = { level: "dangerous", belowFloor, calorieFloor: floor, tooFast, maxWeeklyPct: LIMITS.hardMaxWeeklyLossPct * 100 };
    } else if (requiredDailyAdjustment > recommendedMax) {
      warning = { level: "ambitious", recommendedWeeklyKg: weeklyKg(recommendedMax) };
    }
  } else {
    const hardMax = Math.min(kcalPerWeekPct(LIMITS.hardMaxWeeklyGainPct), LIMITS.hardMaxDailySurplus);
    const recommendedMax = Math.min(kcalPerWeekPct(LIMITS.maxWeeklyGainPct), LIMITS.maxDailySurplus);
    if (requiredDailyAdjustment > hardMax) {
      warning = { level: "dangerous", belowFloor: false, calorieFloor: floor, tooFast: true, maxWeeklyPct: LIMITS.hardMaxWeeklyGainPct * 100 };
    } else if (requiredDailyAdjustment > recommendedMax) {
      warning = { level: "ambitious", recommendedWeeklyKg: weeklyKg(recommendedMax) };
    }
  }

  return {
    ok: true,
    plan: {
      goal,
      bmr: Math.round(restingCalories),
      maintenanceCalories: roundTo(maintenance, 10),
      targetCalories: roundTo(target, 10),
      dailyAdjustment: sign * roundTo(requiredDailyAdjustment, 10),
      weeklyChangeKg: Math.round((deltaKg / input.weeks) * 100) / 100,
      ...(warning && { warning }),
    },
  };
}

/** Daily kcal adjustment → kg per week, rounded down to 0.01 */
function weeklyKg(dailyKcal: number) {
  return Math.max(0, Math.floor(((dailyKcal * 7) / LIMITS.kcalPerKg) * 100) / 100);
}

// Unit conversion

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const ftInToCm = (ft: number, inches: number) => (ft * 12 + inches) * CM_PER_IN;
export function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalIn = Math.round(cm / CM_PER_IN);
  return { ft: Math.floor(totalIn / 12), in: totalIn % 12 };
}

// Rounding helpers (step-aware, with float noise trimmed)

function roundTo(value: number, step: number) {
  return clean(Math.round(value / step) * step);
}
function ceilTo(value: number, step: number) {
  return clean(Math.ceil(value / step - 1e-9) * step);
}
function clean(n: number) {
  return Math.round(n * 1000) / 1000;
}
