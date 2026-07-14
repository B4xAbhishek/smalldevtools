"use client";

import { useCallback, useState } from "react";
import { DiceStage, HdDie } from "@/components/HdDie";
import { track } from "@/lib/analytics";

export type SevenBet = "down" | "seven" | "up";

function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

function outcomeFromSum(sum: number): SevenBet {
  if (sum < 7) return "down";
  if (sum > 7) return "up";
  return "seven";
}

const BET_LABEL: Record<SevenBet, string> = {
  down: "7 Down",
  seven: "7",
  up: "7 Up",
};

export function SevenUpDown() {
  const [bet, setBet] = useState<SevenBet | null>(null);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [history, setHistory] = useState<
    { bet: SevenBet; sum: number; win: boolean }[]
  >([]);

  const sum = dice[0] + dice[1];

  const roll = useCallback(() => {
    if (!bet || rolling) return;
    setRolling(true);
    setResult(null);

    let ticks = 0;
    const id = window.setInterval(() => {
      ticks += 1;
      setDice([rollDie(), rollDie()]);
      if (ticks >= 10) {
        window.clearInterval(id);
        const a = rollDie();
        const b = rollDie();
        const total = a + b;
        const actual = outcomeFromSum(total);
        const win = actual === bet;
        setDice([a, b]);
        setResult(win ? "win" : "lose");
        setHistory((h) => [{ bet, sum: total, win }, ...h].slice(0, 8));
        setRolling(false);
        track("seven_up_down", { bet, sum: total, win });
      }
    }, 70);
  }, [bet, rolling]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-text">1. Predict the total</p>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {(
            [
              { id: "down" as const, hint: "Under 7", hintSm: "Total under 7" },
              { id: "seven" as const, hint: "Exactly 7", hintSm: "Exactly 7" },
              { id: "up" as const, hint: "Over 7", hintSm: "Total over 7" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={rolling}
              onClick={() => {
                setBet(opt.id);
                setResult(null);
              }}
              aria-pressed={bet === opt.id}
              className={`min-h-[4.25rem] touch-manipulation rounded-xl border px-1.5 py-2.5 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-0 sm:px-2 sm:py-3 ${
                bet === opt.id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-muted text-text hover:border-border-strong"
              }`}
            >
              <span className="block text-xs font-medium sm:text-sm">
                {BET_LABEL[opt.id]}
              </span>
              <span
                className={`mt-0.5 block text-[10px] leading-tight sm:text-[11px] ${
                  bet === opt.id ? "text-white/80" : "text-text-muted"
                }`}
              >
                <span className="sm:hidden">{opt.hint}</span>
                <span className="hidden sm:inline">{opt.hintSm}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-text">2. Roll two dice</p>
        <div aria-live="polite" aria-atomic="true">
          <DiceStage>
            {dice.map((v, i) => (
              <HdDie
                key={`${i}-${rolling ? "r" : "s"}`}
                value={v}
                rolling={rolling}
                size="lg"
              />
            ))}
          </DiceStage>
        </div>
        <p className="mt-3 text-center text-sm text-text-muted">
          Sum{" "}
          <span className="font-medium tabular-nums text-text">{sum}</span>
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary w-full min-h-11 touch-manipulation text-base"
        onClick={roll}
        disabled={!bet || rolling}
        aria-busy={rolling}
      >
        {!bet ? "Pick 7 Down, 7, or 7 Up first" : rolling ? "Rolling…" : "Roll"}
      </button>

      {result && !rolling && (
        <div
          className={`rounded-xl border px-3 py-3 text-center text-base font-medium sm:px-4 sm:text-lg ${
            result === "win"
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
          role="status"
        >
          {result === "win"
            ? `You win — ${sum} is ${BET_LABEL[outcomeFromSum(sum)]}`
            : `You lose — ${sum} is ${BET_LABEL[outcomeFromSum(sum)]}`}
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-xl border border-border bg-muted px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Recent rounds
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {history.map((h, i) => (
              <li
                key={`${h.sum}-${i}`}
                className="flex justify-between gap-2 text-text"
              >
                <span>
                  Bet {BET_LABEL[h.bet]} → {h.sum}
                </span>
                <span className={h.win ? "text-success" : "text-danger"}>
                  {h.win ? "Win" : "Lose"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
