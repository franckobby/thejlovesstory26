import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  AppData,
  EventDetails,
  ProgramData,
  SeatingData,
  Table,
} from "./types";

/**
 * File-backed data store. Reads/writes JSON in /data.
 *
 * This works perfectly for local hosting. On a read-only serverless host
 * (e.g. Vercel) reads work but writes will fail — when you deploy, swap the
 * read/write helpers below for a Vercel KV / Postgres implementation. The rest
 * of the app only talks to the exported functions, so that's the only change.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const SEATING_FILE = path.join(DATA_DIR, "seating.json");
const EVENT_FILE = path.join(DATA_DIR, "event.json");
const PROGRAM_FILE = path.join(DATA_DIR, "program.json");

async function readJSON<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJSON(file: string, data: unknown): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function getTables(): Promise<Table[]> {
  const data = await readJSON<SeatingData>(SEATING_FILE);
  return data.tables;
}

export async function getEvent(): Promise<EventDetails> {
  return readJSON<EventDetails>(EVENT_FILE);
}

export async function getProgram(): Promise<ProgramData> {
  return readJSON<ProgramData>(PROGRAM_FILE);
}

export async function getAllData(): Promise<AppData> {
  const [tables, event, program] = await Promise.all([
    getTables(),
    getEvent(),
    getProgram(),
  ]);
  return { tables, event, program };
}

export async function saveAllData(data: AppData): Promise<void> {
  await Promise.all([
    writeJSON(SEATING_FILE, { tables: data.tables }),
    writeJSON(EVENT_FILE, data.event),
    writeJSON(PROGRAM_FILE, data.program),
  ]);
}
