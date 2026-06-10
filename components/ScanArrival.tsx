"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { EventDetails, SeatMatch } from "@/lib/types";
import { Ornament } from "./Ornament";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Scan-first arrival. A guest who scans the QR code lands directly here and is
 * asked for their name immediately — no extra step before the seat finder. Once
 * matched, we reveal the table and offer a personalized program download that
 * carries their name + seat through to the printable order of service.
 */
export function ScanArrival({ event }: { event: EventDetails }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SeatMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [selected, setSelected] = useState<SeatMatch | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dateLong = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Auto-focus the name field on arrival so guests can type straight away.
  useEffect(() => {
    if (!selected) {
      const t = setTimeout(() => inputRef.current?.focus(), 650);
      return () => clearTimeout(t);
    }
  }, [selected]);

  // Live, debounced fuzzy search.
  useEffect(() => {
    if (selected) return;
    const q = query.trim();
    if (q.length < 2) {
      setMatches([]);
      setTouched(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/seat?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setMatches(data.matches ?? []);
        setTouched(true);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, selected]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matches.length > 0) setSelected(matches[0]);
  }

  function reset() {
    setSelected(null);
    setQuery("");
    setMatches([]);
    setTouched(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <section
      id="seat"
      className="relative flex min-h-[100svh] scroll-mt-0 items-center justify-center overflow-hidden px-6 py-24"
    >
      {/* Photograph backdrop */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-kenburns">
          <Image
            src="/images/couple-hero.jpg"
            alt={event.coupleNames}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "50% 32%" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-forest/70 via-forest/45 to-forest/90" />
        <div className="absolute inset-0 bg-forest/20" />
      </div>

      {/* Decorative gold frame */}
      <div className="pointer-events-none absolute inset-3 z-10 border border-gold/30 sm:inset-5" />
      <div className="pointer-events-none absolute inset-4 z-10 border border-gold/10 sm:inset-6" />

      <div className="relative z-20 w-full max-w-xl">
        {/* Couple masthead */}
        <div className="reveal-rise text-center text-champagne">
          <p
            className="eyebrow"
            style={{ color: "var(--color-gold-light)" }}
          >
            Together with their families
          </p>
          <div className="mt-4 flex flex-col items-center leading-[0.95]">
            <span className="font-serif text-5xl font-light tracking-tight text-shadow-lux sm:text-6xl">
              {event.bride}
            </span>
            <span className="my-0.5 font-script text-4xl text-gold-light text-shadow-lux sm:text-5xl">
              &amp;
            </span>
            <span className="font-serif text-5xl font-light tracking-tight text-shadow-lux sm:text-6xl">
              {event.groom}
            </span>
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-champagne/85 sm:text-sm">
            {dateLong} · {event.city}
          </p>
        </div>

        {/* The arrival card — name entry, or seat reveal */}
        <div
          className="reveal-rise mt-9"
          style={{ ["--reveal-delay" as string]: "0.15s" }}
        >
          {!selected ? (
            <div className="card-lux px-6 py-8 sm:px-9 sm:py-9">
              <div className="text-center">
                <p className="eyebrow">Be Our Guest</p>
                <h2 className="mt-3 text-3xl sm:text-4xl">Find Your Seat</h2>
                <Ornament className="my-5" />
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-soft">
                  Enter your name to see your table for the evening and to
                  download your personal program.
                </p>
              </div>

              <form onSubmit={onSubmit} className="relative mt-7">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type your full name…"
                  autoComplete="off"
                  aria-label="Your full name"
                  className="field text-center text-lg"
                />
                <button
                  type="submit"
                  disabled={matches.length === 0}
                  className="btn-gold mt-4 w-full"
                >
                  {loading ? "Searching…" : "Reveal My Table"}
                </button>
              </form>

              {/* Suggestions / empty state */}
              <div className="mt-4 text-left">
                {touched && !loading && matches.length === 0 && (
                  <div className="rounded-sm border border-gold/20 bg-cream/60 px-5 py-5 text-center text-sm text-ink-soft">
                    We couldn&rsquo;t find that name. Try your first and last
                    name, or check the spelling — and if you&rsquo;re still
                    stuck, any usher will be glad to help.
                  </div>
                )}

                {matches.length > 0 && (
                  <ul className="divide-y divide-gold/15 overflow-hidden rounded-sm border border-gold/20 bg-cream/40">
                    {matches.map((m) => (
                      <li key={`${m.name}-${m.tableId}`}>
                        <button
                          type="button"
                          onClick={() => setSelected(m)}
                          className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gold/10"
                        >
                          <span className="font-serif text-lg text-ink">
                            {m.name}
                          </span>
                          <span className="text-[0.65rem] uppercase tracking-[0.18em] text-gold-deep">
                            {m.tableLabel}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <SeatReveal match={selected} onReset={reset} />
          )}
        </div>

        {/* Quiet links to the rest of the celebration */}
        <div
          className="reveal-rise mt-8 flex items-center justify-center gap-6 text-champagne/80"
          style={{ ["--reveal-delay" as string]: "0.3s" }}
        >
          <Link
            href="/program"
            className="text-[0.7rem] uppercase tracking-[0.24em] transition-colors hover:text-gold-light"
          >
            The Schedule
          </Link>
          <span className="text-gold/40">·</span>
          <a
            href="#celebration"
            className="text-[0.7rem] uppercase tracking-[0.24em] transition-colors hover:text-gold-light"
          >
            Details
          </a>
        </div>
      </div>
    </section>
  );
}

function SeatReveal({
  match,
  onReset,
}: {
  match: SeatMatch;
  onReset: () => void;
}) {
  const tableNumber =
    match.tableLabel.replace(/[^0-9]/g, "") || match.tableLabel;

  // Personalized program — carries the guest's name + seat into the printable
  // order of service so the downloaded PDF is theirs.
  const programHref = `/program?for=${encodeURIComponent(
    match.name
  )}&table=${encodeURIComponent(match.tableLabel)}${
    match.category ? `&group=${encodeURIComponent(match.category)}` : ""
  }`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="card-lux relative overflow-hidden px-7 py-9 text-center"
    >
      {/* soft gold radial glow */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--color-gold) 35%, transparent), transparent)",
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="eyebrow"
      >
        You are seated at
      </motion.p>

      <div className="my-3 flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.7 }}
          className="flex items-baseline justify-center gap-3"
        >
          <span className="font-serif text-xl text-ink-soft">Table</span>
          <span className="shimmer-text font-serif text-7xl font-medium leading-none sm:text-8xl">
            {tableNumber}
          </span>
        </motion.div>

        {match.category && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block max-w-full rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-center text-[0.65rem] uppercase tracking-[0.22em] text-gold-deep"
          >
            {match.category}
          </motion.span>
        )}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.36 }}
        className="mt-5 font-serif text-2xl italic text-ink"
      >
        Welcome, {match.name.split(" ")[0]}.
      </motion.p>

      {match.tablemates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          className="mt-7"
        >
          <Ornament className="mb-5" />
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-gold-deep">
            You&rsquo;ll be joined by
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {match.tablemates.map((g) => (
              <span
                key={g}
                className="rounded-full bg-olive/8 px-3.5 py-1.5 text-sm text-ink-soft"
              >
                {g}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Personalized program download — the headline action after the reveal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.56 }}
        className="mt-9"
      >
        <Link href={programHref} className="btn-gold w-full">
          <DownloadIcon />
          Download Your Program
        </Link>
        <p className="mt-3 text-xs text-ink-soft/80">
          Your name &amp; table are printed on it — a keepsake for the day.
        </p>
      </motion.div>

      <button
        onClick={onReset}
        className="mt-7 text-[0.7rem] uppercase tracking-[0.24em] text-ink-soft underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
      >
        Not you? Search again
      </button>
    </motion.div>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
