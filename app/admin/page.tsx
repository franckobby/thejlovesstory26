"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppData } from "@/lib/types";
import { AdminApp } from "@/components/admin/AdminApp";

const STORAGE_KEY = "jj_admin_passcode";
type Status = "checking" | "locked" | "ready";

export default function AdminPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [data, setData] = useState<AppData | null>(null);
  const [passcode, setPasscode] = useState("");
  const [entry, setEntry] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(true);

  /** Try to load the data with a given passcode. Returns true on success. */
  const tryLoad = useCallback(async (code: string): Promise<boolean> => {
    const res = await fetch("/api/admin", {
      cache: "no-store",
      headers: { "x-admin-passcode": code },
    });
    if (!res.ok) return false;
    setData(await res.json());
    setPasscode(code);
    setStatus("ready");
    return true;
  }, []);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!saved) {
      setStatus("locked");
      return;
    }
    tryLoad(saved).then((ok) => {
      if (!ok) {
        localStorage.removeItem(STORAGE_KEY);
        setStatus("locked");
      }
    });
  }, [tryLoad]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = entry.trim();
    if (!code) return;
    setBusy(true);
    setError("");
    const ok = await tryLoad(code);
    setBusy(false);
    if (ok) {
      localStorage.setItem(STORAGE_KEY, code);
      setEntry("");
    } else {
      setError("Incorrect passcode.");
    }
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest text-champagne">
        <p className="animate-pulse font-serif text-2xl italic text-gold-light">
          Unlocking…
        </p>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest px-6">
        <div className="w-full max-w-sm text-center">
          <p className="font-script text-5xl text-gold-light">J &amp; J</p>
          <p className="eyebrow mt-6" style={{ color: "var(--color-gold-light)" }}>
            Private
          </p>
          <h1 className="mt-3 font-serif text-3xl text-champagne">
            Seating Manager
          </h1>
          <form onSubmit={submit} className="mt-8">
            <input
              type={show ? "text" : "password"}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Passcode"
              autoFocus
              autoComplete="off"
              className="field text-center text-2xl tracking-[0.12em]"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-champagne/60 transition-colors hover:text-gold-light"
            >
              {show ? "Hide passcode" : "Show passcode"}
            </button>
            {error && <p className="mt-3 text-sm text-gold-light/90">{error}</p>}
            <button
              type="submit"
              disabled={busy || !entry.trim()}
              className="btn-gold mt-5 w-full"
            >
              {busy ? "Checking…" : "Enter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminApp
      initial={data!}
      passcode={passcode}
      onLock={() => {
        localStorage.removeItem(STORAGE_KEY);
        setData(null);
        setStatus("locked");
      }}
    />
  );
}
