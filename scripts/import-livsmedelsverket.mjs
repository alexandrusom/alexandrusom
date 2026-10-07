// Imports (or updates) Livsmedelsverket's food database into public.foods.
//
//   node scripts/import-livsmedelsverket.mjs            # download + write supabase/.temp/lmv-import.sql
//   node scripts/import-livsmedelsverket.mjs data.json  # reuse an earlier download
//   supabase db query --linked -f supabase/.temp/lmv-import.sql
//
// Foods are matched on Livsmedelsverket's number, so re-running updates values instead of duplicating.
// Your own foods ("mine") and favourites are never touched.
// Data: Livsmedelsverkets livsmedelsdatabas (open data, attribution required).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const API = "https://dataportal.livsmedelsverket.se/livsmedel/api/v1/livsmedel";

// Livsmedelsverket food group → our category. Anything not listed becomes "other".
const CATEGORY = {
  protein: ["Rött kött", "Fågel", "Fisk", "Fisk- och skaldjursprodukt", "Fisk och skaldjur", "Korv eller liknande produkt", "Innanmat och inälvsmat", "Konserverat kött", "Kött eller köttprodukter", "Ägg", "Vegetariska produkter", "Baljväxter"],
  carbs: ["Ris eller annat spannmål", "Ojäst bröd", "Jäst bröd", "Övriga bröd", "Potatis och stärkelserika rötter", "Frukostflingor", "Cerealier eller cerealielika mjölprodukter och derivat", "Pasta och liknande produkter", "Spannmål och spannmålsprodukter", "Pannkaka eller våffla"],
  fat: ["Margarin och blandade fetter", "Vegetabiliskt fett och olja", "Smör", "Andra djurfetter", "Nöt eller frö produkt", "Nöt, frö eller kärna"],
  vegetables: ["Grönsaker och svamp", "Grönsaksprodukter", "Grönsaker, rotfrukter och svamp"],
  fruit: ["Frukt och bär", "Processad frukt och bär"],
  dairy: ["Fil och yoghurt", "Färskost", "Grädde", "Övriga ostprodukter", "Mjölk", "Hårdost", "Mjukost", "Övriga mjölkprodukter", "Mejeriprodukter", "Lagrad ost", "Halvhård ost", "Ost", "Vegetabiliska mejeriprodukter"],
  dishes: ["Kötträtt", "Sås i maträtt", "Cerealierätter t.ex. klimp, risotto, pannkakor med fyllning, couscous, smörgåsar", "Fisk- och skaldjursrätt", "Grönsaksrätter", "Potatisrätter", "Soppa", "Matpaj eller pizza", "Baljväxträtter", "Pastarätter", "Färdigsallad", "Äggrätter", "Maträtter och efterrätter", "Smörgåsar", "Livsmedelsrätter och ingredienser", "Svamprätter"],
  snacks: ["Bageriprodukter, söta och/eller feta", "Choklad eller chokladprodukt", "Dessert", "Glass och annan frusen dessert med mejeriprodukter", "Snacks", "Konfekt och annan sockerprodukt dvs ej choklad", "Söta kakor", "Dessertsås"],
  drinks: ["Dryck utan alkohol", "Kaffe, te och kakao", "Juice och nektar", "Vin och vinliknande drycker", "Likör eller sprit", "Läsk", "Öl eller maltdryck", "Vatten", "Cider och liknande drycker"],
};
const categoryOf = (group) =>
  Object.entries(CATEGORY).find(([, groups]) => groups.includes((group ?? "").trim()))?.[0] ?? "other";

async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error(`Failed: ${url}`);
}

async function download() {
  const list = (await get(`${API}?offset=0&limit=5000&sprak=1`)).livsmedel;
  const foods = [];
  let next = 0;
  // A few requests at a time, to be gentle with their service
  async function worker() {
    while (next < list.length) {
      const f = list[next++];
      const [nutrients, classes] = await Promise.all([
        get(`${API}/${f.nummer}/naringsvarden?sprak=1`),
        get(`${API}/${f.nummer}/klassificeringar?sprak=1`),
      ]);
      const value = (code, unit) => nutrients.find((n) => n.euroFIRkod === code && (!unit || n.enhet === unit))?.varde ?? null;
      foods.push({
        number: f.nummer,
        name: f.namn,
        kcal: value("ENERC", "kcal"),
        protein: value("PROT"),
        carbs: value("CHO"),
        fat: value("FAT"),
        fiber: value("FIBT"),
        group: classes.find((c) => c.fasett?.startsWith("A "))?.namn ?? null,
      });
      if (foods.length % 250 === 0) console.error(`${foods.length} / ${list.length}`);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  return foods.sort((a, b) => a.number - b.number);
}

const sql = (v) => (v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const clamp = (v, max) => (v === null ? null : Math.min(Math.max(Number(v), 0), max));

const foods = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")) : await download();
const rows = foods
  .filter((f) => f.kcal !== null)
  .map((f) =>
    `(${[
      sql(f.name.slice(0, 120)),
      sql(categoryOf(f.group)),
      clamp(f.kcal, 1000),
      clamp(f.protein ?? 0, 100),
      clamp(f.carbs ?? 0, 100),
      clamp(f.fat ?? 0, 100),
      sql(clamp(f.fiber, 100)),
      "'livsmedelsverket'",
      f.number,
      sql(f.group?.trim() ?? null),
    ].join(", ")})`,
  );

const statements = [];
for (let i = 0; i < rows.length; i += 500) {
  statements.push(`insert into public.foods (name, category, kcal, protein_g, carbs_g, fat_g, fiber_g, source, lmv_number, lmv_group) values
${rows.slice(i, i + 500).join(",\n")}
on conflict (lmv_number) do update set
  name = excluded.name, category = excluded.category, kcal = excluded.kcal, protein_g = excluded.protein_g,
  carbs_g = excluded.carbs_g, fat_g = excluded.fat_g, fiber_g = excluded.fiber_g, lmv_group = excluded.lmv_group,
  updated_at = now();`);
}

if (!existsSync("supabase/.temp")) mkdirSync("supabase/.temp", { recursive: true });
writeFileSync("supabase/.temp/lmv-import.sql", statements.join("\n\n") + "\n");
console.error(`Wrote ${rows.length} foods to supabase/.temp/lmv-import.sql`);
