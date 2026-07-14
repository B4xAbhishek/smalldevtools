import {
  AudioLines,
  Camera,
  CircleDot,
  Clapperboard,
  Eraser,
  QrCode,
  Music2,
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
