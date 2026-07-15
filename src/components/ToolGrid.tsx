"use client";

import { Search, Star } from "lucide-react";
import { useMemo } from "react";
import { useAtom } from "jotai";
import {
  CATEGORIES,
  filterTools,
  getTool,
  tools,
  type ToolCategory,
} from "@/lib/tools";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ToolCard } from "@/components/ToolCard";
import {
  favoriteToolsAtom,
  recentToolsAtom,
  toolCategoryAtom,
  toolSearchAtom,
} from "@/state/atoms";

export function ToolGrid() {
  const [category, setCategory] = useAtom(toolCategoryAtom);
  const [query, setQuery] = useAtom(toolSearchAtom);
  const [favorites] = useAtom(favoriteToolsAtom);
  const [recent] = useAtom(recentToolsAtom);

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
        t.category.toLowerCase().includes(q) ||
        t.keywords?.some((k) => k.includes(q)),
    );
  }, [category, query]);

  const favoriteTools = favorites
    .map((s) => getTool(s))
    .filter(Boolean) as typeof tools;
  const recentTools = recent
    .map((s) => getTool(s))
    .filter(Boolean)
    .slice(0, 4) as typeof tools;

  return (
    <section id="tools" className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text sm:text-3xl">
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
            className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-text-muted"
            size={16}
            aria-hidden
          />
          <input
            id="tool-search"
            className="field field-with-icon"
            placeholder="Search tools"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
      </div>

      {(favoriteTools.length > 0 || recentTools.length > 0) && (
        <div className="mb-6 space-y-4">
          {favoriteTools.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                <Star size={12} className="fill-cta text-cta" aria-hidden />
                Favorites
              </p>
              <div className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
                {favoriteTools.map((tool, i) => (
                  <ToolCard key={`fav-${tool.slug}`} tool={tool} index={i} />
                ))}
              </div>
            </div>
          )}
          {recentTools.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                Recently used
              </p>
              <div className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
                {recentTools.map((tool, i) => (
                  <ToolCard key={`recent-${tool.slug}`} tool={tool} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CategoryTabs active={category} onChange={setCategory} counts={counts} />

      <div className="mt-4 grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2 sm:mt-5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
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
