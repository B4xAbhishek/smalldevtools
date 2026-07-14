"use client";

import { FormEvent, useCallback, useState } from "react";
import { track } from "@/lib/analytics";

function newTarget() {
  return 1 + Math.floor(Math.random() * 100);
}

export function NumberGuess() {
  const [target, setTarget] = useState(newTarget);
  const [guess, setGuess] = useState("");
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const reset = useCallback(() => {
    setTarget(newTarget());
    setGuess("");
    setTries(0);
    setHint(null);
    setWon(false);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (won) return;
    const n = Number(guess);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      setHint("Enter a whole number from 1 to 100.");
      return;
    }
    const nextTries = tries + 1;
    setTries(nextTries);
    if (n === target) {
      setWon(true);
      setHint(`Got it in ${nextTries} try${nextTries === 1 ? "" : "ies"}!`);
      track("number_guess_won", { tries: nextTries });
    } else if (n < target) {
      setHint("Too low — go higher.");
    } else {
      setHint("Too high — go lower.");
    }
    setGuess("");
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-text-muted">
        I&apos;m thinking of a number between <strong className="text-text">1</strong> and{" "}
        <strong className="text-text">100</strong>. How many guesses will it take?
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="guess" className="sr-only">
          Your guess
        </label>
        <input
          id="guess"
          type="number"
          inputMode="numeric"
          min={1}
          max={100}
          className="field flex-1"
          placeholder="Your guess"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={won}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary sm:min-w-[120px]" disabled={won}>
          Guess
        </button>
      </form>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-text-muted">
          Attempts: <span className="font-medium tabular-nums text-text">{tries}</span>
        </span>
        <button type="button" className="btn btn-secondary !min-h-9 !px-3 !text-sm" onClick={reset}>
          New game
        </button>
      </div>

      {hint && (
        <div
          className={`rounded-xl border px-4 py-3 text-center text-base font-medium ${
            won
              ? "border-success/40 bg-success/10 text-success"
              : "border-border bg-muted text-text"
          }`}
          role="status"
        >
          {hint}
        </div>
      )}
    </div>
  );
}
