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
