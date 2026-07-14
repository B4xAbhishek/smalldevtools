"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";

export default function SuggestPage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          rating: rating ?? undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      track("feedback_submitted", {
        hasEmail: Boolean(email.trim()),
        rating: rating ?? 0,
      });
      setSent(true);
      setMessage("");
      setEmail("");
      setRating(null);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-3 py-8 sm:px-6 sm:py-10">
      <h1 className="text-xl font-medium tracking-tight text-text sm:text-3xl">
        Request an app
      </h1>
      <p className="mt-2 text-sm text-text-muted sm:text-base">
        Tell us which tool or app you want next. Ideas, features, and bug notes
        are welcome — we read every message.
      </p>

      {sent ? (
        <div className="soft-card mt-6 p-5">
          <p className="font-medium text-text">Thanks — request saved.</p>
          <p className="mt-1 text-sm text-text-muted">
            Your note was stored so we can follow up.
          </p>
          <button
            type="button"
            className="btn btn-secondary mt-4"
            onClick={() => setSent(false)}
          >
            Request another app
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="soft-card mt-6 space-y-4 p-4 sm:p-5">
          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium">
              What should we build?
            </label>
            <textarea
              id="message"
              className="field min-h-[120px] resize-y"
              required
              minLength={3}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. PDF to Word, image compressor, or a feature you need…"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Rating (optional)</p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`btn min-h-10 min-w-10 px-3 text-sm ${
                    rating === n ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => setRating((r) => (r === n ? null : n))}
                  aria-pressed={rating === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                >
                  {n}
                </button>
              ))}
            </div>
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
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-[var(--alert-error-border)] bg-[var(--alert-error-bg)] px-3 py-2 text-sm text-[var(--alert-error-text)]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Send request"}
          </button>
        </form>
      )}
    </div>
  );
}
