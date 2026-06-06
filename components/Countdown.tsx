"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diff(target: number): Parts {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ targetISO }: { targetISO: string }) {
  const target = new Date(targetISO).getTime();
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(diff(target));
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number][] = parts
    ? [
        ["Days", parts.days],
        ["Hours", parts.hours],
        ["Minutes", parts.minutes],
        ["Seconds", parts.seconds],
      ]
    : [
        ["Days", 0],
        ["Hours", 0],
        ["Minutes", 0],
        ["Seconds", 0],
      ];

  const passed = parts && target - Date.now() <= 0;

  if (passed) {
    return (
      <p className="font-serif text-2xl italic text-gold">
        Today we celebrate. Welcome!
      </p>
    );
  }

  return (
    <div className="flex items-stretch justify-center gap-3 sm:gap-6">
      {units.map(([label, value], i) => (
        <div key={label} className="flex items-stretch gap-3 sm:gap-6">
          <div className="flex min-w-[64px] flex-col items-center sm:min-w-[88px]">
            <span
              className="font-serif text-4xl tabular-nums text-ink sm:text-6xl"
              suppressHydrationWarning
            >
              {String(value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-gold-deep sm:text-xs">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="self-start font-serif text-3xl text-sage sm:text-5xl">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
