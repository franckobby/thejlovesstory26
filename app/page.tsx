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

export default async function Home() {
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
              <p className="mt-2 text-sm uppercase tracking-[0.28em] text-gold-deep">
                {event.timeDisplay}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-12">
              <Countdown targetISO={event.date} />
            </Reveal>

            <div className="mt-16 grid gap-6 sm:grid-cols-2">
              <Reveal delay={0.05}>
                <div className="card-lux flex h-full flex-col px-8 py-10">
                  <p className="eyebrow">The Ceremony</p>
                  <h3 className="mt-3 font-serif text-2xl text-ink">
                    {event.ceremonyVenue}
                  </h3>
                  <p className="mt-2 text-ink-soft">{event.ceremonyAddress}</p>
                  <p className="mt-auto pt-5 text-sm uppercase tracking-[0.2em] text-gold-deep">
                    {event.timeDisplay}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="card-lux flex h-full flex-col px-8 py-10">
                  <p className="eyebrow">The Reception</p>
                  <h3 className="mt-3 font-serif text-2xl text-ink">
                    {event.receptionVenue}
                  </h3>
                  <p className="mt-2 text-ink-soft">{event.receptionAddress}</p>
                  <p className="mt-auto pt-5 text-sm uppercase tracking-[0.2em] text-gold-deep">
                    Dinner &amp; Dancing to Follow
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <p className="mt-10 text-sm uppercase tracking-[0.26em] text-ink-soft">
                Dress Code · {event.dressCode}
              </p>
            </Reveal>
          </div>
        </section>

        <Gallery hashtag={event.hashtag} />

        {/* Order of Service invitation */}
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
                  The Programme
                </p>
                <h2 className="mt-4 text-4xl text-champagne sm:text-5xl">
                  Order of Service
                </h2>
                <div className="mx-auto my-6 h-px w-16 bg-gold-light/60 md:mx-0" />
                <p className="mx-auto max-w-md font-serif text-lg italic leading-relaxed text-champagne/80 md:mx-0">
                  Follow along with every moment of the ceremony and the evening
                  to come — view it online, or take a beautifully printed copy
                  with you.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:items-start">
                  <Link href="/program" className="btn-gold">
                    View the Order of Service
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
