import { NextRequest, NextResponse } from "next/server";
import { getAllData, saveAllData } from "@/lib/store";
import { isAuthed } from "@/lib/auth";
import type { AppData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAllData());
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as AppData | null;
  if (!body || !Array.isArray(body.tables) || !body.event || !body.program) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  try {
    await saveAllData(body);
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not write data. On serverless hosting the filesystem is read-only — switch lib/store.ts to a database (e.g. Vercel KV).",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
