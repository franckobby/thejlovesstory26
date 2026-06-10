"use client";

import Link from "next/link";
import { useEffect } from "react";

export function ProgramActions({
  guestName = "",
  tableLabel = "",
}: {
  guestName?: string;
  tableLabel?: string;
}) {
  // Give the saved PDF a personal filename. window.print() uses document.title
  // as the default "Save as PDF" name, so set it while this page is shown.
  useEffect(() => {
    if (!guestName) return;
    const prev = document.title;
    const safe = guestName.replace(/[^\p{L}\p{N} ]/gu, "").trim() || "Guest";
    document.title = `Program · ${safe}${tableLabel ? ` · ${tableLabel}` : ""}`;
    return () => {
      document.title = prev;
    };
  }, [guestName, tableLabel]);

  return (
    <div className="no-print mx-auto mb-12 flex max-w-xl flex-col items-center justify-center gap-3 sm:flex-row">
      <button onClick={() => window.print()} className="btn-gold w-full sm:w-auto">
        {guestName ? "Download Your Program" : "Download / Print"}
      </button>
      <Link href="/#seat" className="btn-outline w-full sm:w-auto">
        Find Your Seat
      </Link>
    </div>
  );
}
