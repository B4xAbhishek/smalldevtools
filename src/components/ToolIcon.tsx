import {
  AudioLines,
  Camera,
  CircleDot,
  Clapperboard,
  Eraser,
  Globe,
  Grid3x3,
  Hand,
  Hash,
  MapPin,
  MessageSquare,
  QrCode,
  Music2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ToolIconName } from "@/lib/tools";

const map: Record<Exclude<ToolIconName, "dice">, LucideIcon> = {
  audio: AudioLines,
  coin: CircleDot,
  screenshot: Camera,
  video: Clapperboard,
  bg: Eraser,
  qr: QrCode,
  extract: Music2,
  seven: Sparkles,
  rps: Hand,
  guess: Hash,
  tictactoe: Grid3x3,
  ip: Globe,
  location: MapPin,
  anon: MessageSquare,
};

/** Compact clay-style die glyph for tool headers / cards. */
function DiceGlyph({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4.5"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="8.25" cy="8.25" r="1.35" fill="currentColor" />
      <circle cx="15.75" cy="8.25" r="1.35" fill="currentColor" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" />
      <circle cx="8.25" cy="15.75" r="1.35" fill="currentColor" />
      <circle cx="15.75" cy="15.75" r="1.35" fill="currentColor" />
    </svg>
  );
}

export function ToolIcon({
  name,
  className,
  size = 22,
}: {
  name: ToolIconName;
  className?: string;
  size?: number;
}) {
  if (name === "dice") {
    return <DiceGlyph size={size} className={className} />;
  }
  const Icon = map[name];
  return <Icon className={className} size={size} aria-hidden strokeWidth={2} />;
}
