"use client";

import { Check, Copy, Layers, Star } from "lucide-react";
import { useState } from "react";
import { useAtom } from "jotai";
import type { ToolMeta } from "@/lib/tools";
import { batchModeAtom, favoriteToolsAtom } from "@/state/atoms";
import { track } from "@/lib/analytics";

export function ToolChrome({
  tool,
  batchOnly = false,
}: {
  tool: ToolMeta;
  /** When true, only render the batch toggle (used below the description). */
  batchOnly?: boolean;
}) {
  const [favorites, setFavorites] = useAtom(favoriteToolsAtom);
  const [batch, setBatch] = useAtom(batchModeAtom);
  const [copied, setCopied] = useState(false);
  const isFav = favorites.includes(tool.slug);

  const toggleFav = () => {
    setFavorites((prev) =>
      prev.includes(tool.slug)
        ? prev.filter((s) => s !== tool.slug)
        : [...prev, tool.slug],
    );
    track("favorite_toggled", { slug: tool.slug, on: !isFav });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      track("share_link_copied", { slug: tool.slug });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  if (batchOnly) {
    if (!tool.batch && !tool.shareParams?.length) return null;
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tool.batch ? (
          <button
            type="button"
            className={`btn min-h-10 px-3 text-sm ${batch ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setBatch((v) => !v)}
            aria-pressed={batch}
          >
            <Layers size={16} aria-hidden />
            Batch {batch ? "on" : "off"}
          </button>
        ) : null}
        {tool.shareParams?.length ? (
          <p className="w-full text-xs text-text-muted">
            Prefill via URL:{" "}
            {tool.shareParams.map((p) => (
              <code key={p} className="mr-1 text-text">
                ?{p}=
              </code>
            ))}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        className="inline-flex h-9 w-9 min-h-9 cursor-pointer items-center justify-center rounded-full border border-border bg-muted text-text transition duration-200 hover:border-border-strong hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-10 sm:w-10 sm:min-h-10"
        onClick={toggleFav}
        aria-pressed={isFav}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          size={17}
          aria-hidden
          strokeWidth={2}
          className={isFav ? "fill-cta text-cta" : "text-text"}
        />
      </button>

      <button
        type="button"
        className="inline-flex h-9 w-9 min-h-9 cursor-pointer items-center justify-center rounded-full border border-border bg-muted text-text transition duration-200 hover:border-border-strong hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-10 sm:w-10 sm:min-h-10"
        onClick={copyLink}
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        {copied ? (
          <Check size={17} aria-hidden strokeWidth={2} className="text-success" />
        ) : (
          <Copy size={17} aria-hidden strokeWidth={2} className="text-text" />
        )}
      </button>
    </div>
  );
}
