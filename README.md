# Josephine & Jeffrey — Wedding Seating & Program

A premium wedding web app. Guests scan a QR code, type their name, and instantly
see their table and tablemates. They can also view and download the order of
service. A private, password-protected admin lets the couple/planners adjust
seating, edit event details, and edit the program at any time.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion**.

---

## Pages

| Route       | Who         | What                                                                 |
| ----------- | ----------- | ------------------------------------------------------------------- |
| `/`         | Guests      | Cinematic landing, **Find Your Seat** (fuzzy name search → table reveal), countdown, gallery, details. |
| `/program`  | Guests      | The order of service — view on screen or **Download / Print** (PDF). |
| `/admin`    | Couple only | Password-gated **Seating Manager**: drag-and-drop seating, event details, program editor, and a **QR code generator**. |

---

## Getting started (local)

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

- Guest site: http://localhost:3000
- Program: http://localhost:3000/program
- Admin: http://localhost:3000/admin

### Admin password

Set in `.env.local`:

```
ADMIN_PASSWORD=lovejj2026
```

**Change this** before sharing anything. (`.env.local` is git-ignored.)

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

`lib/store.ts` automatically uses **Redis (KV)** when its env vars are present,
and falls back to the local `data/*.json` files for development. So admin **Save**
persists on Vercel once you add a KV store:

1. Vercel dashboard → your project → **Storage** → **Create Database** →
   **Upstash → Redis** (a.k.a. KV). Accept the defaults and **Connect** it to
   this project. This injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   automatically. (The code also accepts `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN`.)
2. Add an **`ADMIN_PASSWORD`** environment variable (Settings → Environment
   Variables).
3. **Redeploy** (Deployments → latest → ⋯ → Redeploy) so the new env vars take
   effect.

On the first load after that, the KV store is **seeded automatically** from the
data in this repo, so the live site starts with your current seating. From then
on, admin edits are saved to KV and survive redeploys.

> No database? You can instead edit the `data/*.json` files locally, commit, and
> push — each deploy ships the latest seating (but the deployed `/admin` won't be
> able to save).

---

## Project structure

```
app/
  page.tsx            Guest landing
  program/page.tsx    Order of service (+ print to PDF)
  admin/page.tsx      Admin gate → dashboard
  api/seat            Guest seat search (public)
  api/admin           Read/save all data (auth-protected)
  api/auth            Admin login / logout
  globals.css         Design system (palette, type, components)
components/           Hero, FindSeat, Gallery, Countdown, admin/*, …
lib/
  store.ts            JSON data store  ← swap for a DB when deploying
  match.ts            Fuzzy guest-name matching (typo tolerant)
  auth.ts             Admin session
  types.ts            Shared types
data/                 seating.json · event.json · program.json
public/images/        Optimized couple photos
```

---

Made with love. **#TheJLoveStory**
