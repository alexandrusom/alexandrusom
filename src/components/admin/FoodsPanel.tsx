"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { button } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { byRelevance, loadAllFoods } from "./foodsData";

export type Category =
  | "protein"
  | "carbs"
  | "fat"
  | "vegetables"
  | "fruit"
  | "dairy"
  | "dishes"
  | "snacks"
  | "drinks"
  | "other";

export type Food = {
  id: string;
  name: string;
  brand: string | null;
  category: Category;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  portion_name: string | null;
  portion_grams: number | null;
  notes: string | null;
  /** "livsmedelsverket" = imported official data (read-only), "mine" = added by Alexandru */
  source: "livsmedelsverket" | "mine";
  lmv_group: string | null;
  favorite: boolean;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
  vegetables: "Vegetables",
  fruit: "Fruit",
  dairy: "Dairy",
  dishes: "Dishes",
  snacks: "Snacks",
  drinks: "Drinks",
  other: "Other",
};

/** kcal implied by the macros (4/4/9), used to catch typos */
const kcalFromMacros = (p: number, c: number, f: number) => Math.round(p * 4 + c * 4 + f * 9);

type Draft = {
  name: string;
  brand: string;
  category: Category;
  kcal: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  fiber_g: string;
  portion_name: string;
  portion_grams: string;
  notes: string;
};

const emptyDraft: Draft = {
  name: "",
  brand: "",
  category: "protein",
  kcal: "",
  protein_g: "",
  carbs_g: "",
  fat_g: "",
  fiber_g: "",
  portion_name: "",
  portion_grams: "",
  notes: "",
};

const toDraft = (f: Food): Draft => ({
  name: f.name,
  brand: f.brand ?? "",
  category: f.category,
  kcal: String(f.kcal),
  protein_g: String(f.protein_g),
  carbs_g: String(f.carbs_g),
  fat_g: String(f.fat_g),
  fiber_g: f.fiber_g === null ? "" : String(f.fiber_g),
  portion_name: f.portion_name ?? "",
  portion_grams: f.portion_grams === null ? "" : String(f.portion_grams),
  notes: f.notes ?? "",
});

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

const SHOW = 150; // rows rendered at once; search narrows it down

type SourceFilter = "all" | "favorites" | "mine" | "livsmedelsverket";
const SOURCE_FILTERS: Record<SourceFilter, string> = {
  all: "All sources",
  favorites: "⭐ Favourites",
  mine: "My foods",
  livsmedelsverket: "Livsmedelsverket",
};

export function FoodsPanel() {
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [source, setSource] = useState<SourceFilter>("all");
  // null = closed, "new" = adding, "copy:<id>" = copying a Livsmedelsverket food, otherwise the id being edited
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setFoods(await loadAllFoods());
    } catch {
      setError("Couldn't load foods.");
    }
  }, []);

  useEffect(() => {
    // Loading data from Supabase on mount is the external sync this effect is for
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (foods ?? [])
      .filter(
        (f) =>
          (category === "all" || f.category === category) &&
          (source === "all" || (source === "favorites" ? f.favorite : f.source === source)) &&
          (!q || f.name.toLowerCase().includes(q) || (f.brand ?? "").toLowerCase().includes(q)),
      )
      .sort(byRelevance);
  }, [foods, search, category, source]);
  const visible = matches.slice(0, SHOW);

  const replace = (food: Food) => setFoods((list) => list?.map((x) => (x.id === food.id ? food : x)) ?? null);

  async function toggleFavorite(food: Food) {
    replace({ ...food, favorite: !food.favorite });
    const { error } = await supabase().from("foods").update({ favorite: !food.favorite }).eq("id", food.id);
    if (error) {
      replace(food);
      setError("Couldn't update favourite.");
    }
  }

  async function remove(food: Food) {
    if (!window.confirm(`Delete "${food.name}"?`)) return;
    const { error } = await supabase().from("foods").delete().eq("id", food.id);
    if (error) setError("Couldn't delete.");
    else setFoods((list) => list?.filter((f) => f.id !== food.id) ?? null);
  }

  const copying = editing?.startsWith("copy:") ? foods?.find((f) => f.id === editing.slice(5)) : undefined;
  const addSaved = (food: Food) => {
    setFoods((list) => [...(list ?? []), food]);
    setEditing(null);
  };

  if (error && !foods) return <p className="mt-8 font-semibold text-red-800">{error}</p>;
  if (!foods) return <p className="mt-8 text-anthracite/60">Loading foods…</p>;

  const chip = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      active ? "bg-anthracite text-white" : "bg-white text-anthracite/70 ring-1 ring-anthracite/15 hover:ring-anthracite/40"
    }`;

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(SOURCE_FILTERS) as SourceFilter[]).map((key) => (
          <button key={key} type="button" onClick={() => setSource(key)} className={chip(source === key)}>
            {SOURCE_FILTERS[key]}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {(["all", ...Object.keys(CATEGORY_LABELS)] as (Category | "all")[]).map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={chip(category === c)}>
            {c === "all" ? "All categories" : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search foods, e.g. kyckling"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-anthracite/20 bg-white px-4 py-2 text-sm outline-none focus:border-military sm:w-80"
        />
        <button type="button" className={`${button.primary} sm:ml-auto`} onClick={() => setEditing("new")}>
          + Add food
        </button>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-800">{error}</p>}

      {editing === "new" && <FoodForm onCancel={() => setEditing(null)} onSaved={addSaved} />}
      {copying && (
        <>
          <p className="mt-4 text-sm text-anthracite/70">
            Copying <b>{copying.name}</b> from Livsmedelsverket. Change what you like; it&apos;s saved as one of your foods.
          </p>
          <FoodForm template={copying} onCancel={() => setEditing(null)} onSaved={addSaved} />
        </>
      )}

      <div className="mt-6 overflow-x-auto rounded-[10px] bg-white ring-1 ring-anthracite/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.1em] text-anthracite/60">
            <tr className="border-b border-anthracite/10">
              <th className="w-10 p-3" aria-label="Favourite" />
              <th className="p-3 font-medium">Food</th>
              <th className="p-3 text-right font-medium">kcal</th>
              <th className="p-3 text-right font-medium">Protein</th>
              <th className="p-3 text-right font-medium">Carbs</th>
              <th className="p-3 text-right font-medium">Fat</th>
              <th className="p-3 font-medium">Portion</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-anthracite/60">
                  {source === "favorites" ? "No favourites yet. Tap ☆ next to a food to add it." : "No foods match."}
                </td>
              </tr>
            )}
            {visible.map((f) =>
              editing === f.id ? (
                <tr key={f.id}>
                  <td colSpan={8} className="p-0">
                    <FoodForm
                      food={f}
                      onCancel={() => setEditing(null)}
                      onSaved={(food) => {
                        replace(food);
                        setEditing(null);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={f.id} className="border-b border-anthracite/5 last:border-0">
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(f)}
                      aria-pressed={f.favorite}
                      aria-label={f.favorite ? `Remove ${f.name} from favourites` : `Add ${f.name} to favourites`}
                      className={`text-lg leading-none ${f.favorite ? "text-amber-500" : "text-anthracite/25 hover:text-anthracite/60"}`}
                    >
                      {f.favorite ? "★" : "☆"}
                    </button>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{f.name}</span>
                    {f.brand && <span className="text-anthracite/50"> · {f.brand}</span>}
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-anthracite/50">
                      <span
                        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          f.source === "mine" ? "bg-military text-white" : "bg-anthracite/10 text-anthracite/70"
                        }`}
                      >
                        {f.source === "mine" ? "Mine" : "Livsmedelsverket"}
                      </span>
                      {CATEGORY_LABELS[f.category]}
                    </span>
                  </td>
                  <td className="p-3 text-right tabular-nums font-semibold">{f.kcal}</td>
                  <td className="p-3 text-right tabular-nums">{f.protein_g} g</td>
                  <td className="p-3 text-right tabular-nums">{f.carbs_g} g</td>
                  <td className="p-3 text-right tabular-nums">{f.fat_g} g</td>
                  <td className="p-3 text-anthracite/70">
                    {f.portion_name && f.portion_grams ? `${f.portion_name} = ${f.portion_grams} g` : "—"}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    {f.source === "mine" ? (
                      <>
                        <button type="button" className="mr-3 underline underline-offset-4" onClick={() => setEditing(f.id)}>
                          Edit
                        </button>
                        <button type="button" className="text-red-800 underline underline-offset-4" onClick={() => remove(f)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <button type="button" className="underline underline-offset-4" onClick={() => setEditing(`copy:${f.id}`)}>
                        Copy to my foods
                      </button>
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-anthracite/50">
        All values per 100 g. Showing {visible.length} of {matches.length} matching ({foods.length} in total)
        {matches.length > SHOW ? ". Search to narrow it down." : "."} Official data: Livsmedelsverkets livsmedelsdatabas.
      </p>
    </section>
  );
}

/** Edits one of your foods, or adds a new one (optionally pre-filled from a Livsmedelsverket food). */
function FoodForm({
  food,
  template,
  onCancel,
  onSaved,
}: {
  food?: Food;
  template?: Food;
  onCancel: () => void;
  onSaved: (food: Food) => void;
}) {
  const initial = food ?? template;
  const [draft, setDraft] = useState<Draft>(initial ? toDraft(initial) : emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const p = num(draft.protein_g) ?? 0;
  const c = num(draft.carbs_g) ?? 0;
  const f = num(draft.fat_g) ?? 0;
  const kcal = num(draft.kcal);
  const implied = kcalFromMacros(p, c, f);
  // Fibre and rounding cause small differences; flag only big ones
  const mismatch = kcal !== null && implied > 0 && Math.abs(implied - kcal) > Math.max(25, kcal * 0.15);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return setError("Give the food a name.");
    if (kcal === null || Number.isNaN(kcal)) return setError("Enter kcal per 100 g.");
    const hasPortionName = draft.portion_name.trim() !== "";
    const hasPortionGrams = num(draft.portion_grams) !== null;
    if (hasPortionName !== hasPortionGrams) return setError("A portion needs both a name and grams, e.g. “1 ägg” and 60.");

    const row = {
      name: draft.name.trim(),
      brand: draft.brand.trim() || null,
      category: draft.category,
      kcal,
      protein_g: p,
      carbs_g: c,
      fat_g: f,
      fiber_g: num(draft.fiber_g),
      portion_name: draft.portion_name.trim() || null,
      portion_grams: num(draft.portion_grams),
      notes: draft.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    setBusy(true);
    setError(null);
    const query = food
      ? supabase().from("foods").update(row).eq("id", food.id).select().single()
      : supabase().from("foods").insert(row).select().single();
    const { data, error } = await query;
    setBusy(false);
    if (error) setError("Couldn't save. Check that the numbers are realistic (per 100 g).");
    else onSaved(data as Food);
  }

  const field = "mt-1 w-full rounded-md border border-anthracite/20 bg-white px-3 py-2 font-normal outline-none focus:border-military";
  const numberInput = (key: keyof Draft, labelText: string, required = false) => (
    <label className="block text-sm font-semibold">
      {labelText}
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        min="0"
        required={required}
        value={draft[key]}
        onChange={(e) => set(key, e.target.value)}
        className={field}
      />
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4 rounded-[10px] bg-titanium-light p-5 ring-1 ring-anthracite/10 sm:grid-cols-4">
      <label className="block text-sm font-semibold sm:col-span-2">
        Name
        <input value={draft.name} onChange={(e) => set("name", e.target.value)} className={field} placeholder="e.g. Kycklingfilé" />
      </label>
      <label className="block text-sm font-semibold">
        Brand (optional)
        <input value={draft.brand} onChange={(e) => set("brand", e.target.value)} className={field} />
      </label>
      <label className="block text-sm font-semibold">
        Category
        <select value={draft.category} onChange={(e) => set("category", e.target.value as Category)} className={field}>
          {Object.entries(CATEGORY_LABELS).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </label>

      {numberInput("kcal", "kcal / 100 g", true)}
      {numberInput("protein_g", "Protein g")}
      {numberInput("carbs_g", "Carbs g")}
      {numberInput("fat_g", "Fat g")}

      <p className={`text-xs sm:col-span-4 ${mismatch ? "font-semibold text-red-800" : "text-anthracite/60"}`}>
        Macros add up to about {implied} kcal{mismatch ? ". That's far from the kcal you entered; double-check the numbers." : "."}
      </p>

      {numberInput("fiber_g", "Fibre g (optional)")}
      <label className="block text-sm font-semibold">
        Portion name (optional)
        <input value={draft.portion_name} onChange={(e) => set("portion_name", e.target.value)} className={field} placeholder="e.g. 1 ägg" />
      </label>
      {numberInput("portion_grams", "Portion grams")}
      <div />

      <label className="block text-sm font-semibold sm:col-span-4">
        Notes (optional)
        <textarea rows={2} value={draft.notes} onChange={(e) => set("notes", e.target.value)} className={field} />
      </label>

      {error && <p className="text-sm font-semibold text-red-800 sm:col-span-4">{error}</p>}

      <div className="flex gap-3 sm:col-span-4">
        <button type="submit" disabled={busy} className={button.primary}>
          {busy ? "Saving…" : food ? "Save changes" : "Add food"}
        </button>
        <button type="button" onClick={onCancel} className={button.outlineDark}>
          Cancel
        </button>
      </div>
    </form>
  );
}
