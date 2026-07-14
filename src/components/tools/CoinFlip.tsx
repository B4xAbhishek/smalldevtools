"use client";

import { Player } from "@remotion/player";
import { useCallback, useMemo, useState } from "react";
import { useAtom } from "jotai";
import {
  COIN_FLIP_DURATION,
  COIN_FLIP_FPS,
  CoinFlipComposition,
} from "@/remotion/CoinFlipComposition";
import { coinHistoryAtom, type CoinFace } from "@/state/atoms";

export function CoinFlip() {
  const [face, setFace] = useState<CoinFace | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useAtom(coinHistoryAtom);
  const [playKey, setPlayKey] = useState(0);

  const inputProps = useMemo(
    () => ({ result: face, spinning }),
    [face, spinning],
  );

  const flip = useCallback(() => {
    if (spinning) return;
    const result: CoinFace = Math.random() < 0.5 ? "heads" : "tails";
    setSpinning(true);
    setFace(null);
    setPlayKey((k) => k + 1);

    window.setTimeout(() => {
      setFace(result);
      setHistory((h) => [result, ...h].slice(0, 8));
      setSpinning(false);
    }, Math.round((COIN_FLIP_DURATION / COIN_FLIP_FPS) * 1000));
  }, [spinning, setHistory]);

  return (
    <div className="flex flex-col items-center gap-5 py-2 sm:gap-7">
      <div className="h-36 w-36 overflow-hidden rounded-full sm:h-44 sm:w-44">
        <Player
          key={playKey}
          component={CoinFlipComposition}
          inputProps={inputProps}
          durationInFrames={COIN_FLIP_DURATION}
          compositionWidth={176}
          compositionHeight={176}
          fps={COIN_FLIP_FPS}
          style={{ width: "100%", height: "100%" }}
          controls={false}
          autoPlay={spinning}
          loop={false}
          acknowledgeRemotionLicense
        />
      </div>

      <div className="text-center" aria-live="polite">
        <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
          Result
        </p>
        <p className="mt-1 text-3xl font-medium text-text sm:text-4xl">
          {spinning
            ? "Flipping…"
            : face
              ? face.toUpperCase()
              : "Ready when you are"}
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary w-full min-w-0 text-base sm:w-auto sm:min-w-[200px] sm:text-lg"
        onClick={flip}
        disabled={spinning}
      >
        {spinning ? "In the air…" : "Flip the coin"}
      </button>

      {history.length > 0 && (
        <div className="w-full rounded-xl border border-border bg-muted px-4 py-4">
          <p className="text-sm font-medium text-text">Recent flips</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {history.map((h, i) => (
              <span
                key={`${h}-${i}`}
                className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium capitalize text-text ring-1 ring-border"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
