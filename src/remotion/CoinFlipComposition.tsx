import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type CoinFlipCompositionProps = {
  result: "heads" | "tails" | null;
  spinning: boolean;
};

export const COIN_FLIP_FPS = 30;
export const COIN_FLIP_DURATION = 45; // 1.5s

export function CoinFlipComposition({
  result,
  spinning,
}: CoinFlipCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spinProgress = spinning
    ? spring({
        frame,
        fps,
        config: { damping: 18, stiffness: 80, mass: 0.8 },
        durationInFrames: COIN_FLIP_DURATION,
      })
    : 1;

  const rotations = spinning ? interpolate(spinProgress, [0, 1], [0, 5]) : 0;
  const scale = spinning
    ? interpolate(spinProgress, [0, 0.5, 1], [1, 1.12, 1])
    : 1;
  const y = spinning
    ? interpolate(spinProgress, [0, 0.45, 1], [0, -28, 0])
    : 0;

  const label = spinning ? "…" : result === "heads" ? "H" : result === "tails" ? "T" : "?";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: "4px solid #fbbf24",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${y}px) scale(${scale}) rotateY(${rotations * 360}deg)`,
          background:
            "radial-gradient(circle at 35% 30%, #fde68a, #f59e0b 55%, #d97706)",
          boxShadow:
            "inset 0 0 18px rgba(0,0,0,0.2), 0 10px 28px rgba(245, 158, 11, 0.35)",
          fontFamily:
            '"Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, Arial, sans-serif',
          fontSize: 48,
          fontWeight: 700,
          color: "#451a03",
          backfaceVisibility: "hidden",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
}
