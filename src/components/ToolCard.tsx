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
      className="soft-card group flex min-h-[7.5rem] flex-col p-3.5 transition duration-200 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] sm:min-h-0 sm:p-3"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="relative h-9 w-9 shrink-0 sm:h-8 sm:w-8">
          <div className="pointer-events-none absolute inset-0">
            <Player
              component={CardRevealComposition}
              inputProps={{ accent: tool.accent }}
              durationInFrames={30}
              compositionWidth={32}
              compositionHeight={32}
              fps={30}
              style={{ width: "100%", height: "100%" }}
              controls={false}
              autoPlay
              loop={false}
              acknowledgeRemotionLicense
            />
          </div>
          <div
            className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full sm:h-8 sm:w-8"
            style={{ color: tool.accent }}
          >
            <ToolIcon name={tool.icon} size={16} />
          </div>
        </div>
        <span className="truncate text-[10px] capitalize text-text-muted sm:text-[10px]">
          {tool.category}
        </span>
      </div>

      <h2 className="text-base font-medium leading-snug tracking-tight text-text sm:text-[15px]">
        {tool.name}
      </h2>
      <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-text-muted sm:text-xs">
        {tool.tagline}
      </p>

      <span className="mt-3 inline-flex items-center gap-0.5 text-sm font-medium text-primary sm:mt-2.5 sm:text-xs">
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
