"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export function QRPanel() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  function downloadPNG() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "josephine-jeffrey-seating-qr.png";
    a.click();
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
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* QR tile */}
        <div className="flex justify-center">
          <div
            ref={wrapRef}
            className="card-lux flex flex-col items-center gap-4 p-7"
          >
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
            Print this code on table cards or place it at the entrance. Guests
            scan it to find their seat and view the order of service.
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
            re-download the code.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={downloadPNG} className="btn-gold">
              Download PNG
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
