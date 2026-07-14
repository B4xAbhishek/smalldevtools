"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";

export default function SuggestPage() {
  const [idea, setIdea] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    const suggestions = JSON.parse(
      localStorage.getItem("sdt-suggestions") || "[]",
    ) as { idea: string; email?: string; at: string }[];
    suggestions.unshift({
      idea: idea.trim(),
      email: email.trim() || undefined,
      at: new Date().toISOString(),
    });
    localStorage.setItem(
      "sdt-suggestions",
      JSON.stringify(suggestions.slice(0, 50)),
    );
    track("tool_suggested", { idea: idea.trim() });
    setSent(true);
    setIdea("");
    setEmail("");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-medium tracking-tight text-text sm:text-3xl">
        Suggest a tool
      </h1>
      <p className="mt-2 text-text-muted">
        Tell us what mini tool would help you. We read every idea.
      </p>

      {sent ? (
        <div className="soft-card mt-6 p-5">
          <p className="font-medium text-text">Thanks — idea saved.</p>
          <button
            type="button"
            className="btn btn-secondary mt-4"
            onClick={() => setSent(false)}
          >
            Suggest another
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="soft-card mt-6 space-y-4 p-5">
          <div>
            <label htmlFor="idea" className="mb-2 block text-sm font-medium">
              Your idea
            </label>
            <textarea
              id="idea"
              className="field min-h-[120px] resize-y"
              required
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. PDF to Word, image compressor…"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="so we can follow up"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Send suggestion
          </button>
        </form>
      )}
    </div>
  );
}
