"use client";

import { Download, Share, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const BANNER_DISMISS_KEY = "sdt-a2hs-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallListener = () => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<InstallListener>();

function notifyInstallListeners() {
  for (const listener of listeners) listener();
}

function subscribeInstallState(listener: InstallListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const standaloneMq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return standaloneMq || iosStandalone;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notOtherBrowser = !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/.test(ua);
  return iOS && webkit && notOtherBrowser;
}

let bipWired = false;

function ensureBeforeInstallPromptWired() {
  if (bipWired || typeof window === "undefined") return;
  bipWired = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyInstallListeners();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notifyInstallListeners();
  });
}

function useInstallPrompt() {
  const [, bump] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureBeforeInstallPromptWired();
    setInstalled(isStandaloneDisplay());
    setIos(isIosSafari());
    setReady(true);

    const unsub = subscribeInstallState(() => {
      setInstalled(isStandaloneDisplay());
      bump((n) => n + 1);
    });

    const mq = window.matchMedia("(display-mode: standalone)");
    const onMq = () => setInstalled(isStandaloneDisplay());
    mq.addEventListener?.("change", onMq);

    return () => {
      unsub();
      mq.removeEventListener?.("change", onMq);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    notifyInstallListeners();
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    return choice.outcome === "accepted";
  }, []);

  return {
    installed,
    ios,
    ready,
    promptInstall,
    canNativePrompt: Boolean(deferredPrompt),
  };
}

export function InstallAppButton() {
  const { installed, ios, ready, promptInstall, canNativePrompt } =
    useInstallPrompt();
  const [showIosTip, setShowIosTip] = useState(false);

  if (!ready || installed) return null;
  if (!canNativePrompt && !ios) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (canNativePrompt) {
            void promptInstall();
            return;
          }
          setShowIosTip((v) => !v);
        }}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border px-2.5 text-text transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-3"
        aria-label="Add to Home Screen"
        title="Add to Home Screen"
      >
        <Download size={16} aria-hidden />
        <span className="hidden text-sm sm:inline">Install</span>
      </button>
      {showIosTip ? (
        <IosTipPopover onClose={() => setShowIosTip(false)} />
      ) : null}
    </div>
  );
}

function IosTipPopover({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="How to add TinyKit to your Home Screen"
      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-surface p-3 text-left shadow-[var(--shadow-lift)]"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-text">Add to Home Screen</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-muted hover:text-text"
          aria-label="Close"
        >
          <X size={14} aria-hidden />
        </button>
      </div>
      <ol className="space-y-1.5 text-xs leading-relaxed text-text-muted">
        <li className="flex items-start gap-1.5">
          <span className="font-medium text-text">1.</span>
          <span className="inline-flex flex-wrap items-center gap-1">
            Tap Share
            <Share size={12} className="inline text-primary" aria-hidden />
            in Safari
          </span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="font-medium text-text">2.</span>
          <span>Scroll and tap “Add to Home Screen”</span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="font-medium text-text">3.</span>
          <span>Confirm with Add</span>
        </li>
      </ol>
    </div>
  );
}

function InstallAppBannerInner() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  const { installed, ios, ready, promptInstall, canNativePrompt } =
    useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(BANNER_DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  if (embed || !ready || installed || dismissed) return null;
  if (!canNativePrompt && !ios) return null;

  let body: ReactNode;
  if (showIosSteps && ios) {
    body = (
      <ol className="mt-1 space-y-1 text-xs leading-relaxed text-text-muted sm:text-sm">
        <li>
          Tap Share{" "}
          <Share size={12} className="inline text-primary" aria-hidden /> in
          Safari
        </li>
        <li>Choose “Add to Home Screen”, then Add</li>
      </ol>
    );
  } else {
    body = (
      <p className="mt-0.5 text-xs text-text-muted sm:text-sm">
        Install TinyKit for quick access from your home screen.
      </p>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-3 pb-3 sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:items-center sm:p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text">
              Add TinyKit to Home Screen
            </p>
            {body}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {canNativePrompt ? (
              <button
                type="button"
                onClick={() => void promptInstall()}
                className="inline-flex h-9 items-center rounded-full bg-cta px-3 text-sm font-medium text-white transition-colors hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Install
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowIosSteps(true)}
                className="inline-flex h-9 items-center rounded-full bg-cta px-3 text-sm font-medium text-white transition-colors hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                How to
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label="Dismiss install banner"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstallAppBanner() {
  return (
    <Suspense fallback={null}>
      <InstallAppBannerInner />
    </Suspense>
  );
}
