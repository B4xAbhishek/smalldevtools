"use client";

import { Check, Copy, Layers, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useAtom } from "jotai";
import type { ToolMeta } from "@/lib/tools";
import { batchModeAtom, favoriteToolsAtom } from "@/state/atoms";
import { track } from "@/lib/analytics";

export function ToolChrome({ tool }: { tool: ToolMeta }) {
  const [favorites, setFavorites] = useAtom(favoriteToolsAtom);
  const [batch, setBatch] = useAtom(batchModeAtom);
  const [copied, setCopied] = useState(false);
  const isFav = favorites.includes(tool.slug);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

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

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {tool.batch && (
        <button
          type="button"
          className={`btn min-h-10 px-3 text-sm ${batch ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setBatch((v) => !v)}
          aria-pressed={batch}
        >
          <Layers size={16} aria-hidden />
          Batch {batch ? "on" : "off"}
        </button>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="btn btn-secondary h-10 w-10 min-h-10 shrink-0 p-0"
          onClick={toggleFav}
          aria-pressed={isFav}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            size={16}
            aria-hidden
            className={isFav ? "fill-cta text-cta" : ""}
          />
        </button>

        <button
          type="button"
          className="btn btn-secondary h-10 w-10 min-h-10 shrink-0 p-0"
          onClick={copyLink}
          aria-label={copied ? "Link copied" : "Copy link"}
        >
          {copied ? (
            <Check size={16} aria-hidden />
          ) : (
            <Copy size={16} aria-hidden />
          )}
        </button>
      </div>

      {tool.shareParams?.length ? (
        <p className="w-full text-xs text-text-muted">
          Prefill via URL:{" "}
          {tool.shareParams.map((p) => (
            <code key={p} className="mr-1 text-text">
              ?{p}=
            </code>
          ))}
          {shareUrl ? null : null}
        </p>
      ) : null}
    </div>
  );
}
