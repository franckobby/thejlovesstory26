# Josephine & Jeffrey — Wedding Seating & Program

A premium wedding web app. Guests scan a QR code, type their name, and instantly
see their table and tablemates. They can also view and download the order of
service. An admin screen lets the couple/planners adjust seating, edit event
details, and edit the program at any time.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion**.

---

## Pages

| Route       | Who              | What                                                                 |
| ----------- | ---------------- | ------------------------------------------------------------------- |
| `/`         | Guests           | Cinematic landing, **Find Your Seat** (fuzzy name search → table reveal), countdown, gallery, details. |
| `/program`  | Guests           | The order of service — view on screen or **Download / Print** (PDF). |
| `/admin`    | Couple / planner | **Seating Manager** (open, no password): drag-and-drop seating, event details, program editor, and a **QR code generator**. |

---

## Getting started (local)

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

- Guest site: http://localhost:3000
- Program: http://localhost:3000/program
- Admin: http://localhost:3000/admin (no login)

### Admin access

The admin is **open** — anyone with the `/admin` link can edit the seating. This
is intentional for this low-risk use. To lock it later (a password or an
unguessable secret URL), just ask. No env vars are needed for local dev.

---

## Editing your wedding data

Everything is editable from the **/admin** screen — no code needed:

- **Seating** — drag a guest by the handle to another table, or use the ↦ menu on
  each name. Rename guests inline, add/remove guests, add/remove tables. Click
  **Save**.
- **Event Details** — names, monogram, hashtag, date/time, venues, dress code,
  welcome & thank-you messages.
- **Programme** — add/remove/reorder ceremony & reception items.
- **QR & Share** — your QR code. Paste your live web address (after deploying),
  then **Download PNG** to print on table cards or display at the entrance.

The data lives in plain JSON so you can also edit it directly:

- `data/seating.json` — tables & guests (originally parsed from your Excel sheet)
- `data/event.json` — event details
- `data/program.json` — order of service

The couple's photos are optimized web copies in `public/images/`. Replace them
with the same filenames to swap photos (`couple-hero.jpg` is the color hero;
`couple-bw-1..3.jpg` are the gallery / section images).

---

## Deploying to Vercel

The project deploys from GitHub — every push to `main` triggers a deploy.

### Persistence (already wired up)

`lib/store.ts` automatically uses **Neon Postgres** when a connection string is
present, and falls back to the local `data/*.json` files for development. So
admin **Save** persists on Vercel once you add a database:

1. Vercel dashboard → your project → **Storage** → **Create Database** →
   **Neon** (Serverless Postgres). Accept the defaults and **Connect** it to the
   project (all environments). This injects **`DATABASE_URL`** (plus a few
   `POSTGRES_*` vars) automatically — the code reads whichever is set.
2. **Redeploy** (Deployments → latest → ⋯ → Redeploy) so the new env var takes
   effect.

On the first load after that, the database is **seeded automatically** (a single
`app_state` JSONB row) from the data in this repo, so the live site starts with
your current seating. From then on, admin edits are saved to Postgres and survive
redeploys.

> No database? You can instead edit the `data/*.json` files locally, commit, and
> push — each deploy ships the latest seating (but the deployed `/admin` won't be
> able to save).

---

## Project structure

```
app/
  page.tsx            Guest landing
  program/page.tsx    Order of service (+ print to PDF)
  admin/page.tsx      Admin dashboard (open)
  api/seat            Guest seat search
  api/admin           Read/save all data
  globals.css         Design system (palette, type, components)
components/           Hero, FindSeat, Gallery, Countdown, admin/*, …
lib/
  store.ts            Data store — Neon Postgres in prod, data/*.json locally
  match.ts            Fuzzy guest-name matching (typo tolerant)
  types.ts            Shared types
data/                 seating.json · event.json · program.json
public/images/        Optimized couple photos
```

---

Made with love. **#TheJLoveStory**
