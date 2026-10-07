# Alexandrusom

Personal training and nutrition coaching website with a calorie calculator and lead capture. Built with Next.js + Tailwind, exported as a static site to GitHub Pages; leads are stored in Supabase.

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # calorie engine tests
```

Until `leadEndpoint` is set, the lead form pretends to save in development so you can test the flow.

## Where to edit things

The site is in Swedish (`/`) and English (`/en/`), switched with the flags in the navbar.

| What | File |
| --- | --- |
| Swedish text | `src/i18n/sv.ts` |
| English text | `src/i18n/en.ts` |
| Photos, videos, socials, form endpoints | `src/content/site.ts` (look for `TODO`) |
| Calorie rules (max pace, calorie floor, BMI, ranges) | `LIMITS` in `supabase/functions/_shared/calories.ts` |
| Brand colours and fonts | `src/app/globals.css`, `src/components/SiteLayout.tsx` |

Photos go in `public/images/` and are referenced as `/images/name.jpg` in `site.ts`.

## Supabase (lead storage)

Project `cmbrupeqoseswqovwarz` (EU, Ireland). Two tables, both locked with row level security so only the functions can write:

| Table | Filled by | Function |
| --- | --- | --- |
| `leads` | Calculator page (name, phone, answers, result, risk level) | `submit-lead` |
| `contact_requests` | Booking page `/boka/` (name, phone, topic, message) | `submit-contact` |

`contacts_overview` (a view) combines both: one row per person, matched by phone number, with their latest booking info and latest calculator info.

See them in the dashboard under **Table Editor**. New leads and bookings are emailed to `ALERT_EMAIL` via Resend once `RESEND_API_KEY` is set. To change a function, edit it and redeploy:

```bash
supabase functions deploy submit-lead --no-verify-jwt --use-api
supabase functions deploy submit-contact --no-verify-jwt --use-api
```

Only these sites may submit:

```bash
supabase secrets set ALLOWED_ORIGINS=https://alexandrusom.com,https://www.alexandrusom.com,https://alexandrusom.github.io,http://localhost:3000
```

## Deploying (GitHub Pages)

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   Pages on a private repo needs a paid GitHub plan; otherwise make the repo public (no secrets live in the code).
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` lints, tests, builds and deploys.
3. The site is served at `https://alexandrusom.github.io/alexandrusom/` until you add a custom domain under **Settings → Pages → Custom domain**. The base path adjusts automatically.
