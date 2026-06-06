"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SeatMatch } from "@/lib/types";
import { Ornament } from "./Ornament";

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FindSeat() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SeatMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [selected, setSelected] = useState<SeatMatch | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      className="relative scroll-mt-20 bg-gradient-to-b from-ivory to-cream px-6 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">Be Our Guest</p>
        <h2 className="mt-4 text-4xl sm:text-5xl">Find Your Seat</h2>
        <Ornament className="my-6" />
        <p className="mx-auto max-w-md text-base leading-relaxed text-ink-soft">
          Enter your name below and we&rsquo;ll show you to your table for the
          evening.
        </p>

        <div className="relative mt-10">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <form onSubmit={onSubmit} className="relative">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Francis Aggrey"
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

                {/* Suggestions */}
                <div className="mt-4 text-left">
                  {touched && !loading && matches.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="card-lux px-5 py-5 text-center text-sm text-ink-soft"
                    >
                      We couldn&rsquo;t find that name. Try your first and last
                      name, or check the spelling — and if you&rsquo;re still
                      stuck, any usher will be glad to help.
                    </motion.div>
                  )}

                  {matches.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-lux divide-y divide-gold/15 overflow-hidden"
                    >
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
                    </motion.ul>
                  )}
                </div>
              </motion.div>
            ) : (
              <SeatReveal key="reveal" match={selected} onReset={reset} />
            )}
          </AnimatePresence>
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
  const tableNumber = match.tableLabel.replace(/[^0-9]/g, "") || match.tableLabel;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="card-lux relative overflow-hidden px-7 py-10 text-center"
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.7 }}
        className="my-2 flex items-baseline justify-center gap-3"
      >
        <span className="font-serif text-xl text-ink-soft">Table</span>
        <span className="shimmer-text font-serif text-7xl font-medium sm:text-8xl">
          {tableNumber}
        </span>
      </motion.div>

      {match.category && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-gold-deep"
        >
          {match.category}
        </motion.span>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.36 }}
        className="mt-6 font-serif text-2xl italic text-ink"
      >
        Welcome, {match.name.split(" ")[0]}.
      </motion.p>

      {match.tablemates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          className="mt-8"
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

      <button
        onClick={onReset}
        className="mt-9 text-[0.7rem] uppercase tracking-[0.24em] text-ink-soft underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
      >
        Not you? Search again
      </button>
    </motion.div>
  );
}
