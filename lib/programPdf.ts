import type { EventDetails, ProgramData, ProgramItem } from "./types";

type RGB = [number, number, number];

const GOLD: RGB = [184, 145, 80];
const GOLD_DEEP: RGB = [154, 118, 55];
const INK: RGB = [32, 35, 26];
const INK_SOFT: RGB = [88, 92, 78];
const CREAM: RGB = [247, 242, 231];

export interface ProgramPdfOptions {
  event: EventDetails;
  program: ProgramData;
  guestName?: string;
  tableLabel?: string;
  groupLabel?: string;
}

/** Turn a guest name into a safe, pretty file name. */
function fileName(guestName?: string, tableLabel?: string): string {
  const base = guestName
    ? `Program - ${guestName}${tableLabel ? ` - ${tableLabel}` : ""}`
    : "Josephine & Jeffrey - Program";
  return `${base.replace(/[^\p{L}\p{N} &-]/gu, "").trim()}.pdf`;
}

// jsPDF's instance type isn't worth importing here; the drawing helpers only
// touch a small, stable slice of its API.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = any;

/**
 * Lay the order-of-service out as a premium A4 document: a centered masthead,
 * an optional personalized place card (guest name + seat), two timeline
 * sections with a gold rail, and a closing. Returns the jsPDF doc.
 */
function buildProgramDoc(jsPDFCtor: any, opts: ProgramPdfOptions): Doc {
  const { event, program, guestName, tableLabel, groupLabel } = opts;
  const doc: Doc = new jsPDFCtor({ unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 24;
  const contentW = pageW - marginX * 2;
  const centerX = pageW / 2;
  const bottom = pageH - 26;
  let y = 0;

  const tc = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const dc = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const fc = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);

  const frame = () => {
    dc(GOLD);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, pageW - 20, pageH - 20);
    doc.setLineWidth(0.2);
    doc.rect(12, 12, pageW - 24, pageH - 24);
  };
  const ensure = (space: number) => {
    if (y + space > bottom) {
      doc.addPage();
      frame();
      y = 28;
    }
  };
  const ornament = (cy: number) => {
    dc(GOLD);
    doc.setLineWidth(0.3);
    doc.line(centerX - 26, cy, centerX - 5, cy);
    doc.line(centerX + 5, cy, centerX + 26, cy);
    fc(GOLD);
    doc.triangle(centerX, cy - 1.6, centerX - 1.6, cy, centerX, cy + 1.6, "F");
    doc.triangle(centerX, cy - 1.6, centerX + 1.6, cy, centerX, cy + 1.6, "F");
  };
  // Pick the largest font size (<= start) at which `text` fits `maxW`.
  const fitSize = (text: string, maxW: number, start: number, min = 10) => {
    let size = start;
    while (size > min) {
      doc.setFontSize(size);
      if (doc.getTextWidth(text) <= maxW) break;
      size -= 0.5;
    }
    return size;
  };

  frame();

  // ---- Masthead ----
  y = 30;
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  tc(GOLD_DEEP);
  doc.text(event.monogram.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 3,
  });

  y = 41;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  tc(GOLD_DEEP);
  doc.text("THE WEDDING CELEBRATION OF", centerX, y, {
    align: "center",
    charSpace: 1.6,
  });

  y = 57;
  doc.setFont("times", "normal");
  tc(INK);
  doc.setFontSize(fitSize(event.coupleNames, contentW, 31, 18));
  doc.text(event.coupleNames, centerX, y, { align: "center" });

  y = 66;
  ornament(y);

  y = 74;
  const dateLong = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  tc(INK_SOFT);
  doc.text(dateLong.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 1,
  });

  y = 80;
  doc.setFontSize(8.5);
  doc.text(`${event.ceremonyVenue}  ·  ${event.city}`.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 1,
  });
  y = 92;

  // ---- Personalized place card ----
  if (guestName) {
    const h = 30;
    ensure(h + 12);
    fc(CREAM);
    dc(GOLD);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginX, y, contentW, h, 1.5, 1.5, "FD");
    dc(GOLD);
    doc.setLineWidth(0.2);
    doc.line(centerX, y + 6, centerX, y + h - 6);

    const pad = 12;
    // Left — name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    tc(GOLD_DEEP);
    doc.text("PREPARED FOR", marginX + pad, y + 12, { charSpace: 1.4 });
    doc.setFont("times", "italic");
    tc(INK);
    doc.setFontSize(fitSize(guestName, centerX - (marginX + pad) - 5, 19, 12));
    doc.text(guestName, marginX + pad, y + 22);

    // Right — seat
    const rx = marginX + contentW - pad;
    const rightMaxW = rx - centerX - 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    tc(GOLD_DEEP);
    doc.text("YOUR SEAT", rx, y + 12, { align: "right", charSpace: 1.4 });
    doc.setFont("times", "normal");
    tc(INK);
    doc.setFontSize(fitSize(tableLabel || "—", rightMaxW, 19, 12));
    doc.text(tableLabel || "—", rx, y + 22, { align: "right" });
    if (groupLabel) {
      doc.setFont("helvetica", "normal");
      tc(INK_SOFT);
      doc.setFontSize(fitSize(groupLabel.toUpperCase(), rightMaxW, 6.8, 5));
      doc.text(groupLabel.toUpperCase(), rx, y + 27, {
        align: "right",
        charSpace: 0.6,
      });
    }
    y += h + 18;
  }

  // ---- Timeline section ----
  const section = (title: string, items: ProgramItem[]) => {
    ensure(26);
    doc.setFont("times", "normal");
    doc.setFontSize(19);
    tc(INK);
    doc.text(title, centerX, y, { align: "center" });
    y += 3.5;
    dc(GOLD);
    doc.setLineWidth(0.4);
    doc.line(centerX - 10, y, centerX + 10, y);
    y += 11;

    const timeW = 22;
    const railX = marginX + timeW + 6;
    const textX = railX + 7;
    const textW = contentW - (textX - marginX);

    for (const it of items) {
      doc.setFont("times", "normal");
      doc.setFontSize(12.5);
      const titleLines = doc.splitTextToSize(it.title, textW) as string[];
      let descLines: string[] = [];
      if (it.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.6);
        descLines = doc.splitTextToSize(it.description, textW) as string[];
      }
      const blockH =
        Math.max(titleLines.length * 5.6 + descLines.length * 4.3, 6) + 7;
      ensure(blockH);
      const top = y;

      // Time
      doc.setFont("times", "italic");
      doc.setFontSize(10.5);
      tc(GOLD_DEEP);
      doc.text(it.time, marginX + timeW, y + 0.5, { align: "right" });

      // Rail + dot
      dc(GOLD);
      doc.setLineWidth(0.25);
      doc.line(railX, top - 2.5, railX, top + blockH - 4);
      fc(GOLD);
      doc.circle(railX, top - 0.6, 1.1, "F");
      fc(CREAM);
      doc.circle(railX, top - 0.6, 0.45, "F");

      // Title
      doc.setFont("times", "normal");
      doc.setFontSize(12.5);
      tc(INK);
      let ty = y;
      for (const line of titleLines) {
        doc.text(line, textX, ty);
        ty += 5.6;
      }
      // Description
      if (descLines.length) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.6);
        tc(INK_SOFT);
        ty += 0.5;
        for (const line of descLines) {
          doc.text(line, textX, ty);
          ty += 4.3;
        }
      }
      y = top + blockH;
    }
    y += 8;
  };

  section("The Ceremony", program.ceremony);
  section("The Reception", program.reception);

  // ---- Closing ----
  ensure(34);
  ornament(y);
  y += 10;
  doc.setFont("times", "italic");
  doc.setFontSize(12.5);
  tc(INK);
  for (const line of doc.splitTextToSize(
    event.thankYou,
    contentW - 24
  ) as string[]) {
    doc.text(line, centerX, y, { align: "center" });
    y += 6.2;
  }
  y += 3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  tc(GOLD_DEEP);
  doc.text(event.hashtag.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 1,
  });

  return doc;
}

/**
 * Build the order-of-service as a premium A4 PDF and trigger an immediate
 * download — no print dialog. When a guest name + table are supplied they are
 * printed on a personalized place card at the top, making the file their own
 * keepsake.
 */
export async function generateProgramPdf(opts: ProgramPdfOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = buildProgramDoc(jsPDF, opts);
  doc.save(fileName(opts.guestName, opts.tableLabel));
}
