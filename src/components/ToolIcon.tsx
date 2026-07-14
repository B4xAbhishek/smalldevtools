import {
  AudioLines,
  Camera,
  CircleDot,
  Clapperboard,
  Dices,
  Eraser,
  Grid3x3,
  Hand,
  Hash,
  QrCode,
  Music2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ToolIconName } from "@/lib/tools";

const map: Record<ToolIconName, LucideIcon> = {
  audio: AudioLines,
  coin: CircleDot,
  screenshot: Camera,
  video: Clapperboard,
  bg: Eraser,
  qr: QrCode,
  extract: Music2,
  dice: Dices,
  seven: Sparkles,
  rps: Hand,
  guess: Hash,
  tictactoe: Grid3x3,
};

export function ToolIcon({
  name,
  className,
  size = 22,
}: {
  name: ToolIconName;
  className?: string;
  size?: number;
}) {
  const Icon = map[name];
  return <Icon className={className} size={size} aria-hidden strokeWidth={2} />;
}
