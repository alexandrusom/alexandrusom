"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { button } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { addMacros, byRelevance, loadAllFoods, macrosFor, ZERO } from "./foodsData";
import type { Food } from "./FoodsPanel";

/** The client a plan belongs to (a row from contacts_overview). */
export type PlanClient = {
  phone: string;
  name: string;
  target_kcal: number | null;
  weight_kg: number | null;
  goal_weight_kg: number | null;
};

type Plan = {
  id: string;
  created_at: string;
  updated_at: string;
  phone: string;
  name: string;
  target_kcal: number | null;
  meals: string[];
  notes: string;
  is_current: boolean;
};

type Item = { id: string; plan_id: string; meal: string; food_id: string; grams: number; position: number };

const round = (n: number) => Math.round(n);
const date = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { dateStyle: "medium" });

/** A client's diet: the current plan open in the builder, and older versions below it. */
export function DietPlans({ client }: { client: PlanClient }) {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase()
      .from("diet_plans")
      .select("*")
      .eq("phone", client.phone)
      .order("created_at", { ascending: false });
    if (error) setError("Couldn't load diet plans.");
    else setPlans(data as Plan[]);
  }, [client.phone]);

  useEffect(() => {
    // Loading data from Supabase on mount is the external sync this effect is for
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const current = plans?.find((p) => p.is_current) ?? null;
  const open = plans?.find((p) => p.id === openId) ?? current;
  const older = (plans ?? []).filter((p) => !p.is_current);

  /** Only one plan can be current, so the old one is unset first. */
  async function makeCurrent(plan: Plan) {
    const db = supabase();
    if (current && current.id !== plan.id) {
      const { error } = await db.from("diet_plans").update({ is_current: false }).eq("id", current.id);
      if (error) return setError("Couldn't change the current diet.");
    }
    const { error } = await db.from("diet_plans").update({ is_current: true }).eq("id", plan.id);
    if (error) return setError("Couldn't change the current diet.");
    setOpenId(null);
    await load();
  }

  /** New version: a copy of the current diet (or an empty plan) that becomes the current one. */
  async function newVersion() {
    const db = supabase();
    const version = (plans?.length ?? 0) + 1;
    const { data, error } = await db
      .from("diet_plans")
      .insert({
        phone: client.phone,
        name: `Kostplan v${version}`,
        target_kcal: current?.target_kcal ?? client.target_kcal,
        meals: current?.meals,
        notes: current?.notes ?? "",
      })
      .select()
      .single();
    if (error) return setError("Couldn't create the new version.");
    const plan = data as Plan;
    if (current) {
      const { data: items } = await db.from("diet_plan_items").select("meal, food_id, grams, position").eq("plan_id", current.id);
      if (items?.length) {
        const { error } = await db.from("diet_plan_items").insert(items.map((i) => ({ ...i, plan_id: plan.id })));
        if (error) setError("The new version was created, but copying the foods failed.");
      }
    }
    await makeCurrent(plan);
  }

  async function deletePlan(plan: Plan) {
    if (!window.confirm(`Delete "${plan.name}"? This can't be undone.`)) return;
    const { error } = await supabase().from("diet_plans").delete().eq("id", plan.id);
    if (error) return setError("Couldn't delete the plan.");
    setPlans((list) => list?.filter((p) => p.id !== plan.id) ?? null);
    if (openId === plan.id) setOpenId(null);
  }

  if (!plans) return <p className="mt-6 text-anthracite/60">{error ?? "Loading diet…"}</p>;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-anthracite/60">
            {open && !open.is_current ? "Older version" : "Current diet"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{open?.name ?? "No diet yet"}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {open && !open.is_current && (
            <>
              <button type="button" className={button.outlineDark} onClick={() => setOpenId(null)}>
                ← Back to current
              </button>
              <button type="button" className={button.outlineDark} onClick={() => makeCurrent(open)}>
                Make this current
              </button>
            </>
          )}
          <button type="button" className={button.primary} onClick={newVersion}>
            {current ? "+ New version" : "+ Create diet"}
          </button>
        </div>
      </div>
      {current && open?.is_current && (
        <p className="mt-1 text-sm text-anthracite/60">
          &quot;New version&quot; copies this diet so you can change it and keep this one as history.
        </p>
      )}

      {error && <p className="mt-4 text-sm font-semibold text-red-800">{error}</p>}

      {open ? (
        <DietBuilder
          key={open.id}
          client={client}
          plan={open}
          onPlanChange={(next) => setPlans((list) => list?.map((p) => (p.id === next.id ? next : p)) ?? null)}
        />
      ) : (
        <p className="mt-6 text-anthracite/60">No diet for {client.name} yet.</p>
      )}

      {older.length > 0 && (
        <div className="mt-10">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-anthracite/60">Older versions</p>
          <ul className="mt-3 space-y-3">
            {older.map((p) => (
              <li
                key={p.id}
                className={`flex flex-wrap items-center gap-4 rounded-[10px] bg-white p-4 ring-1 ${
                  p.id === open?.id ? "ring-military" : "ring-anthracite/10"
                }`}
              >
                <button type="button" onClick={() => setOpenId(p.id)} className="flex-1 text-left">
                  <span className="font-semibold">{p.name}</span>
                  <span className="block text-sm text-anthracite/60">
                    {p.target_kcal ? `${p.target_kcal} kcal/day · ` : ""}Created {date(p.created_at)}
                  </span>
                </button>
                <button type="button" className={button.outlineDark} onClick={() => setOpenId(p.id)}>
                  Open
                </button>
                <button type="button" className="text-sm text-red-800 underline underline-offset-4" onClick={() => deletePlan(p)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function DietBuilder({
  client,
  plan,
  onPlanChange,
}: {
  client: PlanClient;
  plan: Plan;
  onPlanChange: (plan: Plan) => void;
}) {
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newMeal, setNewMeal] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadAllFoods(),
      supabase().from("diet_plan_items").select("*").eq("plan_id", plan.id).order("position"),
    ])
      .then(([allFoods, { data, error }]) => {
        if (cancelled) return;
        if (error) throw error;
        setFoods(allFoods);
        setItems(data as Item[]);
      })
      .catch(() => !cancelled && setError("Couldn't load the plan."));
    return () => {
      cancelled = true;
    };
  }, [plan.id]);

  const foodById = useMemo(() => new Map((foods ?? []).map((f) => [f.id, f])), [foods]);

  async function savePlan(changes: Partial<Pick<Plan, "name" | "target_kcal" | "meals" | "notes">>) {
    const next = { ...plan, ...changes, updated_at: new Date().toISOString() };
    onPlanChange(next);
    const { error } = await supabase()
      .from("diet_plans")
      .update({ ...changes, updated_at: next.updated_at })
      .eq("id", plan.id);
    if (error) setError("Couldn't save the plan.");
  }

  async function addItem(meal: string, food: Food) {
    const position = (items ?? []).filter((i) => i.meal === meal).length;
    const { data, error } = await supabase()
      .from("diet_plan_items")
      .insert({ plan_id: plan.id, meal, food_id: food.id, grams: food.portion_grams ?? 100, position })
      .select()
      .single();
    if (error) return setError("Couldn't add the food.");
    setItems((list) => [...(list ?? []), data as Item]);
    savePlan({});
  }

  async function updateGrams(item: Item, grams: number) {
    if (!(grams > 0 && grams <= 3000) || grams === item.grams) return;
    setItems((list) => list?.map((i) => (i.id === item.id ? { ...i, grams } : i)) ?? null);
    const { error } = await supabase().from("diet_plan_items").update({ grams }).eq("id", item.id);
    if (error) setError("Couldn't save the amount.");
    else savePlan({});
  }

  async function removeItem(item: Item) {
    setItems((list) => list?.filter((i) => i.id !== item.id) ?? null);
    const { error } = await supabase().from("diet_plan_items").delete().eq("id", item.id);
    if (error) setError("Couldn't remove the food.");
    else savePlan({});
  }

  function addMeal() {
    const name = newMeal.trim();
    if (!name || plan.meals.includes(name)) return;
    savePlan({ meals: [...plan.meals, name] });
    setNewMeal("");
  }

  function removeMeal(meal: string) {
    savePlan({ meals: plan.meals.filter((m) => m !== meal) });
  }

  const totals = (meal?: string) =>
    (items ?? [])
      .filter((i) => !meal || i.meal === meal)
      .reduce((sum, i) => {
        const food = foodById.get(i.food_id);
        return food ? addMacros(sum, macrosFor(food, i.grams)) : sum;
      }, ZERO);

  if (error && !items) return <p className="mt-6 font-semibold text-red-800">{error}</p>;
  if (!items || !foods) return <p className="mt-6 text-anthracite/60">Loading the plan…</p>;

  const day = totals();
  const target = plan.target_kcal;
  const percent = target ? Math.round((day.kcal / target) * 100) : null;
  const weight = client.weight_kg;

  return (
    <div className="mt-4">
      {/* Plan header */}
      <div className="grid gap-4 rounded-[10px] bg-white p-5 ring-1 ring-anthracite/10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-anthracite/60">Diet plan for {client.name}</p>
          <input
            defaultValue={plan.name}
            onBlur={(e) => e.target.value.trim() && e.target.value !== plan.name && savePlan({ name: e.target.value.trim() })}
            aria-label="Plan name"
            className="mt-1 w-full rounded-md border border-transparent bg-transparent px-1 text-2xl font-semibold tracking-[-0.03em] outline-none hover:border-anthracite/15 focus:border-military"
          />
        </div>
        <label className="text-sm font-semibold">
          Daily target (kcal)
          <input
            type="number"
            min={800}
            max={6000}
            defaultValue={plan.target_kcal ?? ""}
            onBlur={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              if (v === null || (v >= 800 && v <= 6000)) savePlan({ target_kcal: v });
            }}
            className="mt-1 block w-36 rounded-md border border-anthracite/20 px-3 py-2"
          />
        </label>
      </div>

      {/* Day totals */}
      <div className="sticky top-0 z-10 mt-4 rounded-[10px] bg-anthracite p-5 text-titanium-light">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-titanium/60">Day total</p>
            <p className="text-4xl font-semibold tracking-[-0.04em]">
              {round(day.kcal)}
              <span className="text-lg font-medium text-titanium/70"> {target ? `/ ${target} kcal` : "kcal"}</span>
            </p>
          </div>
          <dl className="flex gap-6 text-sm">
            {(
              [
                ["Protein", day.protein, weight ? `${(day.protein / weight).toFixed(1)} g/kg` : null],
                ["Carbs", day.carbs, null],
                ["Fat", day.fat, null],
              ] as const
            ).map(([labelText, grams, extra]) => (
              <div key={labelText}>
                <dt className="text-titanium/60">{labelText}</dt>
                <dd className="text-lg font-semibold">{round(grams)} g</dd>
                {extra && <dd className="text-xs text-titanium/60">{extra}</dd>}
              </div>
            ))}
          </dl>
        </div>
        {percent !== null && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className={`h-full rounded-full ${percent > 105 ? "bg-red-500" : percent >= 95 ? "bg-military-light" : "bg-titanium"}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-titanium/60">
              {percent}% of target
              {percent < 95 && ` · ${round(target! - day.kcal)} kcal left`}
              {percent > 105 && ` · ${round(day.kcal - target!)} kcal over`}
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-800">{error}</p>}

      {/* Meals */}
      <div className="mt-4 space-y-4">
        {plan.meals.map((meal) => {
          const mealItems = items.filter((i) => i.meal === meal);
          const m = totals(meal);
          return (
            <div key={meal} className="rounded-[10px] bg-white p-5 ring-1 ring-anthracite/10">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-semibold tracking-[-0.02em]">{meal}</h3>
                <p className="text-sm tabular-nums text-anthracite/70">
                  <b className="text-anthracite">{round(m.kcal)} kcal</b> · P {round(m.protein)} g · K {round(m.carbs)} g · F{" "}
                  {round(m.fat)} g
                </p>
              </div>

              {mealItems.length > 0 && (
                <ul className="mt-3 divide-y divide-anthracite/10">
                  {mealItems.map((item) => {
                    const food = foodById.get(item.food_id);
                    if (!food) return null;
                    const x = macrosFor(food, item.grams);
                    return (
                      <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
                        <span className="min-w-48 flex-1 font-medium">
                          {food.name}
                          {food.portion_name && food.portion_grams && (
                            <span className="ml-1 font-normal text-anthracite/50">
                              ({(item.grams / food.portion_grams).toFixed(item.grams % food.portion_grams ? 1 : 0)} ×{" "}
                              {food.portion_name})
                            </span>
                          )}
                        </span>
                        <label className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={3000}
                            defaultValue={item.grams}
                            onBlur={(e) => updateGrams(item, Number(e.target.value))}
                            aria-label={`Grams of ${food.name}`}
                            className="w-20 rounded-md border border-anthracite/20 px-2 py-1 text-right"
                          />
                          g
                        </label>
                        <span className="w-20 text-right tabular-nums font-semibold">{round(x.kcal)} kcal</span>
                        <span className="w-44 tabular-nums text-anthracite/60">
                          P {round(x.protein)} · K {round(x.carbs)} · F {round(x.fat)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          aria-label={`Remove ${food.name}`}
                          className="text-anthracite/40 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <FoodPicker foods={foods} onPick={(food) => addItem(meal, food)} />
                {mealItems.length === 0 && (
                  <button type="button" onClick={() => removeMeal(meal)} className="text-sm text-anthracite/50 underline underline-offset-4">
                    Remove meal
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={newMeal}
          onChange={(e) => setNewMeal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMeal()}
          placeholder="New meal, e.g. Kvällsmål"
          className="rounded-full border border-anthracite/20 bg-white px-4 py-2 text-sm"
        />
        <button type="button" className={button.outlineDark} onClick={addMeal}>
          + Add meal
        </button>
      </div>

      <label className="mt-6 block text-sm font-semibold">
        Notes for this plan
        <textarea
          rows={4}
          defaultValue={plan.notes}
          onBlur={(e) => e.target.value !== plan.notes && savePlan({ notes: e.target.value })}
          placeholder="e.g. Drick 2–3 liter vatten per dag. Byt gärna ris mot potatis."
          className="mt-2 w-full rounded-md border border-anthracite/20 bg-white px-3 py-2 font-normal"
        />
      </label>
      <p className="mt-2 text-xs text-anthracite/50">Changes save automatically.</p>
    </div>
  );
}

/** Search box that suggests foods (favourites and your own first) and adds the chosen one. */
function FoodPicker({ foods, onPick }: { foods: Food[]; onPick: (food: Food) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? foods.filter((f) => f.name.toLowerCase().includes(q) || (f.brand ?? "").toLowerCase().includes(q)) : foods.filter((f) => f.favorite);
    return [...pool].sort(byRelevance).slice(0, 8);
  }, [foods, query]);

  function pick(food: Food) {
    onPick(food);
    setQuery("");
    setOpen(false);
    setActive(0);
  }

  return (
    <div
      ref={box}
      className="relative w-full sm:w-96"
      onBlur={(e) => !box.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, suggestions.length - 1));
          if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
          if (e.key === "Enter" && suggestions[active]) {
            e.preventDefault();
            pick(suggestions[active]);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="+ Add food (search, or pick a favourite)"
        aria-label="Add food"
        className="w-full rounded-full border border-anthracite/20 bg-titanium-light/50 px-4 py-2 text-sm outline-none focus:border-military focus:bg-white"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-[10px] bg-white shadow-xl ring-1 ring-anthracite/15">
          {suggestions.map((f, i) => (
            <li key={f.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(f)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm ${i === active ? "bg-titanium-light" : ""}`}
              >
                <span>
                  {f.favorite && <span className="mr-1 text-amber-500">★</span>}
                  {f.name}
                  {f.source === "mine" && <span className="ml-2 text-[10px] font-semibold uppercase text-military">Mine</span>}
                </span>
                <span className="shrink-0 tabular-nums text-anthracite/50">{f.kcal} kcal</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !query && suggestions.length === 0 && (
        <p className="absolute z-20 mt-1 w-full rounded-[10px] bg-white px-4 py-2 text-sm text-anthracite/60 shadow-xl ring-1 ring-anthracite/15">
          Type to search. Star foods in the Foods tab to see them here.
        </p>
      )}
    </div>
  );
}
