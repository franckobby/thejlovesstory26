import type { EventDetails, ProgramData, ProgramItem } from "./types";

type RGB = [number, number, number];

const GOLD: RGB = [184, 145, 80];
const GOLD_DEEP: RGB = [154, 118, 55];
const INK: RGB = [32, 35, 26];
const INK_SOFT: RGB = [69, 72, 60];
const CREAM: RGB = [245, 240, 228];

/** Turn a guest name into a safe, pretty file name. */
function fileName(guestName?: string, tableLabel?: string): string {
  const base = guestName
    ? `Program - ${guestName}${tableLabel ? ` - ${tableLabel}` : ""}`
    : "Josephine & Jeffrey - Program";
  return `${base.replace(/[^\p{L}\p{N} &-]/gu, "").trim()}.pdf`;
}

/**
 * Build the order-of-service as a premium A4 PDF and trigger an immediate
 * download — no print dialog. When a guest name + table are supplied they are
 * printed on a personalized place card at the top, making the file their own
 * keepsake.
 */
export async function generateProgramPdf(opts: {
  event: EventDetails;
  program: ProgramData;
  guestName?: string;
  tableLabel?: string;
  groupLabel?: string;
}): Promise<void> {
  const { event, program, guestName, tableLabel, groupLabel } = opts;
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const contentW = pageW - marginX * 2;
  const centerX = pageW / 2;
  const bottomLimit = pageH - 18;
  let y = 24;

  const dateLong = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const setColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const ensure = (space: number) => {
    if (y + space > bottomLimit) {
      doc.addPage();
      y = 24;
    }
  };

  // Centered uppercase "eyebrow" label with letter spacing.
  const eyebrow = (text: string, color: RGB = GOLD_DEEP) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(color);
    doc.text(text.toUpperCase(), centerX, y, {
      align: "center",
      charSpace: 1.1,
    });
  };

  // A gold rule with a small centered diamond.
  const ornament = (cy: number) => {
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.3);
    doc.line(centerX - 24, cy, centerX - 4, cy);
    doc.line(centerX + 4, cy, centerX + 24, cy);
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(centerX - 1.1, cy - 1.1, 2.2, 2.2, "F"); // small diamond-ish accent
  };

  // ---- Masthead ----
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  setColor(GOLD_DEEP);
  doc.text(event.monogram, centerX, y, { align: "center" });
  y += 9;

  eyebrow("The Wedding Celebration of");
  y += 9;

  doc.setFont("times", "normal");
  doc.setFontSize(30);
  setColor(INK);
  doc.text(event.coupleNames, centerX, y, { align: "center" });
  y += 6;

  ornament(y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setColor(INK_SOFT);
  doc.text(dateLong.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 0.8,
  });
  y += 5;
  doc.text(`${event.ceremonyVenue} · ${event.city}`.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 0.8,
  });
  y += 12;

  // ---- Personalized place card ----
  if (guestName) {
    const cardH = 26;
    ensure(cardH + 6);
    doc.setFillColor(CREAM[0], CREAM[1], CREAM[2]);
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, y, contentW, cardH, 2, 2, "FD");

    const padX = 8;
    const midY = y + cardH / 2;

    // Left — name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setColor(GOLD_DEEP);
    doc.text("PREPARED FOR", marginX + padX, midY - 4, { charSpace: 1 });
    doc.setFont("times", "italic");
    doc.setFontSize(19);
    setColor(INK);
    doc.text(guestName, marginX + padX, midY + 5);

    // Right — seat
    const rightX = marginX + contentW - padX;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setColor(GOLD_DEEP);
    doc.text("YOUR SEAT", rightX, midY - 4, { align: "right", charSpace: 1 });
    doc.setFont("times", "normal");
    doc.setFontSize(17);
    setColor(INK);
    doc.text(tableLabel || "—", rightX, midY + 4, { align: "right" });
    if (groupLabel) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      setColor(INK_SOFT);
      doc.text(groupLabel.toUpperCase(), rightX, midY + 9, {
        align: "right",
        charSpace: 0.6,
      });
    }

    y += cardH + 14;
  }

  // ---- A timeline section ("The Ceremony" / "The Reception") ----
  const section = (title: string, items: ProgramItem[]) => {
    ensure(20);
    doc.setFont("times", "normal");
    doc.setFontSize(20);
    setColor(INK);
    doc.text(title, centerX, y, { align: "center" });
    y += 3;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.4);
    doc.line(centerX - 9, y, centerX + 9, y);
    y += 9;

    const timeColW = 24;
    const textX = marginX + timeColW + 4;
    const textW = contentW - timeColW - 4;

    for (const it of items) {
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      const titleLines = doc.splitTextToSize(it.title, textW) as string[];
      let descLines: string[] = [];
      if (it.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        descLines = doc.splitTextToSize(it.description, textW) as string[];
      }
      const blockH = titleLines.length * 5.2 + descLines.length * 4.4 + 6;
      ensure(blockH);

      // Time (right-aligned in its column)
      doc.setFont("times", "italic");
      doc.setFontSize(10.5);
      setColor(GOLD_DEEP);
      doc.text(it.time, marginX + timeColW, y + 0.5, { align: "right" });

      // Accent dot + connector
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.circle(marginX + timeColW + 4, y - 0.8, 0.9, "F");

      // Title
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      setColor(INK);
      let ty = y;
      for (const line of titleLines) {
        doc.text(line, textX, ty);
        ty += 5.2;
      }

      // Description
      if (descLines.length) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setColor(INK_SOFT);
        for (const line of descLines) {
          doc.text(line, textX, ty);
          ty += 4.4;
        }
      }

      y = ty + 4;
    }
    y += 6;
  };

  section("The Ceremony", program.ceremony);
  section("The Reception", program.reception);

  // ---- Closing ----
  ensure(28);
  ornament(y);
  y += 9;
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  setColor(INK);
  const thanks = doc.splitTextToSize(event.thankYou, contentW - 20) as string[];
  for (const line of thanks) {
    doc.text(line, centerX, y, { align: "center" });
    y += 6;
  }
  y += 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(GOLD_DEEP);
  doc.text(event.hashtag.toUpperCase(), centerX, y, {
    align: "center",
    charSpace: 0.8,
  });

  doc.save(fileName(guestName, tableLabel));
}
