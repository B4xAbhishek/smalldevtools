"use client";

import { useCallback, useState } from "react";
import { DiceStage, HdDie } from "@/components/HdDie";
import { track } from "@/lib/analytics";

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
        <div
          id="dice-count"
          role="group"
          aria-label="Number of dice"
          className="flex flex-wrap gap-2"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              className={`btn min-h-11 min-w-11 touch-manipulation px-3 text-sm ${
                count === n ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => {
                setCount(n);
                setValues(Array.from({ length: n }, () => 1));
              }}
              disabled={rolling}
              aria-pressed={count === n}
              aria-label={`${n} ${n === 1 ? "die" : "dice"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true">
        <DiceStage>
          {values.map((v, i) => (
            <HdDie
              key={`${i}-${rolling ? "r" : "s"}`}
              value={v}
              rolling={rolling}
              size={count > 4 ? "sm" : "md"}
            />
          ))}
        </DiceStage>
      </div>

      <div className="text-center">
        <p className="text-sm text-text-muted">Total</p>
        <p className="text-3xl font-medium tabular-nums text-text sm:text-4xl">
          {total}
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary w-full min-h-11 touch-manipulation text-base"
        onClick={roll}
        disabled={rolling}
        aria-busy={rolling}
      >
        {rolling ? "Rolling…" : "Roll dice"}
      </button>
    </div>
  );
}
