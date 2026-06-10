import Link from "next/link";
import type { EventDetails } from "@/lib/types";
import { Ornament } from "./Ornament";

export function Footer({ event }: { event: EventDetails }) {
  return (
    <footer className="relative overflow-hidden bg-forest px-6 py-20 text-center text-champagne">
      <div className="mx-auto max-w-2xl">
        <p className="font-script text-5xl text-gold-light sm:text-6xl">
          {event.coupleNames}
        </p>
        <Ornament className="my-7" color="var(--color-gold-light)" />
        <p className="mx-auto max-w-md font-serif text-lg italic leading-relaxed text-champagne/85">
          {event.thankYou}
        </p>
        <p className="mt-8 text-sm uppercase tracking-[0.32em] text-gold-light/90">
          {event.hashtag}
        </p>
        <div className="mt-10 flex items-center justify-center gap-6 text-[0.7rem] uppercase tracking-[0.2em] text-champagne/60">
          <Link href="/#seat" className="transition-colors hover:text-gold-light">
            Find Your Seat
          </Link>
          <span className="text-sage/50">·</span>
          <Link href="/program" className="transition-colors hover:text-gold-light">
            Schedule
          </Link>
          <span className="text-sage/50">·</span>
          <Link href="/classic" className="transition-colors hover:text-gold-light">
            Classic Site
          </Link>
        </div>
        <p className="mt-12 text-[0.65rem] uppercase tracking-[0.25em] text-champagne/35">
          With love · {new Date(event.date).getFullYear()}
        </p>
      </div>
    </footer>
  );
}
