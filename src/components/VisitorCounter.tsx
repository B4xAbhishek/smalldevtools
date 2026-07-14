"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tk-visit-counted";

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // One API call per browser tab session; server also uses a session cookie
        if (typeof sessionStorage !== "undefined") {
          const cached = sessionStorage.getItem(STORAGE_KEY);
          if (cached) {
            const n = Number(cached);
            if (!cancelled && Number.isFinite(n)) {
              setCount(n);
              return;
            }
          }
        }

        const res = await fetch("/api/visitors", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (cancelled || typeof data.count !== "number") return;
        setCount(data.count);
        try {
          sessionStorage.setItem(STORAGE_KEY, String(data.count));
        } catch {
          /* ignore */
        }
      } catch {
        /* ignore offline / API errors */
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) {
    return (
      <span className="tabular-nums text-text-muted" aria-live="polite">
        Visits …
      </span>
    );
  }

  return (
    <span className="tabular-nums text-text-muted" aria-live="polite">
      {count.toLocaleString()} visit{count === 1 ? "" : "s"}
    </span>
  );
}
