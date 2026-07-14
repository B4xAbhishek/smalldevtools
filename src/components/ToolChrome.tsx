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
      <button
        type="button"
        className="btn btn-secondary min-h-10 flex-1 px-3 text-sm sm:flex-none"
        onClick={toggleFav}
        aria-pressed={isFav}
      >
        <Star
          size={16}
          aria-hidden
          className={isFav ? "fill-cta text-cta" : ""}
        />
        <span className="sm:hidden">{isFav ? "Saved" : "Save"}</span>
        <span className="hidden sm:inline">{isFav ? "Favorited" : "Favorite"}</span>
      </button>

      <button
        type="button"
        className="btn btn-secondary min-h-10 flex-1 px-3 text-sm sm:flex-none"
        onClick={copyLink}
      >
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        {copied ? "Copied" : "Copy link"}
      </button>

      {tool.batch && (
        <button
          type="button"
          className={`btn min-h-10 w-full px-3 text-sm sm:w-auto ${batch ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setBatch((v) => !v)}
          aria-pressed={batch}
        >
          <Layers size={16} aria-hidden />
          Batch {batch ? "on" : "off"}
        </button>
      )}

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
