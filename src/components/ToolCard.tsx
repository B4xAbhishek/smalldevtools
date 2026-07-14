"use client";

import Link from "next/link";
import { Player } from "@remotion/player";
import { ArrowUpRight } from "lucide-react";
import type { ToolMeta } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { CardRevealComposition } from "@/remotion/CardRevealComposition";

export function ToolCard({ tool }: { tool: ToolMeta; index: number }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="soft-card group flex flex-col p-3 transition duration-200 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="relative h-8 w-8 shrink-0">
          <div className="pointer-events-none absolute inset-0">
            <Player
              component={CardRevealComposition}
              inputProps={{ accent: tool.accent }}
              durationInFrames={30}
              compositionWidth={32}
              compositionHeight={32}
              fps={30}
              style={{ width: 32, height: 32 }}
              controls={false}
              autoPlay
              loop={false}
              acknowledgeRemotionLicense
            />
          </div>
          <div
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: tool.accent }}
          >
            <ToolIcon name={tool.icon} size={16} />
          </div>
        </div>
        <span className="truncate text-[10px] capitalize text-text-muted">
          {tool.category}
        </span>
      </div>

      <h2 className="text-[15px] font-medium leading-snug tracking-tight text-text">
        {tool.name}
      </h2>
      <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-text-muted">
        {tool.tagline}
      </p>

      <span className="mt-2.5 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
        Open
        <ArrowUpRight
          size={12}
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </Link>
  );
}
