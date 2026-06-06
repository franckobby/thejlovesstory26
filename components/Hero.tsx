"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { EventDetails } from "@/lib/types";
import { Ornament } from "./Ornament";

const EASE = [0.2, 0.8, 0.2, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

export function Hero({ event }: { event: EventDetails }) {
  const dateLong = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="relative flex h-[100svh] min-h-[640px] items-center justify-center overflow-hidden">
      {/* Photograph */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-kenburns">
          <Image
            src="/images/couple-hero.jpg"
            alt={`${event.coupleNames}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "50% 36%" }}
          />
        </div>
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest/55 via-forest/15 to-forest/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-forest/15" />
      </div>

      {/* Decorative gold frame */}
      <div className="pointer-events-none absolute inset-3 z-10 border border-gold/30 sm:inset-5" />
      <div className="pointer-events-none absolute inset-4 z-10 border border-gold/10 sm:inset-6" />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-20 flex flex-col items-center px-6 text-center text-champagne"
      >
        <motion.p
          variants={item}
          className="eyebrow text-gold-light/90"
          style={{ color: "var(--color-gold-light)" }}
        >
          Together with their families
        </motion.p>

        <motion.div
          variants={item}
          className="mt-7 flex flex-col items-center leading-[0.95]"
        >
          <span className="font-serif text-6xl font-light tracking-tight text-shadow-lux sm:text-8xl">
            {event.bride}
          </span>
          <span className="my-1 font-script text-5xl text-gold-light text-shadow-lux sm:my-2 sm:text-7xl">
            &amp;
          </span>
          <span className="font-serif text-6xl font-light tracking-tight text-shadow-lux sm:text-8xl">
            {event.groom}
          </span>
        </motion.div>

        <motion.div variants={item}>
          <Ornament className="my-8" color="var(--color-gold-light)" />
        </motion.div>

        <motion.p
          variants={item}
          className="text-sm uppercase tracking-[0.28em] text-champagne/90 sm:text-base"
        >
          {dateLong}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-2 text-xs uppercase tracking-[0.34em] text-champagne/65"
        >
          {event.city}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a href="#seat" className="btn-gold">
            Find Your Seat
          </a>
          <a href="/program" className="btn-outline btn-ghost-light">
            Order of Service
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <a
        href="#seat"
        className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-champagne/70 transition-colors hover:text-gold-light"
        aria-label="Scroll to find your seat"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="animate-floaty text-lg">⌄</span>
      </a>
    </section>
  );
}
