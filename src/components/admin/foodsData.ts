import { supabase } from "@/lib/supabase";
import type { Food } from "./FoodsPanel";

const PAGE = 1000; // Supabase returns at most 1000 rows per request

/** Loads the whole food list (shared Livsmedelsverket foods + the coach's own, with their favourites), page by page. */
export async function loadAllFoods(): Promise<Food[]> {
  const all: Food[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase().from("coach_foods").select("*").order("name").range(from, from + PAGE - 1);
    if (error) throw error;
    all.push(...(data as Food[]));
    if (data.length < PAGE) return all;
  }
}

/** Favourites first, then your own foods, then the rest alphabetically. */
export const byRelevance = (a: Food, b: Food) =>
  Number(b.favorite) - Number(a.favorite) ||
  Number(b.source === "mine") - Number(a.source === "mine") ||
  a.name.localeCompare(b.name, "sv");

/** Lowercase without accents, so "agg" finds "Ägg" and "creme" finds "Crème". */
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Search that ranks like you'd expect: every word must match ("kyckling bröst"), and
 * "Kyckling bröstfilé rå" beats "Biryani m. kyckling". Favourites and your own foods get a boost,
 * ready-made dishes a penalty, and shorter (simpler) names win ties.
 */
export function searchFoods(foods: Food[], query: string): Food[] {
  const words = fold(query).split(/[\s,]+/).filter(Boolean);
  if (words.length === 0) return [...foods].sort(byRelevance);
  const scored: { food: Food; score: number }[] = [];
  for (const food of foods) {
    const name = fold(`${food.name} ${food.brand ?? ""}`);
    if (!words.every((w) => name.includes(w))) continue;
    const tokens = name.split(/[\s,.()-]+/);
    let score = 0;
    if (name.startsWith(words[0])) score += 100; // "Kyckling …" for "kyckling"
    for (const w of words) {
      if (tokens.includes(w)) score += 20; // whole word
      else if (tokens.some((t) => t.startsWith(w))) score += 12; // start of a word: "bröst" → "bröstfilé"
    }
    if (food.favorite) score += 60;
    if (food.source === "mine") score += 30;
    if (food.category === "dishes") score -= 40;
    score -= name.length / 4;
    scored.push({ food, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name, "sv")).map((s) => s.food);
}

export type Macros = { kcal: number; protein: number; carbs: number; fat: number };

/** Macros for a given amount of a food (values are stored per 100 g). */
export function macrosFor(food: Food, grams: number): Macros {
  const k = grams / 100;
  return { kcal: food.kcal * k, protein: food.protein_g * k, carbs: food.carbs_g * k, fat: food.fat_g * k };
}

export const addMacros = (a: Macros, b: Macros): Macros => ({
  kcal: a.kcal + b.kcal,
  protein: a.protein + b.protein,
  carbs: a.carbs + b.carbs,
  fat: a.fat + b.fat,
});

export const ZERO: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
