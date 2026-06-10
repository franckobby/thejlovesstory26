import Image from "next/image";
import Link from "next/link";
import { getEvent } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { FindSeat } from "@/components/FindSeat";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/Reveal";
import { Ornament } from "@/components/Ornament";

export const dynamic = "force-dynamic";

// The original guest landing — a cinematic hero followed by a separate
// "Find Your Seat" section. Preserved here at /classic; the new scan-first
// arrival lives at /.
export default async function ClassicHome() {
  const event = await getEvent();
  const dateLong = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <SiteHeader monogram={event.monogram} variant="overlay" />
      <main>
        <Hero event={event} />
        <FindSeat />

        {/* When & Where */}
        <section className="bg-gradient-to-b from-cream to-ivory px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <p className="eyebrow">The Celebration</p>
              <h2 className="mt-4 text-4xl sm:text-5xl">When &amp; Where</h2>
              <Ornament className="mx-auto my-6" />
              <p className="font-serif text-2xl italic text-ink-soft sm:text-3xl">
                {dateLong}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-12">
              <Countdown targetISO={event.date} />
            </Reveal>

            <Reveal delay={0.06} className="mt-14">
              <div className="card-lux mx-auto max-w-xl px-8 py-12 text-center">
                <p className="eyebrow">The Venue</p>
                <h3 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
                  {event.receptionVenue}
                </h3>
                <p className="mt-2 text-ink-soft">{event.receptionAddress}</p>

                <div className="mx-auto my-8 h-px w-12 bg-gold/40" />

                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow">The Ceremony</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gold-deep">
                      {event.timeDisplay}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">The Reception</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gold-deep">
                      {event.receptionTime}
                    </p>
                    <p className="mt-1.5 text-xs uppercase tracking-[0.22em] text-ink-soft">
                      Dinner &amp; Dancing to Follow
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Gallery hashtag={event.hashtag} />

        {/* Schedule invitation */}
        <section className="relative overflow-hidden bg-forest-2 text-champagne">
          <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
            <div className="relative h-72 md:h-[34rem]">
              <Image
                src="/images/couple-bw-3.jpg"
                alt="Josephine & Jeffrey"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-forest-2/70" />
            </div>
            <div className="flex flex-col justify-center px-8 py-16 text-center md:px-14 md:text-left">
              <Reveal>
                <p className="eyebrow" style={{ color: "var(--color-gold-light)" }}>
                  The Day
                </p>
                <h2 className="mt-4 text-4xl text-champagne sm:text-5xl">
                  The Schedule
                </h2>
                <div className="mx-auto my-6 h-px w-16 bg-gold-light/60 md:mx-0" />
                <p className="mx-auto max-w-md font-serif text-lg italic leading-relaxed text-champagne/80 md:mx-0">
                  Follow along with every moment of the ceremony and the evening
                  to come — view it online, or take a beautifully printed copy
                  with you.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:items-start">
                  <Link href="/program" className="btn-gold">
                    View the Schedule
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer event={event} />
    </>
  );
}
