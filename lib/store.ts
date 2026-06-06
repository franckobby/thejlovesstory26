import { promises as fs } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import seatingSeed from "@/data/seating.json";
import eventSeed from "@/data/event.json";
import programSeed from "@/data/program.json";
import type { AppData, EventDetails, ProgramData, Table } from "./types";

/**
 * Data store with two backends, chosen automatically:
 *
 *  • Production (Vercel): if a Postgres connection string is present (Neon), all
 *    data lives as a single JSONB row. On first read it's seeded from the bundled
 *    data/*.json so the deployed site starts with the current seating. This is
 *    what makes admin "Save" persist on a read-only serverless host.
 *
 *  • Local dev: with no DATABASE_URL, it reads/writes the data/*.json files, so
 *    editing in /admin persists to disk while you work locally.
 *
 * Create a Neon Postgres database in the Vercel dashboard → Storage tab and
 * connect it to the project; it injects DATABASE_URL automatically.
 */

const ROW_ID = "main";

const DATA_DIR = path.join(process.cwd(), "data");
const SEATING_FILE = path.join(DATA_DIR, "seating.json");
const EVENT_FILE = path.join(DATA_DIR, "event.json");
const PROGRAM_FILE = path.join(DATA_DIR, "program.json");

/** Bundled defaults — always available, even on serverless. */
function seedData(): AppData {
  return {
    tables: (seatingSeed as unknown as { tables: Table[] }).tables,
    event: eventSeed as unknown as EventDetails,
    program: programSeed as unknown as ProgramData,
  };
}

function databaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED
  );
}

/** A Neon SQL client if a connection string is configured, else null. */
function getSql() {
  const url = databaseUrl();
  if (!url) return null;
  return neon(url);
}

async function readJSON<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf-8")) as T;
}

async function writeJSON(file: string, data: unknown): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function getAllData(): Promise<AppData> {
  const sql = getSql();
  if (sql) {
    await sql`CREATE TABLE IF NOT EXISTS app_state (id text PRIMARY KEY, data jsonb NOT NULL)`;
    const rows = await sql`SELECT data FROM app_state WHERE id = ${ROW_ID}`;
    const stored = (rows[0]?.data ?? null) as AppData | null;
    if (stored && Array.isArray(stored.tables)) return stored;

    const seeded = seedData();
    await sql`INSERT INTO app_state (id, data) VALUES (${ROW_ID}, ${JSON.stringify(
      seeded
    )}::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
    return seeded;
  }

  // Local file mode
  try {
    const [seating, event, program] = await Promise.all([
      readJSON<{ tables: Table[] }>(SEATING_FILE),
      readJSON<EventDetails>(EVENT_FILE),
      readJSON<ProgramData>(PROGRAM_FILE),
    ]);
    return { tables: seating.tables, event, program };
  } catch {
    return seedData();
  }
}

export async function saveAllData(data: AppData): Promise<void> {
  const sql = getSql();
  if (sql) {
    await sql`CREATE TABLE IF NOT EXISTS app_state (id text PRIMARY KEY, data jsonb NOT NULL)`;
    await sql`INSERT INTO app_state (id, data) VALUES (${ROW_ID}, ${JSON.stringify(
      data
    )}::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
    return;
  }
  await Promise.all([
    writeJSON(SEATING_FILE, { tables: data.tables }),
    writeJSON(EVENT_FILE, data.event),
    writeJSON(PROGRAM_FILE, data.program),
  ]);
}

export async function getTables(): Promise<Table[]> {
  return (await getAllData()).tables;
}

export async function getEvent(): Promise<EventDetails> {
  return (await getAllData()).event;
}

export async function getProgram(): Promise<ProgramData> {
  return (await getAllData()).program;
}
