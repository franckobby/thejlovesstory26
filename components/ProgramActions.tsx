"use client";

import Link from "next/link";

export function ProgramActions() {
  return (
    <div className="no-print mx-auto mb-12 flex max-w-xl flex-col items-center justify-center gap-3 sm:flex-row">
      <button onClick={() => window.print()} className="btn-gold w-full sm:w-auto">
        Download / Print
      </button>
      <Link href="/#seat" className="btn-outline w-full sm:w-auto">
        Find Your Seat
      </Link>
    </div>
  );
}
