"use client";

import { CATEGORIES, type ToolCategory } from "@/lib/tools";

type Props = {
  active: "all" | ToolCategory;
  onChange: (id: "all" | ToolCategory) => void;
  counts: Record<"all" | ToolCategory, number>;
};

export function CategoryTabs({ active, onChange, counts }: Props) {
  return (
    <div
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
      role="tablist"
      aria-label="Filter tools by category"
    >
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              isActive
                ? "bg-text text-bg"
                : "bg-muted text-text-muted hover:text-text"
            }`}
          >
            {cat.label}
            <span className="tabular-nums opacity-60">{counts[cat.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
