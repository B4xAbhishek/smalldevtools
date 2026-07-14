"use client";

import { Check, Copy, Globe, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { track } from "@/lib/analytics";

type IpResponse = {
  ip: string;
  local?: boolean;
};

export function WhatsMyIp() {
  const [ip, setIp] = useState<string | null>(null);
  const [local, setLocal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchIp = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/ip", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch IP");
      const data = (await res.json()) as IpResponse;
      if (!data.ip || data.ip === "unknown") {
        throw new Error("Could not determine your IP address.");
      }
      setIp(data.ip);
      setLocal(Boolean(data.local));
      track("ip_looked_up", { local: Boolean(data.local) });
    } catch {
      setIp(null);
      setLocal(false);
      setError("Couldn’t look up your IP. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchIp();
  }, [fetchIp]);

  const copyIp = async () => {
    if (!ip) return;
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      track("ip_copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Couldn’t copy to clipboard.");
    }
  };

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border border-border bg-muted px-4 py-6 text-center sm:px-6 sm:py-8"
        aria-live="polite"
        aria-busy={loading}
      >
        <div className="mb-3 flex justify-center text-primary" aria-hidden>
          <Globe size={28} strokeWidth={2} />
        </div>

        <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
          Public IP address
        </p>

        {loading ? (
          <p className="mt-3 text-2xl font-medium text-text-muted sm:text-3xl">
            Looking up…
          </p>
        ) : ip ? (
          <>
            <p
              id="public-ip-value"
              className="mt-3 break-all font-mono text-2xl font-medium tracking-tight text-text sm:text-3xl"
            >
              {ip}
            </p>
            {local && (
              <p className="mt-2 text-sm text-text-muted">
                This looks like a local/private address (common on localhost).
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-lg font-medium text-text">Unavailable</p>
        )}
      </div>

      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={copyIp}
          disabled={!ip || loading}
          aria-label={copied ? "IP address copied" : "Copy IP address"}
          aria-describedby={ip ? "public-ip-value" : undefined}
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied ? "Copied" : "Copy IP"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={fetchIp}
          disabled={loading}
          aria-label="Refresh IP address"
        >
          <RefreshCw size={16} aria-hidden className={loading ? "animate-spin" : undefined} />
          Refresh
        </button>
      </div>
    </div>
  );
}
