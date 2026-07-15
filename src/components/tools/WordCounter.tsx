"use client";

import { Copy, Eraser, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";

function countStats(text: string) {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const sentences = trimmed
    ? (trimmed.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? []).filter((s) => s.trim())
        .length
    : 0;
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length
    : 0;
  const lines = text.length === 0 ? 0 : text.split(/\n/).length;
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingMinutes,
  };
}

export function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => countStats(text), [text]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      track("word_counter_copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const cards: { label: string; value: string | number }[] = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    {
      label: "Reading time",
      value: stats.words === 0 ? "—" : `~${stats.readingMinutes} min`,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="word-counter-text" className="mb-2 block text-sm font-medium text-text">
          Your text
        </label>
        <textarea
          id="word-counter-text"
          className="field min-h-[180px] resize-y font-sans"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type anything…"
          spellCheck
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-muted px-3 py-3 text-center"
          >
            <p className="text-xl font-medium tracking-tight text-text sm:text-2xl">
              {card.value}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={copyText}
          disabled={!text}
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied ? "Copied" : "Copy text"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setText("");
            track("word_counter_cleared");
          }}
          disabled={!text}
        >
          <Eraser size={16} aria-hidden />
          Clear
        </button>
      </div>
    </div>
  );
}
