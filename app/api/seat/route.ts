import { NextRequest, NextResponse } from "next/server";
import { getTables } from "@/lib/store";
import { searchGuests } from "@/lib/match";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ matches: [] });

  const tables = await getTables();
  const matches = searchGuests(q, tables);
  return NextResponse.json({ matches });
}
