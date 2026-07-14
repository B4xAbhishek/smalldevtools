export type ToolCategory = "document" | "audio" | "video" | "utility";

export type ToolIconName =
  | "audio"
  | "coin"
  | "screenshot"
  | "video"
  | "bg"
  | "qr"
  | "extract";

export type ToolMeta = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  icon: ToolIconName;
  accent: string;
  /** Supports multi-file batch mode */
  batch?: boolean;
  /** Query keys that can be prefilled via URL (?key=) */
  shareParams?: string[];
  keywords?: string[];
};

export const CATEGORIES: { id: "all" | ToolCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "document", label: "Document" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "utility", label: "Utility" },
];

export const tools: ToolMeta[] = [
  {
    slug: "opus-to-mp3",
    name: "Opus to MP3",
    tagline: "Convert audio",
    description:
      "Upload an Opus file and download an MP3. Everything runs in your browser — nothing is uploaded to a server.",
    category: "audio",
    icon: "audio",
    accent: "#0071E3",
    batch: true,
    keywords: ["opus", "mp3", "convert", "audio"],
  },
  {
    slug: "extract-audio",
    name: "Extract Audio",
    tagline: "Video to MP3",
    description:
      "Pull the soundtrack out of a video file and download it as MP3 — right in your browser.",
    category: "audio",
    icon: "extract",
    accent: "#AF52DE",
    batch: true,
    keywords: ["extract audio", "video to mp3", "soundtrack"],
  },
  {
    slug: "video-cutter",
    name: "Video Cutter",
    tagline: "Trim a clip",
    description:
      "Choose start and end times in seconds. We cut the video and give you the clip back.",
    category: "video",
    icon: "video",
    accent: "#FF453A",
    shareParams: ["start", "end"],
    keywords: ["trim video", "cut video", "clip"],
  },
  {
    slug: "background-remover",
    name: "Background Remover",
    tagline: "Cut out subject",
    description:
      "Upload a photo and remove the background locally in your browser. Great for product shots and profile pics.",
    category: "document",
    icon: "bg",
    accent: "#30D158",
    batch: true,
    keywords: ["remove background", "transparent png", "cutout"],
  },
  {
    slug: "page-screenshot",
    name: "Page Screenshot",
    tagline: "Capture any page",
    description:
      "Paste a public website link and get a full-page screenshot you can save.",
    category: "document",
    icon: "screenshot",
    accent: "#64D2FF",
    shareParams: ["url"],
    keywords: ["screenshot", "webpage capture"],
  },
  {
    slug: "qr-code",
    name: "QR Code Generator",
    tagline: "Link to QR",
    description:
      "Type a URL or message and download a clean QR code PNG. Prefill via ?text= in the link.",
    category: "utility",
    icon: "qr",
    accent: "#0A84FF",
    shareParams: ["text"],
    keywords: ["qr code", "generator", "barcode"],
  },
  {
    slug: "coin-flip",
    name: "Coin Flip",
    tagline: "Heads or tails",
    description:
      "Need a quick toss? Flip a fair coin for decisions, games, or settling a debate.",
    category: "utility",
    icon: "coin",
    accent: "#FF9F0A",
    keywords: ["coin flip", "toss", "heads tails"],
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}

export function filterTools(category: "all" | ToolCategory) {
  if (category === "all") return tools;
  return tools.filter((t) => t.category === category);
}

export const SITE_NAME = "SmallTools";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://smalldevtools.vercel.app";
