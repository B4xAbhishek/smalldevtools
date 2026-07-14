"use client";

import { useCallback, useState } from "react";
import { track } from "@/lib/analytics";

type Choice = "rock" | "paper" | "scissors";

const CHOICES: { id: Choice; label: string; emoji: string }[] = [
  { id: "rock", label: "Rock", emoji: "✊" },
  { id: "paper", label: "Paper", emoji: "✋" },
  { id: "scissors", label: "Scissors", emoji: "✌️" },
];

function beats(a: Choice, b: Choice): boolean {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  );
}

function randomChoice(): Choice {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
}

export function RockPaperScissors() {
  const [you, setYou] = useState<Choice | null>(null);
  const [cpu, setCpu] = useState<Choice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 });
  const [thinking, setThinking] = useState(false);

  const play = useCallback(
    (choice: Choice) => {
      if (thinking) return;
      setThinking(true);
      setYou(choice);
      setCpu(null);
      setResult(null);

      window.setTimeout(() => {
        const opponent = randomChoice();
        let outcome: "win" | "lose" | "draw";
        if (choice === opponent) outcome = "draw";
        else if (beats(choice, opponent)) outcome = "win";
        else outcome = "lose";

        setCpu(opponent);
        setResult(outcome);
        setScore((s) => ({ ...s, [outcome]: s[outcome] + 1 }));
        setThinking(false);
        track("rps_played", { you: choice, cpu: opponent, outcome });
      }, 450);
    },
    [thinking],
  );

  const label = (c: Choice | null) =>
    c ? CHOICES.find((x) => x.id === c)! : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl border border-border bg-muted px-2 py-2">
          <p className="text-text-muted">Wins</p>
          <p className="text-lg font-medium tabular-nums text-success">{score.win}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted px-2 py-2">
          <p className="text-text-muted">Draws</p>
          <p className="text-lg font-medium tabular-nums text-text">{score.draw}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted px-2 py-2">
          <p className="text-text-muted">Losses</p>
          <p className="text-lg font-medium tabular-nums text-danger">{score.lose}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-2 sm:gap-8" aria-live="polite">
        <div className="text-center">
          <p className="text-xs text-text-muted">You</p>
          <p className="mt-1 text-5xl sm:text-6xl">{label(you)?.emoji ?? "❔"}</p>
        </div>
        <p className="text-sm font-medium text-text-muted">vs</p>
        <div className="text-center">
          <p className="text-xs text-text-muted">CPU</p>
          <p className={`mt-1 text-5xl sm:text-6xl ${thinking ? "animate-pulse" : ""}`}>
            {thinking ? "…" : (label(cpu)?.emoji ?? "❔")}
          </p>
        </div>
      </div>

      {result && !thinking && (
        <p
          className={`text-center text-lg font-medium ${
            result === "win"
              ? "text-success"
              : result === "lose"
                ? "text-danger"
                : "text-text"
          }`}
          role="status"
        >
          {result === "win" ? "You win!" : result === "lose" ? "You lose" : "Draw"}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            type="button"
            className="btn btn-secondary min-h-14 flex-col gap-0.5 !px-2"
            onClick={() => play(c.id)}
            disabled={thinking}
          >
            <span className="text-2xl" aria-hidden>
              {c.emoji}
            </span>
            <span className="text-xs sm:text-sm">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
