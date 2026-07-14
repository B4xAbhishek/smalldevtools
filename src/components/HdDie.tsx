"use client";

import type { ReactNode } from "react";
import Image from "next/image";

/** Ivory die surface texture — close-up white die (Unsplash). */
export const DIE_TEXTURE_URL =
  "https://images.unsplash.com/photo-1666870747605-cca30ed154c5?w=800&q=80&auto=format&fit=crop";

/** Ambient casino dice on dark — stage atmosphere (Unsplash). */
export const DIE_STAGE_URL =
  "https://images.unsplash.com/photo-1608231883522-2efb1897a608?w=800&q=80&auto=format&fit=crop";

type Face = 1 | 2 | 3 | 4 | 5 | 6;

/** Classic die pip positions on a 3×3 grid (1-indexed cells). */
const PIP_MAP: Record<Face, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

const SIZE = {
  sm: "h-16 w-16 sm:h-20 sm:w-20",
  md: "h-20 w-20 sm:h-24 sm:w-24",
  lg: "h-24 w-24 sm:h-28 sm:w-28",
} as const;

type HdDieProps = {
  value: number;
  rolling?: boolean;
  size?: keyof typeof SIZE;
  className?: string;
};

function clampFace(n: number): Face {
  const v = Math.round(n);
  if (v < 1) return 1;
  if (v > 6) return 6;
  return v as Face;
}

export function HdDie({
  value,
  rolling = false,
  size = "md",
  className = "",
}: HdDieProps) {
  const face = clampFace(value);
  const pips = PIP_MAP[face];

  return (
    <span
      role="img"
      aria-label={`Die showing ${face}`}
      className={`hd-die relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[18%] ${SIZE[size]} ${
        rolling ? "hd-die--rolling" : ""
      } ${className}`}
    >
      <Image
        src={DIE_TEXTURE_URL}
        alt=""
        fill
        sizes="112px"
        className="object-cover scale-110 opacity-95"
        priority={false}
        aria-hidden
      />
      {/* Soft ivory wash so pips stay high-contrast on any crop */}
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-white/35 to-stone-300/40 mix-blend-soft-light dark:from-white/40 dark:via-white/25 dark:to-stone-400/30"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-[18%] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(0,0,0,0.18)]"
        aria-hidden
      />
      <span
        className="relative z-10 grid h-[72%] w-[72%] grid-cols-3 grid-rows-3 place-items-center gap-[6%]"
        aria-hidden
      >
        {Array.from({ length: 9 }, (_, i) => {
          const cell = i + 1;
          const on = pips.includes(cell);
          return (
            <span
              key={cell}
              className={`block aspect-square w-[78%] max-w-3 rounded-full transition-opacity duration-150 ${
                on
                  ? "bg-[#1a1a1c] shadow-[0_1px_1px_rgba(255,255,255,0.35),inset_0_1px_2px_rgba(0,0,0,0.55)] opacity-100"
                  : "opacity-0"
              }`}
            />
          );
        })}
      </span>
    </span>
  );
}

type DiceStageProps = {
  children: ReactNode;
  className?: string;
};

/** Atmospheric stage with subtle Unsplash dice photo behind interactive dice. */
export function DiceStage({ children, className = "" }: DiceStageProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-muted/80 py-6 sm:py-8 ${className}`}
    >
      <Image
        src={DIE_STAGE_URL}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 640px"
        className="object-cover opacity-[0.22] dark:opacity-[0.28]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg/55 dark:from-bg/60 dark:to-bg/70"
        aria-hidden
      />
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {children}
      </div>
    </div>
  );
}
