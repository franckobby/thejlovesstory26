<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Josephine & Jeffrey wedding app

Premium wedding seating + program app. See `README.md` for the full guide.

- **Run:** `npm run dev` (port 3000). `npm run build` to verify.
- **Pages:** `/` (guest landing + Find Your Seat), `/program` (order of service, print-to-PDF), `/admin` (password-gated Seating Manager).
- **Data:** plain JSON in `data/` (`seating.json`, `event.json`, `program.json`), parsed from the couple's Excel sheet (15 tables, 150 guests). All reads/writes go through `lib/store.ts`, which uses **Neon Postgres** (a single `app_state` JSONB row) when `DATABASE_URL`/`POSTGRES_URL` is set, and falls back to the `data/*.json` files locally. On first production read it auto-seeds from the bundled JSON. This is how admin Save persists on Vercel's read-only filesystem.
- **Admin:** single shared **passcode** (`ADMIN_PASSCODE` env; default fallback in `lib/auth.ts`). Client sends it as the `x-admin-passcode` header on `/api/admin` GET/PUT and stores it in `localStorage`; the Lock button clears it. No sessions/tokens/cookies.
- **Guest matching:** `lib/match.ts` — normalized + Levenshtein fuzzy match (typo/partial tolerant).

## Animation gotchas (learned the hard way — don't regress these)
- Entrance reveals use a **pure CSS** animation (`.reveal-rise` in `globals.css`), **visible by default**, enabled by `.anim-ready` on `<html>`. That class is added by a tiny pre-paint inline script in `app/layout.tsx` **only when `document.visibilityState !== 'hidden'`**. This guarantees content is never stuck invisible (hidden tab, JS off, headless render) and avoids a flash. Do NOT gate visibility on `IntersectionObserver` / framer `whileInView` — they don't fire on hidden/headless pages.
- Avoid framer-motion **`AnimatePresence mode="wait"`** here — its exit-complete callback hung under React 19, leaving views stuck. Use direct conditional render (see `components/FindSeat.tsx`).
- Framer mount animations (`initial`/`animate`) are fine for **above-the-fold / interaction-triggered** UI on a visible page (hero used to, the seat reveal still does).
