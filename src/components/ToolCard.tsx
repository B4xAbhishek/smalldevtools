"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ToolMeta } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";

export function ToolCard({ tool }: { tool: ToolMeta; index: number }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="soft-card group flex min-h-[7.5rem] flex-col p-3.5 transition duration-200 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] sm:min-h-0 sm:p-3"
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8"
          style={{
            backgroundColor: `color-mix(in srgb, ${tool.accent} 18%, transparent)`,
            color: tool.accent,
          }}
        >
          <ToolIcon name={tool.icon} size={16} />
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

      <span className="mt-2.5 inline-flex min-h-8 items-center gap-0.5 text-xs font-medium text-primary">
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
