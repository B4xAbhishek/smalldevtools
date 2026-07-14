import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type CardRevealProps = {
  accent: string;
};

/** Soft Remotion pulse behind tool card icons */
export function CardRevealComposition({ accent }: CardRevealProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const scale = interpolate(enter, [0, 1], [0.55, 1]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const ring = interpolate(frame, [0, 24], [0, 6], {
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(frame, [0, 24], [0.45, 0], {
    extrapolateRight: "clamp",
  });

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
          width: 32,
          height: 32,
          borderRadius: "50%",
          transform: `scale(${scale})`,
          opacity,
          backgroundColor: `${accent}22`,
          boxShadow: `0 0 0 ${ring}px ${accent}${Math.round(ringOpacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        }}
      />
    </AbsoluteFill>
  );
}
