"use client";

import { useEffect, useState } from "react";
import type { AppData } from "@/lib/types";
import { AdminApp } from "@/components/admin/AdminApp";

export default function AdminPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() =>
        setError("Couldn't load the seating data. Is the database connected?")
      );
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest px-6 text-center">
        <p className="font-serif text-xl italic text-gold-light">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest text-champagne">
        <p className="animate-pulse font-serif text-2xl italic text-gold-light">
          Loading…
        </p>
      </div>
    );
  }

  return <AdminApp initial={data} />;
}
