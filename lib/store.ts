import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import seatingSeed from "@/data/seating.json";
import eventSeed from "@/data/event.json";
import programSeed from "@/data/program.json";
import type { AppData, EventDetails, ProgramData, Table } from "./types";

/**
 * Data store with two backends, chosen automatically:
 *
 *  • Production (Vercel): if KV / Upstash Redis env vars are present, all data
 *    lives in a single JSON blob in Redis. On first read it's seeded from the
 *    bundled data/*.json so the deployed site starts with the current seating.
 *    This is what makes admin "Save" persist on a read-only serverless host.
 *
 *  • Local dev: with no KV env vars, it reads/writes the data/*.json files, so
 *    editing in /admin persists to disk while you work locally.
 *
 * Create a Redis (KV) store in the Vercel dashboard → Storage tab and connect it
 * to the project; it injects the env vars below automatically.
 */

const KEY = "thejlovesstory:appdata:v1";

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

/** A Redis client if KV/Upstash env vars are configured, else null. */
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function readJSON<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf-8")) as T;
}

async function writeJSON(file: string, data: unknown): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function getAllData(): Promise<AppData> {
  const redis = getRedis();
  if (redis) {
    const stored = await redis.get<AppData>(KEY);
    if (stored && Array.isArray(stored.tables)) return stored;
    const seeded = seedData();
    await redis.set(KEY, seeded);
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
  const redis = getRedis();
  if (redis) {
    await redis.set(KEY, data);
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
