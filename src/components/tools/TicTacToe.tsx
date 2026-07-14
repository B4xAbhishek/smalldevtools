"use client";

import { useCallback, useMemo, useState } from "react";
import { track } from "@/lib/analytics";

type Cell = "X" | "O" | null;
type Board = Cell[];

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

function winnerOf(board: Board): "X" | "O" | "draw" | null {
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

export function TicTacToe() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [xTurn, setXTurn] = useState(true);
  const outcome = useMemo(() => winnerOf(board), [board]);

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

  const reset = () => {
    setBoard(emptyBoard());
    setXTurn(true);
  };

  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-text-muted" aria-live="polite">
        {outcome === "draw"
          ? "Draw — no moves left"
          : outcome
            ? `${outcome} wins!`
            : `${xTurn ? "X" : "O"} to play`}
      </p>

      <div
        className="mx-auto grid max-w-[280px] grid-cols-3 gap-2 sm:max-w-xs"
        role="grid"
        aria-label="Tic tac toe board"
      >
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            role="gridcell"
            className="flex aspect-square items-center justify-center rounded-xl border border-border bg-surface text-3xl font-medium text-text shadow-sm transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-100 sm:text-4xl"
            onClick={() => play(i)}
            disabled={Boolean(cell) || Boolean(outcome)}
            aria-label={cell ? `Cell ${i + 1}, ${cell}` : `Cell ${i + 1}, empty`}
          >
            {cell}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-secondary w-full" onClick={reset}>
        New game
      </button>
    </div>
  );
}
