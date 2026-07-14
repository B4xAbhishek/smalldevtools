"use client";

import { useCallback, useState } from "react";
import { track } from "@/lib/analytics";

const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"] as const;

function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

export function DiceRoller() {
  const [count, setCount] = useState(1);
  const [values, setValues] = useState<number[]>([1]);
  const [rolling, setRolling] = useState(false);

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const id = window.setInterval(() => {
      ticks += 1;
      setValues(Array.from({ length: count }, () => rollDie()));
      if (ticks >= 8) {
        window.clearInterval(id);
        const final = Array.from({ length: count }, () => rollDie());
        setValues(final);
        setRolling(false);
        track("dice_rolled", { count, total: final.reduce((a, b) => a + b, 0) });
      }
    }, 70);
  }, [count, rolling]);

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="dice-count" className="mb-2 block text-sm font-medium text-text">
          Number of dice
        </label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              className={`btn min-h-10 min-w-10 px-3 text-sm ${
                count === n ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => {
                setCount(n);
                setValues(Array.from({ length: n }, () => 1));
              }}
              disabled={rolling}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-2 py-3 sm:gap-3 sm:py-4"
        aria-live="polite"
      >
        {values.map((v, i) => (
          <span
            key={`${i}-${v}-${rolling}`}
            className={`flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface text-4xl shadow-sm transition sm:h-20 sm:w-20 sm:rounded-2xl sm:text-5xl ${
              rolling ? "scale-105 animate-pulse" : ""
            }`}
            style={{ fontFamily: "serif" }}
          >
            {FACES[v - 1]}
          </span>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-text-muted">Total</p>
        <p className="text-3xl font-medium tabular-nums text-text sm:text-4xl">
          {total}
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary w-full"
        onClick={roll}
        disabled={rolling}
      >
        {rolling ? "Rolling…" : "Roll dice"}
      </button>
    </div>
  );
}
