import type { Metadata } from "next";
import { getEvent, getProgram } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import { ProgramActions } from "@/components/ProgramActions";
import { Ornament } from "@/components/Ornament";
import type { ProgramItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Schedule · Josephine & Jeffrey",
  description: "The schedule for the wedding of Josephine & Jeffrey.",
};

export const dynamic = "force-dynamic";

function Timeline({ items }: { items: ProgramItem[] }) {
  return (
    <ol className="mt-7">
      {items.map((it, i) => (
        <li
          key={`${it.time}-${i}`}
          className="print-avoid-break grid grid-cols-[5.5rem_1fr] gap-3 sm:grid-cols-[7.5rem_1fr] sm:gap-6"
        >
          <div className="whitespace-nowrap pt-1 text-right font-serif text-sm text-gold-deep sm:text-base">
            {it.time}
          </div>
          <div className="relative border-l border-gold/30 pb-8 pl-5 sm:pl-6">
            <span className="absolute -left-[5px] top-[7px] h-2.5 w-2.5 rounded-full bg-gold ring-4 ring-ivory" />
            <h4 className="font-serif text-xl text-ink sm:text-2xl">{it.title}</h4>
            {it.description && (
              <p className="mt-1 text-sm leading-relaxed text-ink-soft sm:text-base">
                {it.description}
              </p>
            )}
            {it.groups?.map((g, gi) => (
              <div key={gi} className="mt-3">
                {g.label && (
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep">
                    {g.label}
                  </p>
                )}
                <ul className="mt-1.5 space-y-1">
                  {g.items.map((m, mi) => (
                    <li
                      key={mi}
                      className="text-sm leading-snug text-ink-soft sm:text-[0.95rem]"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ for?: string; table?: string; group?: string }>;
}) {
  const [event, program, params] = await Promise.all([
    getEvent(),
    getProgram(),
    searchParams,
  ]);
  const dateLong = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Personalization carried over from the seat finder (optional).
  const guestName = params.for?.trim() || "";
  const tableLabel = params.table?.trim() || "";
  const groupLabel = params.group?.trim() || "";

  return (
    <>
      <SiteHeader monogram={event.monogram} variant="solid" showSeatLink={false} />
      <main className="bg-ivory px-6 pb-24 pt-24 sm:pt-28">
        <div className="print-sheet mx-auto max-w-2xl">
          {/* Compact header — the schedule itself is the focus. A small
              download lives up here so it never pushes the program down. */}
          <header className="flex items-start justify-between gap-4 border-b border-gold/20 pb-5">
            <div>
              <p className="eyebrow">Schedule</p>
              <h1 className="mt-2 font-serif text-3xl font-light text-ink sm:text-4xl">
                {event.coupleNames}
              </h1>
              <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.22em] text-ink-soft">
                {dateLong} · {event.city}
              </p>
            </div>
            <ProgramActions
              event={event}
              program={program}
              guestName={guestName}
              tableLabel={tableLabel}
              groupLabel={groupLabel}
            />
          </header>

          {/* Slim personalized line (only when arriving from a seat reveal). */}
          {guestName && (
            <div className="mt-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-sm border border-gold/25 bg-cream/40 px-4 py-3">
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-gold-deep">
                Prepared for
              </span>
              <span className="font-serif text-lg text-ink">{guestName}</span>
              <span className="text-gold/50">·</span>
              <span className="font-sans text-lg font-medium tabular-nums text-ink">
                {tableLabel || "—"}
              </span>
              {groupLabel && (
                <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
                  · {groupLabel}
                </span>
              )}
            </div>
          )}

          {/* Ceremony — primary content */}
          <section className="mt-10 print-avoid-break">
            <h2 className="text-2xl text-ink sm:text-3xl">The Ceremony</h2>
            <div className="mt-2 h-px w-14 bg-gold/50" />
            <Timeline items={program.ceremony} />
          </section>

          {/* Reception */}
          <section className="mt-12">
            <h2 className="text-2xl text-ink sm:text-3xl">The Reception</h2>
            <div className="mt-2 h-px w-14 bg-gold/50" />
            <Timeline items={program.reception} />
          </section>

          {/* Closing */}
          <footer className="mt-14 text-center print-avoid-break">
            <Ornament className="mx-auto mb-5" />
            <p className="mx-auto max-w-md font-serif text-lg italic leading-relaxed text-ink">
              {event.thankYou}
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.3em] text-gold-deep">
              {event.hashtag}
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
