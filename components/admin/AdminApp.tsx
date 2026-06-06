"use client";

import { useMemo, useState } from "react";
import type { AppData, ProgramItem } from "@/lib/types";
import { QRPanel } from "./QRPanel";

type Tab = "seating" | "details" | "programme" | "share";

export function AdminApp({
  initial,
  onLogout,
}: {
  initial: AppData;
  onLogout: () => void;
}) {
  const [data, setData] = useState<AppData>(initial);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<Tab>("seating");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [query, setQuery] = useState("");
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const totalGuests = useMemo(
    () => data.tables.reduce((n, t) => n + t.guests.length, 0),
    [data.tables]
  );

  function mutate(fn: (d: AppData) => void) {
    setData((prev) => {
      const next = structuredClone(prev) as AppData;
      fn(next);
      return next;
    });
    setDirty(true);
    setSaveMsg("");
  }

  // ---- seating ops ----
  const moveGuest = (name: string, fromId: number, toId: number) =>
    mutate((d) => {
      if (fromId === toId) return;
      const from = d.tables.find((t) => t.id === fromId);
      const to = d.tables.find((t) => t.id === toId);
      if (!from || !to) return;
      from.guests = from.guests.filter((g) => g !== name);
      if (!to.guests.includes(name)) to.guests.push(name);
    });

  const renameGuest = (tableId: number, idx: number, value: string) =>
    mutate((d) => {
      const t = d.tables.find((x) => x.id === tableId);
      if (t) t.guests[idx] = value;
    });

  const removeGuest = (tableId: number, idx: number) =>
    mutate((d) => {
      const t = d.tables.find((x) => x.id === tableId);
      if (t) t.guests.splice(idx, 1);
    });

  const addGuest = (tableId: number, name: string) =>
    mutate((d) => {
      const t = d.tables.find((x) => x.id === tableId);
      if (t) t.guests.push(name);
    });

  const setTableField = (
    tableId: number,
    field: "label" | "category",
    value: string
  ) =>
    mutate((d) => {
      const t = d.tables.find((x) => x.id === tableId);
      if (t) t[field] = value;
    });

  const addTable = () =>
    mutate((d) => {
      const nextId = d.tables.reduce((m, t) => Math.max(m, t.id), 0) + 1;
      d.tables.push({
        id: nextId,
        label: `Table ${nextId}`,
        category: null,
        guests: [],
      });
    });

  const removeTable = (tableId: number) => {
    const t = data.tables.find((x) => x.id === tableId);
    if (t && t.guests.length) {
      alert("Please move or remove this table's guests first.");
      return;
    }
    if (!confirm("Remove this table?")) return;
    mutate((d) => {
      d.tables = d.tables.filter((x) => x.id !== tableId);
    });
  };

  // ---- save / logout ----
  async function save() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setDirty(false);
        setSaveMsg("All changes saved");
      } else if (res.status === 401) {
        setSaveMsg("Session expired — reload and sign in again.");
      } else {
        const d = await res.json().catch(() => ({}));
        setSaveMsg(d.error || "Save failed.");
      }
    } catch {
      setSaveMsg("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    onLogout();
  }

  const q = query.trim().toLowerCase();

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-forest text-champagne shadow-[0_8px_30px_-18px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-xl text-gold-light">
              {data.event.monogram}
            </span>
            <span className="text-[0.7rem] uppercase tracking-[0.24em] text-champagne/80">
              Seating Manager
            </span>
            <span className="hidden text-[0.7rem] text-champagne/45 sm:inline">
              · {totalGuests} guests · {data.tables.length} tables
            </span>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && (
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-gold-light">
                {saveMsg}
              </span>
            )}
            {dirty && !saveMsg && (
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-champagne/55">
                Unsaved changes
              </span>
            )}
            <a
              href="/"
              target="_blank"
              className="text-[0.68rem] uppercase tracking-[0.18em] text-champagne/70 transition-colors hover:text-gold-light"
            >
              View site ↗
            </a>
            <button
              onClick={logout}
              className="text-[0.68rem] uppercase tracking-[0.18em] text-champagne/70 transition-colors hover:text-gold-light"
            >
              Log out
            </button>
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="rounded-sm bg-gradient-to-br from-gold-light to-gold-deep px-5 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-forest transition-all hover:brightness-105 disabled:opacity-45"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mx-auto flex max-w-7xl gap-1 px-4">
          {(
            [
              ["seating", "Seating"],
              ["details", "Event Details"],
              ["programme", "Programme"],
              ["share", "QR & Share"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`border-b-2 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] transition-colors ${
                tab === key
                  ? "border-gold-light text-gold-light"
                  : "border-transparent text-champagne/55 hover:text-champagne"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {tab === "seating" && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guests…"
                className="field max-w-xs text-sm"
              />
              <div className="flex items-center gap-3">
                <p className="hidden text-xs text-ink-soft sm:block">
                  Drag a guest by the handle to move them — or use the menu on
                  each name.
                </p>
                <button onClick={addTable} className="btn-outline !px-5 !py-2.5">
                  + Add Table
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.tables.map((table) => {
                const rows = table.guests
                  .map((name, idx) => ({ name, idx }))
                  .filter((r) => !q || r.name.toLowerCase().includes(q));
                if (q && rows.length === 0) return null;
                return (
                  <div
                    key={table.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDragEnter={() => setDragOverId(table.id)}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node))
                        setDragOverId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverId(null);
                      try {
                        const { fromId, name } = JSON.parse(
                          e.dataTransfer.getData("text/plain")
                        );
                        moveGuest(name, fromId, table.id);
                      } catch {
                        /* ignore */
                      }
                    }}
                    className={`card-lux flex flex-col p-5 transition-shadow ${
                      dragOverId === table.id
                        ? "ring-2 ring-gold ring-offset-2 ring-offset-ivory"
                        : ""
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <input
                          value={table.label}
                          onChange={(e) =>
                            setTableField(table.id, "label", e.target.value)
                          }
                          className="w-full bg-transparent font-serif text-xl text-ink outline-none focus:border-b focus:border-gold"
                        />
                        <input
                          value={table.category ?? ""}
                          placeholder="Group (optional)"
                          onChange={(e) =>
                            setTableField(table.id, "category", e.target.value)
                          }
                          className="mt-0.5 w-full bg-transparent text-[0.7rem] uppercase tracking-[0.18em] text-gold-deep outline-none placeholder:text-ink-soft/40 focus:border-b focus:border-gold/40"
                        />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-full bg-olive/10 px-2.5 py-0.5 text-[0.65rem] text-ink-soft">
                          {table.guests.length}
                        </span>
                        <button
                          onClick={() => removeTable(table.id)}
                          className="text-xs text-ink-soft/50 transition-colors hover:text-wine"
                          title="Remove table"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-1">
                      {rows.map(({ name, idx }) => (
                        <li
                          key={idx}
                          className="group flex items-center gap-1.5 rounded-sm px-1 py-0.5 hover:bg-gold/5"
                        >
                          <span
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                "text/plain",
                                JSON.stringify({ fromId: table.id, name })
                              );
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            className="cursor-grab select-none px-1 text-ink-soft/35 transition-colors group-hover:text-gold-deep active:cursor-grabbing"
                            title="Drag to move"
                          >
                            ⠿
                          </span>
                          <input
                            value={name}
                            onChange={(e) =>
                              renameGuest(table.id, idx, e.target.value)
                            }
                            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none focus:border-b focus:border-gold/50"
                          />
                          <select
                            value=""
                            onChange={(e) => {
                              const to = Number(e.target.value);
                              if (to) moveGuest(name, table.id, to);
                            }}
                            className="rounded-sm border border-transparent bg-transparent text-[0.65rem] text-ink-soft/60 opacity-0 transition-opacity hover:border-gold/30 focus:opacity-100 group-hover:opacity-100"
                            title="Move to table"
                          >
                            <option value="">↦</option>
                            {data.tables
                              .filter((t) => t.id !== table.id)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.label}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => removeGuest(table.id, idx)}
                            className="px-1 text-xs text-ink-soft/30 opacity-0 transition-all hover:text-wine group-hover:opacity-100"
                            title="Remove guest"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>

                    <AddGuestRow onAdd={(name) => addGuest(table.id, name)} />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "details" && (
          <EventEditor
            data={data}
            onChange={(field, value) =>
              mutate((d) => {
                (d.event as unknown as Record<string, string>)[field] = value;
              })
            }
          />
        )}

        {tab === "programme" && (
          <ProgrammeEditor data={data} mutate={mutate} />
        )}

        {tab === "share" && (
          <div className="py-6">
            <QRPanel />
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- Add guest row ---------------- */
function AddGuestRow({ onAdd }: { onAdd: (name: string) => void }) {
  const [value, setValue] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onAdd(v);
    setValue("");
  }
  return (
    <form onSubmit={submit} className="mt-3 flex gap-2 border-t border-gold/15 pt-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a guest…"
        className="field flex-1 !py-1.5 text-sm"
      />
      <button
        type="submit"
        className="rounded-sm border border-gold/40 px-3 text-sm text-gold-deep transition-colors hover:bg-gold/10"
      >
        +
      </button>
    </form>
  );
}

/* ---------------- Event editor ---------------- */
const EVENT_FIELDS: [string, string][] = [
  ["coupleNames", "Couple Names"],
  ["bride", "Bride First Name"],
  ["groom", "Groom First Name"],
  ["monogram", "Monogram"],
  ["hashtag", "Hashtag"],
  ["date", "Date & Time (ISO, e.g. 2026-08-22T15:00:00)"],
  ["timeDisplay", "Time (display)"],
  ["ceremonyVenue", "Ceremony Venue"],
  ["ceremonyAddress", "Ceremony Address"],
  ["receptionVenue", "Reception Venue"],
  ["receptionAddress", "Reception Address"],
  ["city", "City"],
  ["dressCode", "Dress Code"],
];

function EventEditor({
  data,
  onChange,
}: {
  data: AppData;
  onChange: (field: string, value: string) => void;
}) {
  const ev = data.event as unknown as Record<string, string>;
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 font-serif text-2xl text-ink">Event Details</h2>
      <p className="mb-6 text-sm text-ink-soft">
        These appear across the guest site and the order of service.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {EVENT_FIELDS.map(([field, label]) => (
          <label key={field} className="block">
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-gold-deep">
              {label}
            </span>
            <input
              value={ev[field] ?? ""}
              onChange={(e) => onChange(field, e.target.value)}
              className="field mt-1.5 text-sm"
            />
          </label>
        ))}
      </div>
      <div className="mt-5 grid gap-5">
        {(
          [
            ["welcome", "Welcome Message"],
            ["thankYou", "Thank-You Message"],
          ] as [string, string][]
        ).map(([field, label]) => (
          <label key={field} className="block">
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-gold-deep">
              {label}
            </span>
            <textarea
              value={ev[field] ?? ""}
              onChange={(e) => onChange(field, e.target.value)}
              rows={2}
              className="field mt-1.5 text-sm"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Programme editor ---------------- */
function ProgrammeEditor({
  data,
  mutate,
}: {
  data: AppData;
  mutate: (fn: (d: AppData) => void) => void;
}) {
  const parts: ["ceremony" | "reception", string][] = [
    ["ceremony", "The Ceremony"],
    ["reception", "The Reception"],
  ];

  const setItem = (
    part: "ceremony" | "reception",
    idx: number,
    field: keyof ProgramItem,
    value: string
  ) =>
    mutate((d) => {
      d.program[part][idx][field] = value;
    });

  const addItem = (part: "ceremony" | "reception") =>
    mutate((d) => {
      d.program[part].push({ time: "", title: "", description: "" });
    });

  const removeItem = (part: "ceremony" | "reception", idx: number) =>
    mutate((d) => {
      d.program[part].splice(idx, 1);
    });

  const move = (part: "ceremony" | "reception", idx: number, dir: -1 | 1) =>
    mutate((d) => {
      const arr = d.program[part];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
    });

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 font-serif text-2xl text-ink">Order of Service</h2>
      <p className="mb-6 text-sm text-ink-soft">
        Edit the timeline guests see and print.
      </p>
      {parts.map(([part, label]) => (
        <section key={part} className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl text-ink">{label}</h3>
            <button
              onClick={() => addItem(part)}
              className="rounded-sm border border-gold/40 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gold-deep transition-colors hover:bg-gold/10"
            >
              + Add
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {data.program[part].map((it, idx) => (
              <div
                key={idx}
                className="card-lux grid grid-cols-[5.5rem_1fr_auto] items-start gap-3 p-3"
              >
                <input
                  value={it.time}
                  onChange={(e) => setItem(part, idx, "time", e.target.value)}
                  placeholder="3:00 PM"
                  className="field !py-1.5 text-xs"
                />
                <div className="flex flex-col gap-2">
                  <input
                    value={it.title}
                    onChange={(e) => setItem(part, idx, "title", e.target.value)}
                    placeholder="Title"
                    className="field !py-1.5 text-sm"
                  />
                  <input
                    value={it.description ?? ""}
                    onChange={(e) =>
                      setItem(part, idx, "description", e.target.value)
                    }
                    placeholder="Description (optional)"
                    className="field !py-1.5 text-xs"
                  />
                </div>
                <div className="flex flex-col items-center gap-1 text-ink-soft">
                  <button
                    onClick={() => move(part, idx, -1)}
                    className="px-1 transition-colors hover:text-gold-deep"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(part, idx, 1)}
                    className="px-1 transition-colors hover:text-gold-deep"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeItem(part, idx)}
                    className="px-1 transition-colors hover:text-wine"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
