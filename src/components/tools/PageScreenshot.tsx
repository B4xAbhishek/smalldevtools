"use client";

import { Camera, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function PageScreenshot() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [url, setUrl] = useState(searchParams.get("url") ?? "");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = searchParams.get("url");
    if (u != null) setUrl(u);
  }, [searchParams]);

  const syncShare = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (url.trim()) params.set("url", url.trim());
    else params.delete("url");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const capture = async () => {
    setError(null);
    setPreview(null);

    let normalized = url.trim();
    if (!normalized) {
      setError("Please enter a website address, like google.com");
      return;
    }
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    try {
      new URL(normalized);
    } catch {
      setError("That doesn’t look like a valid website address.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        imageUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.imageUrl) {
        throw new Error(
          data.error ||
            "Couldn’t capture that page. Try a public site without login.",
        );
      }
      setPreview(data.imageUrl);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Screenshot failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="page-url" className="mb-2 block text-sm font-bold text-text">
          Website address
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="page-url"
            className="field flex-1"
            placeholder="example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={syncShare}
            onKeyDown={(e) => {
              if (e.key === "Enter") capture();
            }}
            inputMode="url"
            autoComplete="url"
          />
          <button
            type="button"
            className="btn btn-primary shrink-0"
            onClick={capture}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" size={20} aria-hidden />
                Capturing…
              </>
            ) : (
              <>
                <Camera size={20} aria-hidden />
                Capture page
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-text-muted">
          Works best on public pages. Sites that need a login may not work.
        </p>
      </div>

      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}

      {preview && (
        <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-text">Your screenshot</p>
            <a
              href={preview}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary min-h-11 px-4 text-sm"
            >
              <ExternalLink size={16} aria-hidden />
              Open / download
            </a>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Screenshot of the website you entered"
            className="max-h-[70vh] w-full rounded-xl object-contain object-top"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
