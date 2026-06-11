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
    ? `Schedule - ${guestName}${tableLabel ? ` - ${tableLabel}` : ""}`
    : "Josephine & Jeffrey - Schedule";
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
export function buildProgramDoc(jsPDFCtor: any, opts: ProgramPdfOptions): Doc {
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

  // ---- Compact header ----
  const dateLong = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  y = 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  tc(GOLD_DEEP);
  doc.text("WEDDING DAY SCHEDULE", centerX, y, {
    align: "center",
    charSpace: 1.8,
  });

  y = 31;
  doc.setFont("times", "normal");
  tc(INK);
  doc.setFontSize(fitSize(event.coupleNames, contentW, 23, 16));
  doc.text(event.coupleNames, centerX, y, { align: "center" });

  y = 37.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  tc(INK_SOFT);
  doc.text(`${dateLong}  ·  ${event.city}`.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 0.8,
  });

  y = 43;
  ornament(y);
  y = 50;

  // ---- Slim personalized line ----
  if (guestName) {
    const h = 13;
    fc(CREAM);
    dc(GOLD);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, y, contentW, h, 1.2, 1.2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    tc(GOLD_DEEP);
    doc.text("PREPARED FOR", centerX, y + 5, {
      align: "center",
      charSpace: 1.2,
    });

    const detail = [guestName, tableLabel || null, groupLabel || null]
      .filter(Boolean)
      .join("    ·    ");
    doc.setFont("times", "normal");
    tc(INK);
    doc.setFontSize(fitSize(detail, contentW - 16, 12, 8));
    doc.text(detail, centerX, y + 10.5, { align: "center" });

    y += h + 8;
  }

  // ---- Timeline section ----
  const section = (title: string, items: ProgramItem[]) => {
    ensure(24);
    doc.setFont("times", "normal");
    doc.setFontSize(17);
    tc(INK);
    doc.text(title, centerX, y, { align: "center" });
    y += 3;
    dc(GOLD);
    doc.setLineWidth(0.4);
    doc.line(centerX - 9, y, centerX + 9, y);
    y += 7.5;

    const timeW = 26;
    const railX = marginX + timeW + 6;
    const textX = railX + 7;
    const textW = contentW - (textX - marginX);

    for (const it of items) {
      // ---- Measure everything first (for clean page breaks) ----
      doc.setFont("times", "normal");
      doc.setFontSize(12.5);
      const titleLines = doc.splitTextToSize(it.title, textW) as string[];

      let descLines: string[] = [];
      if (it.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.6);
        descLines = doc.splitTextToSize(it.description, textW) as string[];
      }

      const groupBlocks = (it.groups ?? []).map((g) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.8);
        const itemLines = g.items.map(
          (m) => doc.splitTextToSize(m, textW - 2) as string[]
        );
        return { label: g.label, itemLines };
      });

      let blockH = Math.max(
        titleLines.length * 4.8 + descLines.length * 3.7,
        6
      );
      for (const gb of groupBlocks) {
        blockH += 2.2;
        if (gb.label) blockH += 4.0;
        for (const il of gb.itemLines) blockH += il.length * 3.7;
      }
      blockH += 3.5;

      ensure(blockH);
      const top = y;

      // Time
      doc.setFont("times", "italic");
      doc.setFontSize(9.5);
      tc(GOLD_DEEP);
      doc.text(it.time, marginX + timeW, y + 0.5, { align: "right" });

      // Rail + dot
      dc(GOLD);
      doc.setLineWidth(0.25);
      doc.line(railX, top - 2.5, railX, top + blockH - 3);
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
        ty += 4.8;
      }
      // Description
      if (descLines.length) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.6);
        tc(INK_SOFT);
        ty += 0.4;
        for (const line of descLines) {
          doc.text(line, textX, ty);
          ty += 3.7;
        }
      }
      // Grouped sub-lists (participants / roles)
      for (const gb of groupBlocks) {
        ty += 2.2;
        if (gb.label) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          tc(GOLD_DEEP);
          doc.text(gb.label.toUpperCase(), textX, ty, { charSpace: 0.6 });
          ty += 4.0;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.8);
        tc(INK_SOFT);
        for (const il of gb.itemLines) {
          for (const line of il) {
            doc.text(line, textX, ty);
            ty += 3.7;
          }
        }
      }
      y = top + blockH;
    }
    y += 5;
  };

  section("The Ceremony", program.ceremony);
  section("The Reception", program.reception);

  // ---- Closing ----
  ensure(28);
  y += 2;
  ornament(y);
  y += 8;
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  tc(INK);
  for (const line of doc.splitTextToSize(
    event.thankYou,
    contentW - 30
  ) as string[]) {
    doc.text(line, centerX, y, { align: "center" });
    y += 5.4;
  }
  y += 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  tc(GOLD_DEEP);
  doc.text(event.hashtag.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 1,
  });

  return doc;
}

async function makeDoc(opts: ProgramPdfOptions): Promise<Doc> {
  const { jsPDF } = await import("jspdf");
  return buildProgramDoc(jsPDF, opts);
}

/**
 * Build the order-of-service as a premium A4 PDF and trigger an immediate
 * download — no print dialog. When a guest name + table are supplied they are
 * printed on a personalized place card at the top, making the file their own
 * keepsake.
 */
export async function generateProgramPdf(opts: ProgramPdfOptions): Promise<void> {
  const doc = await makeDoc(opts);
  doc.save(fileName(opts.guestName, opts.tableLabel));
}

/**
 * Build the same PDF but open it in a new tab for viewing (no download). The
 * blob URL is revoked after a short delay once the viewer has loaded it.
 */
export async function viewProgramPdf(opts: ProgramPdfOptions): Promise<void> {
  const doc = await makeDoc(opts);
  const url = doc.output("bloburl") as string;
  const win = window.open(url, "_blank");
  // Popup blocked (e.g. not treated as a user gesture) — fall back to download.
  if (!win) {
    doc.save(fileName(opts.guestName, opts.tableLabel));
    return;
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
