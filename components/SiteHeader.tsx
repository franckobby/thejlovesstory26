"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";

export function SiteHeader({
  monogram,
  variant = "overlay",
  showSeatLink = true,
}: {
  monogram: string;
  variant?: "overlay" | "solid";
  /** Hide the "Find Your Seat" nav link (redundant on the home page, which is
   *  itself the seat finder). */
  showSeatLink?: boolean;
}) {
  const [scrolled, setScrolled] = useState(variant === "solid");

  useEffect(() => {
    if (variant === "solid") return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const dark = scrolled || variant === "solid";

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 print:hidden",
        dark
          ? "bg-forest/95 backdrop-blur-md shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-serif text-2xl tracking-wide text-champagne transition-opacity hover:opacity-80"
        >
          {monogram}
        </Link>
        <nav className="flex items-center gap-5 sm:gap-9">
          {showSeatLink && (
            <Link
              href="/#seat"
              className="text-[0.7rem] uppercase tracking-[0.22em] text-champagne/90 transition-colors hover:text-gold-light"
            >
              Find Your Seat
            </Link>
          )}
          <Link
            href="/program"
            className="text-[0.7rem] uppercase tracking-[0.22em] text-champagne/90 transition-colors hover:text-gold-light"
          >
            Schedule
          </Link>
        </nav>
      </div>
    </header>
  );
}
