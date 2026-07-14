export type ToolCategory = "document" | "audio" | "video" | "utility";

export type ToolIconName =
  | "audio"
  | "coin"
  | "screenshot"
  | "video";

export type ToolMeta = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  icon: ToolIconName;
  accent: string;
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
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}

export function filterTools(category: "all" | ToolCategory) {
  if (category === "all") return tools;
  return tools.filter((t) => t.category === category);
}
