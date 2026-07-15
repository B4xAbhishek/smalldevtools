"use client";

import { useMemo, useState } from "react";
import { Eraser } from "lucide-react";
import { track } from "@/lib/analytics";

type DiffOp =
  | { type: "equal"; text: string }
  | { type: "insert"; text: string }
  | { type: "delete"; text: string };

/** Line-based LCS diff — fine for typical paste sizes. */
function diffLines(left: string, right: string): DiffOp[] {
  const a = left.split("\n");
  const b = right.split("\n");
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0),
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "delete", text: a[i] });
      i++;
    } else {
      ops.push({ type: "insert", text: b[j] });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: "delete", text: a[i++] });
  }
  while (j < m) {
    ops.push({ type: "insert", text: b[j++] });
  }
  return ops;
}

export function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const ops = useMemo(() => {
    if (!left && !right) return [];
    return diffLines(left, right);
  }, [left, right]);

  const summary = useMemo(() => {
    let added = 0;
    let removed = 0;
    let same = 0;
    for (const op of ops) {
      if (op.type === "insert") added++;
      else if (op.type === "delete") removed++;
      else same++;
    }
    return { added, removed, same };
  }, [ops]);

  const clear = () => {
    setLeft("");
    setRight("");
    track("text_diff_cleared");
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="diff-left" className="mb-2 block text-sm font-medium text-text">
            Original
          </label>
          <textarea
            id="diff-left"
            className="field min-h-[160px] resize-y font-mono text-sm"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste original text…"
            spellCheck={false}
          />
        </div>
        <div>
          <label htmlFor="diff-right" className="mb-2 block text-sm font-medium text-text">
            Changed
          </label>
          <textarea
            id="diff-right"
            className="field min-h-[160px] resize-y font-mono text-sm"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste changed text…"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-muted">
          {ops.length === 0 ? (
            "Paste text on both sides to compare."
          ) : (
            <>
              <span className="text-success">{summary.added} added</span>
              {" · "}
              <span className="text-danger">{summary.removed} removed</span>
              {" · "}
              {summary.same} unchanged
            </>
          )}
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={clear}
          disabled={!left && !right}
        >
          <Eraser size={16} aria-hidden />
          Clear
        </button>
      </div>

      {ops.length > 0 && (
        <div
          className="overflow-hidden rounded-xl border border-border bg-muted"
          role="region"
          aria-label="Diff result"
        >
          <ul className="max-h-[28rem] overflow-auto font-mono text-xs sm:text-sm">
            {ops.map((op, idx) => {
              const styles =
                op.type === "insert"
                  ? "text-text"
                  : op.type === "delete"
                    ? "text-text"
                    : "text-text-muted";
              const bg =
                op.type === "insert"
                  ? "color-mix(in srgb, var(--success) 18%, transparent)"
                  : op.type === "delete"
                    ? "color-mix(in srgb, var(--danger) 18%, transparent)"
                    : undefined;
              const prefix =
                op.type === "insert" ? "+" : op.type === "delete" ? "−" : " ";
              return (
                <li
                  key={`${idx}-${op.type}-${op.text.slice(0, 24)}`}
                  className={`flex gap-2 border-b border-border/60 px-3 py-1.5 last:border-b-0 ${styles}`}
                  style={bg ? { backgroundColor: bg } : undefined}
                >
                  <span className="w-4 shrink-0 select-none opacity-70" aria-hidden>
                    {prefix}
                  </span>
                  <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                    {op.text.length ? op.text : " "}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
