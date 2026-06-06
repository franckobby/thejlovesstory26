"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppData } from "@/lib/types";
import { AdminApp } from "@/components/admin/AdminApp";

type Status = "loading" | "login" | "ready";

export default function AdminPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<AppData | null>(null);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin", { cache: "no-store" });
    if (res.ok) {
      setData(await res.json());
      setStatus("ready");
    } else {
      setStatus("login");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setBusy(false);
    if (res.ok) {
      setPw("");
      setStatus("loading");
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Incorrect password.");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest text-champagne">
        <p className="animate-pulse font-serif text-2xl italic text-gold-light">
          Unlocking…
        </p>
      </div>
    );
  }

  if (status === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest px-6">
        <div className="w-full max-w-sm text-center">
          <p className="font-script text-5xl text-gold-light">J &amp; J</p>
          <p className="eyebrow mt-6" style={{ color: "var(--color-gold-light)" }}>
            Private Access
          </p>
          <h1 className="mt-3 font-serif text-3xl text-champagne">
            Seating Manager
          </h1>
          <form onSubmit={login} className="mt-8">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              autoFocus
              className="field text-center"
            />
            {error && (
              <p className="mt-3 text-sm text-gold-light/90">{error}</p>
            )}
            <button
              type="submit"
              disabled={busy || !pw}
              className="btn-gold mt-5 w-full"
            >
              {busy ? "Checking…" : "Enter"}
            </button>
          </form>
          <p className="mt-8 text-[0.65rem] uppercase tracking-[0.2em] text-champagne/40">
            For the couple &amp; planners only
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminApp
      initial={data!}
      onLogout={() => {
        setData(null);
        setStatus("login");
      }}
    />
  );
}
