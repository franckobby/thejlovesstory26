"use client";

import { useState } from "react";
import type { EventDetails, ProgramData } from "@/lib/types";
import { generateProgramPdf } from "@/lib/programPdf";

/** A small, unobtrusive "download as PDF" control for the schedule page. */
export function ProgramActions({
  event,
  program,
  guestName = "",
  tableLabel = "",
  groupLabel = "",
}: {
  event: EventDetails;
  program: ProgramData;
  guestName?: string;
  tableLabel?: string;
  groupLabel?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  async function download() {
    if (downloading) return;
    setDownloading(true);
    try {
      await generateProgramPdf({
        event,
        program,
        guestName: guestName || undefined,
        tableLabel: tableLabel || undefined,
        groupLabel: groupLabel || undefined,
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={downloading}
      aria-label="Download the program as a PDF"
      className="no-print inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-gold/40 bg-[#fffdf8] px-3 py-2 text-[0.6rem] uppercase tracking-[0.18em] text-gold-deep shadow-[var(--shadow-soft)] transition-colors hover:bg-gold/10 disabled:opacity-60"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v12" />
        <path d="m7 11 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      {downloading ? "…" : "PDF"}
    </button>
  );
}
