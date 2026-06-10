"use client";

import Link from "next/link";
import { useState } from "react";
import type { EventDetails, ProgramData } from "@/lib/types";
import { generateProgramPdf } from "@/lib/programPdf";

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
    <div className="no-print mx-auto mb-12 flex max-w-xl flex-col items-center justify-center gap-3 sm:flex-row">
      <button
        onClick={download}
        disabled={downloading}
        className="btn-gold w-full sm:w-auto"
      >
        {downloading
          ? "Preparing…"
          : guestName
            ? "Download Your Program"
            : "Download Program"}
      </button>
      <Link href="/#seat" className="btn-outline w-full sm:w-auto">
        Find Your Seat
      </Link>
    </div>
  );
}
