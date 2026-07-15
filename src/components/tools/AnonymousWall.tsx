"use client";

import Image from "next/image";
import { LayoutGrid, Loader2, Send, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-3">
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
              remaining <= 10 ? "text-[#FF9F0A]" : "text-text-muted"
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
          className="anon-post-btn group"
          disabled={submitting || !text.trim()}
        >
          <span className="anon-post-btn__glow" aria-hidden />
          <span className="relative z-[1] inline-flex items-center justify-center gap-2.5">
            {submitting ? (
              <Loader2 className="animate-spin" size={20} aria-hidden />
            ) : (
              <Send
                size={20}
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            )}
            {submitting ? "Posting…" : "Post anonymously"}
          </span>
        </button>
      </form>

      <div>
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
          <LayoutGrid size={12} aria-hidden />
          Latest posts
          {posts.length > 0 && (
            <span className="tabular-nums opacity-70">· {posts.length}</span>
          )}
        </p>

        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-text-muted">
            <Loader2 className="mr-2 animate-spin" size={16} aria-hidden />
            Loading…
          </div>
        ) : posts.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border px-4 text-center">
            <p className="text-sm font-medium text-text">No posts yet</p>
            <p className="mt-1 text-sm text-text-muted">Be the first.</p>
          </div>
        ) : (
          <ul
            className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4"
            aria-live="polite"
          >
            {posts.map((post) => (
              <li key={post.seq}>
                <article className="anon-grid-card flex h-full min-h-[7.5rem] flex-col rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-soft)] transition duration-200 hover:border-[color-mix(in_srgb,#ff9f0a_40%,var(--border))] sm:p-3.5">
                  <div className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-text-muted sm:text-xs">
                    <span className="rounded-full bg-[#FF9F0A]/20 px-2 py-0.5 font-semibold tabular-nums text-[#FF9F0A]">
                      #{post.seq}
                    </span>
                    <span className="font-medium text-text">Anonymous</span>
                  </div>
                  <p className="flex-1 text-sm leading-snug break-words text-text sm:text-[15px]">
                    {post.text}
                  </p>
                  <time
                    dateTime={post.createdAt}
                    className="mt-2 block text-[10px] text-text-muted sm:text-[11px]"
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </article>
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
                className="anon-post-btn"
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
