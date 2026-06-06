import Image from "next/image";
import { Reveal } from "./Reveal";
import { Ornament } from "./Ornament";

const PHOTOS = [
  { src: "/images/couple-bw-1.jpg", pos: "50% 22%", offset: "md:mt-14" },
  { src: "/images/couple-bw-2.jpg", pos: "50% 28%", offset: "md:-mt-6" },
  { src: "/images/couple-bw-3.jpg", pos: "50% 38%", offset: "md:mt-14" },
];

export function Gallery({ hashtag }: { hashtag: string }) {
  return (
    <section className="relative overflow-hidden bg-forest px-6 py-24 text-champagne sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="eyebrow" style={{ color: "var(--color-gold-light)" }}>
            Our Journey
          </p>
          <h2 className="mt-4 text-4xl text-champagne sm:text-5xl">
            A Love Worth Celebrating
          </h2>
          <Ornament className="mx-auto my-6" color="var(--color-gold-light)" />
          <p className="mx-auto max-w-lg font-serif text-lg italic leading-relaxed text-champagne/80">
            Two stories becoming one. Thank you for being here to witness the
            beginning of forever.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PHOTOS.map((p, i) => (
            <Reveal key={p.src} delay={i * 0.12} className={p.offset}>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-sm">
                <div className="pointer-events-none absolute inset-2.5 z-10 border border-gold-light/25 transition-all duration-500 group-hover:inset-3.5" />
                <Image
                  src={p.src}
                  alt="Josephine & Jeffrey"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  style={{ objectPosition: p.pos }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent" />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-14 text-center">
          <p className="text-sm uppercase tracking-[0.34em] text-gold-light/90">
            Share your moments · {hashtag}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
