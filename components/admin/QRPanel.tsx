"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import type { EventDetails } from "@/lib/types";
import { generateQrCardPdf } from "@/lib/qrCard";

// A large off-screen render so the downloaded PNG / PDF QR is crisp in print.
const EXPORT_SIZE = 1024;

export function QRPanel({ event }: { event: EventDetails }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  const exportCanvas = () =>
    exportRef.current?.querySelector("canvas") as HTMLCanvasElement | null;

  function downloadPNG() {
    const canvas = exportCanvas();
    if (!canvas || busy) return;
    setBusy("png");
    try {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "josephine-jeffrey-seating-qr.png";
      a.click();
    } finally {
      setBusy(null);
    }
  }

  async function downloadPDF() {
    const canvas = exportCanvas();
    if (!canvas || busy) return;
    setBusy("pdf");
    try {
      await generateQrCardPdf({
        event,
        url,
        qrDataUrl: canvas.toDataURL("image/png"),
      });
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* High-resolution QR rendered off-screen, used for PNG + PDF export. */}
      <div
        ref={exportRef}
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] top-0 opacity-0"
      >
        {url && (
          <QRCodeCanvas
            value={url}
            size={EXPORT_SIZE}
            level="M"
            marginSize={2}
            fgColor="#161d14"
            bgColor="#ffffff"
          />
        )}
      </div>

      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* QR tile preview */}
        <div className="flex justify-center">
          <div className="card-lux flex flex-col items-center gap-4 p-7">
            <div className="rounded-sm border border-gold/30 bg-white p-4">
              {url ? (
                <QRCodeCanvas
                  value={url}
                  size={224}
                  level="M"
                  marginSize={1}
                  fgColor="#161d14"
                  bgColor="#ffffff"
                />
              ) : (
                <div className="h-[224px] w-[224px] animate-pulse bg-cream" />
              )}
            </div>
            <p className="text-center text-[0.65rem] uppercase tracking-[0.24em] text-gold-deep">
              Scan to find your seat
            </p>
          </div>
        </div>

        {/* Controls */}
        <div>
          <p className="eyebrow">Guest Link</p>
          <h3 className="mt-3 font-serif text-2xl text-ink">Your QR Code</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Download the <strong>printable poster</strong> (a ready-to-print A4
            with your names and instructions) to display at the entrance, or grab
            a high-resolution PNG of just the code for table cards. Guests scan it
            to find their seat and view the schedule.
          </p>

          <label className="mt-6 block text-[0.65rem] uppercase tracking-[0.2em] text-gold-deep">
            Link the code points to
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="field mt-2 text-sm"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-ink-soft/80">
            Tip: after you deploy, paste your live web address here and
            re-download.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={downloadPDF}
              disabled={busy !== null || !url}
              className="btn-gold"
            >
              {busy === "pdf" ? "Preparing…" : "Download Printable Poster"}
            </button>
            <button
              onClick={downloadPNG}
              disabled={busy !== null || !url}
              className="btn-outline"
            >
              Download QR (PNG)
            </button>
            <button onClick={copyLink} className="btn-outline">
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
