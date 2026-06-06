import type { SeatMatch, Table } from "./types";

/** Lowercase, strip accents & punctuation, collapse whitespace. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Classic Levenshtein edit distance. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Similarity between two single tokens, 0..1, tolerant of typos & prefixes. */
function tokenSim(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) {
    return 0.9;
  }
  const d = levenshtein(a, b);
  const m = Math.max(a.length, b.length);
  return m ? 1 - d / m : 0;
}

/** Score how well a query matches a full guest name (0..1). */
export function scoreName(query: string, name: string): number {
  const nq = normalize(query);
  const nn = normalize(name);
  if (!nq) return 0;
  if (nq === nn) return 1;
  if (nn.includes(nq) && nq.length >= 3) return 0.93;

  const qTokens = nq.split(" ").filter(Boolean);
  const nTokens = nn.split(" ").filter(Boolean);
  if (!qTokens.length || !nTokens.length) return 0;

  // Average of each query token's best match against the name's tokens.
  let total = 0;
  for (const q of qTokens) {
    let best = 0;
    for (const n of nTokens) best = Math.max(best, tokenSim(q, n));
    total += best;
  }
  const score = total / qTokens.length;
  return Math.min(score, 0.92);
}

/** Search all guests; return best matches above threshold. */
export function searchGuests(
  query: string,
  tables: Table[],
  limit = 8,
  threshold = 0.55
): SeatMatch[] {
  const results: SeatMatch[] = [];
  for (const table of tables) {
    for (const guest of table.guests) {
      const score = scoreName(query, guest);
      if (score >= threshold) {
        results.push({
          name: guest,
          score,
          tableId: table.id,
          tableLabel: table.label,
          category: table.category,
          tablemates: table.guests.filter((g) => g !== guest),
        });
      }
    }
  }
  results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return results.slice(0, limit);
}
