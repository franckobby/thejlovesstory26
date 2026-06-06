import { NextRequest, NextResponse } from "next/server";
import { getAllData, saveAllData } from "@/lib/store";
import { checkPasscode } from "@/lib/auth";
import type { AppData } from "@/lib/types";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  return checkPasscode(req.headers.get("x-admin-passcode"));
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAllData());
}

export async function PUT(req: NextRequest) {
  if (!authorized(req)) {
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
          "Could not save data. Check the database connection (DATABASE_URL) in your environment.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
