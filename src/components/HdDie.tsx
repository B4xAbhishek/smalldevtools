"use client";

import type { ReactNode } from "react";

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

/** Pip centers in a 100×100 viewBox (inset face). */
const PIP_XY: Record<number, [number, number]> = {
  1: [28, 28],
  2: [50, 28],
  3: [72, 28],
  4: [28, 50],
  5: [50, 50],
  6: [72, 50],
  7: [28, 72],
  8: [50, 72],
  9: [72, 72],
};

const SIZE = {
  sm: "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]",
  md: "h-[4.75rem] w-[4.75rem] sm:h-24 sm:w-24",
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

/** Claymorphism d6 — soft 3D face + clear SVG pips (no photos / emoji). */
export function HdDie({
  value,
  rolling = false,
  size = "md",
  className = "",
}: HdDieProps) {
  const face = clampFace(value);
  const pips = PIP_MAP[face];
  const uid = `hd-die-${face}-${size}`;

  return (
    <span
      role="img"
      aria-label={`Die showing ${face}`}
      className={`hd-die relative inline-flex shrink-0 items-center justify-center ${SIZE[size]} ${
        rolling ? "hd-die--rolling" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="hd-die-svg h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${uid}-face`} x1="18%" y1="12%" x2="82%" y2="88%">
            <stop offset="0%" stopColor="#fffdf8" />
            <stop offset="45%" stopColor="#f4eee4" />
            <stop offset="100%" stopColor="#e4d8c8" />
          </linearGradient>
          <radialGradient id={`${uid}-gloss`} cx="32%" cy="28%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-pip`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#4a4a50" />
            <stop offset="70%" stopColor="#1c1c20" />
            <stop offset="100%" stopColor="#0e0e10" />
          </radialGradient>
        </defs>

        {/* Soft clay body */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="22"
          ry="22"
          fill={`url(#${uid}-face)`}
          stroke="#d2c6b6"
          strokeWidth="3.5"
        />
        {/* Inner rim for toy depth */}
        <rect
          x="14"
          y="14"
          width="72"
          height="72"
          rx="16"
          ry="16"
          fill="none"
          stroke="#c9bbaa"
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="22"
          ry="22"
          fill={`url(#${uid}-gloss)`}
        />

        {pips.map((cell) => {
          const [cx, cy] = PIP_XY[cell];
          return (
            <g key={cell}>
              <circle
                cx={cx}
                cy={cy}
                r="7.2"
                fill={`url(#${uid}-pip)`}
              />
              <circle
                cx={cx - 1.6}
                cy={cy - 1.8}
                r="2.1"
                fill="#ffffff"
                fillOpacity="0.22"
              />
            </g>
          );
        })}
      </svg>
    </span>
  );
}

type DiceStageProps = {
  children: ReactNode;
  className?: string;
};

/** Soft felt stage for dice — no photo backdrop. */
export function DiceStage({ children, className = "" }: DiceStageProps) {
  return (
    <div
      className={`hd-dice-stage relative overflow-hidden rounded-2xl border border-border py-8 sm:py-10 ${className}`}
    >
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {children}
      </div>
    </div>
  );
}
