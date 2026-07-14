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
      className="soft-card group flex flex-col p-4 transition duration-200 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="relative h-10 w-10">
          <div className="pointer-events-none absolute inset-0">
            <Player
              component={CardRevealComposition}
              inputProps={{ accent: tool.accent }}
              durationInFrames={30}
              compositionWidth={40}
              compositionHeight={40}
              fps={30}
              style={{ width: 40, height: 40 }}
              controls={false}
              autoPlay
              loop={false}
              acknowledgeRemotionLicense
            />
          </div>
          <div
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ color: tool.accent }}
          >
            <ToolIcon name={tool.icon} size={20} />
          </div>
        </div>
        <span className="text-xs capitalize text-text-muted">{tool.category}</span>
      </div>

      <h2 className="text-lg font-medium tracking-tight text-text">
        {tool.name}
      </h2>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-text-muted">
        {tool.description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Open
        <ArrowUpRight
          size={14}
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </Link>
  );
}
