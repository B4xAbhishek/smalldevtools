"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";

type Cell = "X" | "O" | null;
type Board = Cell[];
type Outcome = "X" | "O" | "draw";

const WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function winnerOf(board: Board): Outcome | null {
  for (const [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(Boolean)) return "draw";
  return null;
}

function emptyBoard(): Board {
  return Array(9).fill(null);
}

function outcomeMessage(outcome: Outcome): string {
  return outcome === "draw" ? "Draw" : `${outcome} wins`;
}

export function TicTacToe() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [xTurn, setXTurn] = useState(true);
  const outcome = useMemo(() => winnerOf(board), [board]);
  const replayRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const play = useCallback(
    (i: number) => {
      if (outcome || board[i]) return;
      const next = board.slice();
      next[i] = xTurn ? "X" : "O";
      setBoard(next);
      const w = winnerOf(next);
      if (w) track("tictactoe_end", { result: w });
      else setXTurn((t) => !t);
    },
    [board, outcome, xTurn],
  );

  const reset = useCallback(() => {
    setBoard(emptyBoard());
    setXTurn(true);
  }, []);

  useEffect(() => {
    if (!outcome) return;

    const btn = replayRef.current;
    btn?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        reset();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Single focusable control — keep focus on Replay
      e.preventDefault();
      btn?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [outcome, reset]);

  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-text-muted" aria-live="polite">
        {outcome ? "\u00a0" : `${xTurn ? "X" : "O"} to play`}
      </p>

      <div className="relative mx-auto max-w-[280px] sm:max-w-xs">
        <div
          className="grid grid-cols-3 gap-2"
          role="grid"
          aria-label="Tic tac toe board"
          aria-hidden={outcome ? true : undefined}
        >
          {board.map((cell, i) => (
            <button
              key={i}
              type="button"
              role="gridcell"
              className="flex aspect-square items-center justify-center rounded-xl border border-border bg-surface text-3xl font-medium text-text shadow-sm transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-100 sm:text-4xl"
              onClick={() => play(i)}
              disabled={Boolean(cell) || Boolean(outcome)}
              tabIndex={outcome ? -1 : undefined}
              aria-label={cell ? `Cell ${i + 1}, ${cell}` : `Cell ${i + 1}, empty`}
            >
              {cell}
            </button>
          ))}
        </div>

        {outcome ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-bg/70 backdrop-blur-[2px]"
            onClick={(e) => {
              if (e.target === e.currentTarget) reset();
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ttt-result-title"
              className="animate-pop mx-3 w-full max-w-[11.5rem] rounded-xl border border-border bg-surface px-4 py-5 text-center shadow-[var(--shadow-lift)]"
            >
              <p
                id="ttt-result-title"
                className="text-base font-medium tracking-tight text-text"
              >
                {outcomeMessage(outcome)}
              </p>
              <button
                ref={replayRef}
                type="button"
                className="btn btn-primary mt-4 w-full"
                onClick={reset}
              >
                Replay
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="btn btn-secondary w-full"
        onClick={reset}
        tabIndex={outcome ? -1 : undefined}
      >
        New game
      </button>
    </div>
  );
}
