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
    <ol className="mt-8">
      {items.map((it, i) => (
        <li
          key={`${it.time}-${i}`}
          className="print-avoid-break grid grid-cols-[5rem_1fr] gap-5 sm:grid-cols-[7rem_1fr] sm:gap-7"
        >
          <div className="pt-0.5 text-right font-serif text-base text-gold-deep sm:text-lg">
            {it.time}
          </div>
          <div className="relative border-l border-gold/30 pb-8 pl-6">
            <span className="absolute -left-[5px] top-[7px] h-2.5 w-2.5 rounded-full bg-gold ring-4 ring-ivory" />
            <h4 className="font-serif text-xl text-ink sm:text-2xl">{it.title}</h4>
            {it.description && (
              <p className="mt-1 text-sm leading-relaxed text-ink-soft sm:text-base">
                {it.description}
              </p>
            )}
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

  // Personalization carried over from the seat finder. When present, the guest's
  // name + table are printed on the program so the downloaded PDF is theirs.
  const guestName = params.for?.trim() || "";
  const tableLabel = params.table?.trim() || "";
  const groupLabel = params.group?.trim() || "";

  return (
    <>
      <SiteHeader monogram={event.monogram} variant="solid" />
      <main className="bg-ivory px-6 pb-24 pt-28 sm:pt-32">
        <div className="print-sheet mx-auto max-w-2xl">
          <ProgramActions guestName={guestName} tableLabel={tableLabel} />

          {/* Personalized place card — prints onto the PDF */}
          {guestName && (
            <div className="print-avoid-break mb-12 overflow-hidden rounded-sm border border-gold/40 bg-gradient-to-br from-[#fffdf8] to-cream shadow-[var(--shadow-soft)]">
              <div className="flex flex-col items-center gap-1 px-6 py-7 text-center sm:flex-row sm:justify-between sm:px-9 sm:text-left">
                <div>
                  <p className="eyebrow">Prepared for</p>
                  <p className="mt-1.5 font-script text-4xl text-ink sm:text-5xl">
                    {guestName}
                  </p>
                </div>
                <div className="mt-3 flex flex-col items-center sm:mt-0 sm:items-end">
                  <p className="text-[0.62rem] uppercase tracking-[0.28em] text-gold-deep">
                    Your Seat
                  </p>
                  <p className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
                    {tableLabel || "—"}
                  </p>
                  {groupLabel && (
                    <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                      {groupLabel}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Masthead */}
          <header className="text-center">
            <p className="font-serif text-lg tracking-[0.2em] text-gold-deep">
              {event.monogram}
            </p>
            <p className="eyebrow mt-6">The Wedding Celebration of</p>
            <h1 className="mt-4 font-script text-6xl text-ink sm:text-7xl">
              {event.coupleNames}
            </h1>
            <Ornament className="mx-auto my-7" />
            <p className="text-sm uppercase tracking-[0.26em] text-ink-soft">
              {dateLong}
            </p>
            <p className="mt-1 text-sm uppercase tracking-[0.26em] text-ink-soft">
              {event.ceremonyVenue} · {event.city}
            </p>
          </header>

          {/* Ceremony */}
          <section className="mt-16 print-avoid-break">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl">The Ceremony</h2>
              <div className="mx-auto mt-3 h-px w-14 bg-gold/50" />
            </div>
            <Timeline items={program.ceremony} />
          </section>

          {/* Reception */}
          <section className="mt-14">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl">The Reception</h2>
              <div className="mx-auto mt-3 h-px w-14 bg-gold/50" />
            </div>
            <Timeline items={program.reception} />
          </section>

          {/* Closing */}
          <footer className="mt-16 text-center print-avoid-break">
            <Ornament className="mx-auto mb-6" />
            <p className="mx-auto max-w-md font-serif text-xl italic leading-relaxed text-ink">
              {event.thankYou}
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.3em] text-gold-deep">
              {event.hashtag}
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
