"use client";

import { Search } from "lucide-react";
import { useMemo } from "react";
import { useAtom } from "jotai";
import {
  CATEGORIES,
  filterTools,
  tools,
  type ToolCategory,
} from "@/lib/tools";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ToolCard } from "@/components/ToolCard";
import { toolCategoryAtom, toolSearchAtom } from "@/state/atoms";

export function ToolGrid() {
  const [category, setCategory] = useAtom(toolCategoryAtom);
  const [query, setQuery] = useAtom(toolSearchAtom);

  const counts = useMemo(() => {
    return Object.fromEntries(
      CATEGORIES.map((c) => [c.id, filterTools(c.id).length]),
    ) as Record<"all" | ToolCategory, number>;
  }, []);

  const visible = useMemo(() => {
    const list = filterTools(category);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [category, query]);

  return (
    <section id="tools" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-text sm:text-3xl">
            Tools
          </h1>
          <p className="mt-1 text-sm text-text-muted sm:text-base">
            {tools.length} free utilities
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="tool-search" className="sr-only">
            Search tools
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
            size={16}
            aria-hidden
          />
          <input
            id="tool-search"
            className="field pl-9"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <CategoryTabs active={category} onChange={setCategory} counts={counts} />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {visible.map((tool, i) => (
          <ToolCard key={tool.slug} tool={tool} index={i} />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="soft-card mt-5 px-5 py-10 text-center">
          <p className="font-medium text-text">No tools found</p>
          <p className="mt-1 text-sm text-text-muted">
            Try another search or switch to All.
          </p>
          <button
            type="button"
            className="btn btn-secondary mt-4"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
