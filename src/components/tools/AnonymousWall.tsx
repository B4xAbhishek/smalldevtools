"use client";

import Image from "next/image";
import { Loader2, MessageSquarePlus, Send, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ANON_MAX_CHARS, containsBlockedLanguage } from "@/lib/anon-filter";
import { track } from "@/lib/analytics";

type AnonPost = {
  seq: number;
  text: string;
  createdAt: string;
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AnonymousWall() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState<AnonPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badmosiOpen, setBadmosiOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/anon-posts");
      const data = (await res.json()) as { posts?: AnonPost[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setPosts(data.posts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!badmosiOpen) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBadmosiOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [badmosiOpen]);

  const remaining = ANON_MAX_CHARS - text.length;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    if (containsBlockedLanguage(trimmed)) {
      setBadmosiOpen(true);
      track("anon_post_blocked");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/anon-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = (await res.json()) as {
        post?: AnonPost;
        error?: string;
        code?: string;
        image?: string;
      };

      if (res.status === 422 && data.code === "PROFANITY") {
        setBadmosiOpen(true);
        track("anon_post_blocked");
        return;
      }

      if (!res.ok || !data.post) {
        throw new Error(data.error || "Could not post");
      }

      setPosts((prev) => [data.post!, ...prev]);
      setText("");
      track("anon_post_created", { seq: data.post.seq });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-3">
        <label htmlFor="anon-post" className="block text-sm font-medium text-text">
          Say something anonymous
        </label>
        <div className="relative">
          <textarea
            id="anon-post"
            className="field min-h-[5.5rem] resize-none pr-14"
            maxLength={ANON_MAX_CHARS}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, ANON_MAX_CHARS))}
            placeholder="Up to 50 characters…"
            aria-describedby="anon-count"
            disabled={submitting}
          />
          <span
            id="anon-count"
            className={`pointer-events-none absolute right-3 bottom-3 text-xs tabular-nums ${
              remaining <= 10 ? "text-cta" : "text-text-muted"
            }`}
          >
            {remaining}
          </span>
        </div>
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          disabled={submitting || !text.trim()}
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={18} aria-hidden />
          ) : (
            <Send size={18} aria-hidden />
          )}
          {submitting ? "Posting…" : "Post anonymously"}
        </button>
      </form>

      <div>
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
          <MessageSquarePlus size={12} aria-hidden />
          Latest posts
        </p>

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="animate-spin" size={16} aria-hidden />
            Loading…
          </p>
        ) : posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
            No posts yet — be the first.
          </p>
        ) : (
          <ul className="space-y-2.5" aria-live="polite">
            {posts.map((post) => (
              <li
                key={post.seq}
                className="rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-[var(--shadow-soft)] transition duration-200 ease-out hover:border-border-strong"
              >
                <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium tabular-nums text-primary">
                    #{post.seq}
                  </span>
                  <span className="font-medium text-text">Anonymous</span>
                  <span aria-hidden>·</span>
                  <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                </div>
                <p className="text-[15px] leading-relaxed break-words text-text">
                  {post.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {badmosiOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setBadmosiOpen(false)}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="animate-pop w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-lift)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 id={titleId} className="text-sm font-medium text-text">
                Post blocked
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-muted transition hover:bg-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label="Close"
                onClick={() => setBadmosiOpen(false)}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="relative aspect-square w-full bg-black">
              <Image
                src="/badmosi.png"
                alt="Badmosi — watch your language"
                fill
                className="object-contain"
                sizes="(max-width: 384px) 100vw, 384px"
                priority
              />
            </div>
            <div className="space-y-3 p-4">
              <p className="text-sm text-text-muted">
                That language isn’t allowed. Edit your post and try again.
              </p>
              <button
                type="button"
                className="btn-primary w-full cursor-pointer"
                onClick={() => setBadmosiOpen(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
