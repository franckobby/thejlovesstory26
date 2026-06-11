import type { EventDetails } from "./types";

type RGB = [number, number, number];
const GOLD: RGB = [184, 145, 80];
const GOLD_DEEP: RGB = [154, 118, 55];
const INK: RGB = [32, 35, 26];
const INK_SOFT: RGB = [88, 92, 78];

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface QrCardOptions {
  event: EventDetails;
  url: string;
  qrDataUrl: string;
}

/**
 * Build a premium, print-ready A4 poster around the guest QR code — couple's
 * names, "Find Your Seat", scan instructions and the code. Returns the jsPDF doc.
 */
export function buildQrCardDoc(jsPDFCtor: any, opts: QrCardOptions): any {
  const { event, url, qrDataUrl } = opts;
  const doc: any = new jsPDFCtor({ unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const cx = pageW / 2;

  const tc = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const dc = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const fc = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const fit = (text: string, maxW: number, start: number, min = 12) => {
    let s = start;
    while (s > min) {
      doc.setFontSize(s);
      if (doc.getTextWidth(text) <= maxW) break;
      s -= 0.5;
    }
    return s;
  };
  const ornament = (y: number) => {
    dc(GOLD);
    doc.setLineWidth(0.4);
    doc.line(cx - 26, y, cx - 5, y);
    doc.line(cx + 5, y, cx + 26, y);
    fc(GOLD);
    doc.triangle(cx, y - 1.7, cx - 1.7, y, cx, y + 1.7, "F");
    doc.triangle(cx, y - 1.7, cx + 1.7, y, cx, y + 1.7, "F");
  };

  // Frame
  dc(GOLD);
  doc.setLineWidth(0.7);
  doc.rect(11, 11, pageW - 22, pageH - 22);
  doc.setLineWidth(0.25);
  doc.rect(13, 13, pageW - 26, pageH - 26);

  // Names
  doc.setFont("times", "normal");
  tc(INK);
  doc.setFontSize(fit(event.coupleNames, pageW - 56, 34, 20));
  doc.text(event.coupleNames, cx, 60, { align: "center" });

  const dateLong = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  tc(INK_SOFT);
  doc.text(`${dateLong} · ${event.city}`.toUpperCase(), cx, 70, {
    align: "center",
    charSpace: 1,
  });

  ornament(80);

  // Prompt
  doc.setFont("times", "normal");
  doc.setFontSize(30);
  tc(INK);
  doc.text("Find Your Seat", cx, 100, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  tc(INK_SOFT);
  let iy = 111;
  for (const line of doc.splitTextToSize(
    "Scan with your phone camera to find your table and view the schedule.",
    pageW - 70
  ) as string[]) {
    doc.text(line, cx, iy, { align: "center" });
    iy += 6;
  }

  // QR code in a bordered white tile
  const qrSize = 116;
  const tile = qrSize + 16;
  const tileX = cx - tile / 2;
  const tileY = 122;
  fc([255, 255, 255]);
  dc(GOLD);
  doc.setLineWidth(0.5);
  doc.roundedRect(tileX, tileY, tile, tile, 2, 2, "FD");
  doc.addImage(
    qrDataUrl,
    "PNG",
    cx - qrSize / 2,
    tileY + 8,
    qrSize,
    qrSize,
    undefined,
    "FAST"
  );

  // URL caption
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  tc(INK_SOFT);
  const shown = url.replace(/^https?:\/\//, "");
  doc.text(shown, cx, tileY + tile + 10, { align: "center", charSpace: 0.5 });

  return doc;
}

/** Build the printable QR poster and download it. */
export async function generateQrCardPdf(opts: QrCardOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = buildQrCardDoc(jsPDF, opts);
  doc.save("josephine-jeffrey-find-your-seat.pdf");
}
