export type ToolCategory =
  | "document"
  | "audio"
  | "video"
  | "utility"
  | "social"
  | "games";

export type ToolIconName =
  | "audio"
  | "coin"
  | "screenshot"
  | "video"
  | "bg"
  | "qr"
  | "extract"
  | "dice"
  | "seven"
  | "rps"
  | "guess"
  | "tictactoe"
  | "ip"
  | "location"
  | "anon"
  | "color"
  | "compress"
  | "wordcount"
  | "diff";

export type ToolMeta = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  icon: ToolIconName;
  accent: string;
  /** Featured MVP tools — shown first with highlighted cards */
  mvp?: boolean;
  /** Supports multi-file batch mode */
  batch?: boolean;
  /** Query keys that can be prefilled via URL (?key=) */
  shareParams?: string[];
  keywords?: string[];
  /** Full document title override for SEO-focused tools */
  seoTitle?: string;
  /** Sitemap priority 0–1 (defaults to 0.7) */
  seoPriority?: number;
};

export const CATEGORIES: { id: "all" | ToolCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "document", label: "Document" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "utility", label: "Utility" },
  { id: "social", label: "Social" },
  { id: "games", label: "Games" },
];

/** Order matters: MVP tools first fill rows 1–2 on the home grid (4-col). */
export const tools: ToolMeta[] = [
  // —— MVP (first 2 rows) ——
  {
    slug: "anonymous-wall",
    name: "Anonymous Wall",
    tagline: "Post anything",
    description:
      "Drop a short anonymous note (max 50 characters). Posts show as Anonymous with a date and sequence number. Keep it civil.",
    category: "social",
    icon: "anon",
    accent: "#FF9F0A",
    mvp: true,
    seoTitle: "Anonymous Wall — Post Anything Anonymously",
    seoPriority: 1,
    keywords: [
      "anonymous",
      "anonymous wall",
      "anon post",
      "confession",
      "public board",
      "social",
    ],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    tagline: "Shrink photos for WhatsApp",
    description:
      "Compress JPG, PNG, or WebP in your browser. Dial quality and max width, then download a smaller file — nothing uploaded to a server.",
    category: "document",
    icon: "compress",
    accent: "#FF9F0A",
    mvp: true,
    seoTitle: "Image Compressor — Shrink Photos Free in Browser",
    seoPriority: 1,
    keywords: [
      "image compressor",
      "compress image",
      "reduce image size",
      "compress photo",
      "whatsapp image size",
      "jpg compressor",
    ],
  },
  {
    slug: "opus-to-mp3",
    name: "WhatsApp Audio to MP3",
    tagline: "Opus voice notes",
    description:
      "Convert WhatsApp audio and Opus voice notes to MP3 free in your browser. Upload .opus files, download MP3 — nothing uploaded to a server.",
    category: "audio",
    icon: "audio",
    accent: "#0071E3",
    mvp: true,
    batch: true,
    seoTitle: "WhatsApp Audio to MP3 — Convert Opus Voice Notes Free",
    seoPriority: 1,
    keywords: [
      "whatsapp audio to mp3",
      "whatsapp voice to mp3",
      "whatsapp opus to mp3",
      "opus to mp3",
      "convert opus to mp3",
      "voice note to mp3",
      "whatsapp audio converter",
    ],
  },
  {
    slug: "coin-flip",
    name: "Coin Flip",
    tagline: "Coin toss online",
    description:
      "Free online coin flip and coin toss — heads or tails in one tap. Fair random flips for decisions, games, or settling debates. No signup.",
    category: "games",
    icon: "coin",
    accent: "#FF9F0A",
    mvp: true,
    seoTitle: "Coin Flip Online — Free Coin Toss (Heads or Tails)",
    seoPriority: 1,
    keywords: [
      "coin flip",
      "coin toss",
      "toss a coin",
      "heads or tails",
      "online coin flip",
      "virtual coin flip",
      "flip a coin",
    ],
  },
  {
    slug: "qr-code",
    name: "QR Code Generator",
    tagline: "Free QR codes",
    description:
      "Free QR code generator — create a QR from any URL or text and download a clean PNG instantly. No signup, works in your browser.",
    category: "utility",
    icon: "qr",
    accent: "#0A84FF",
    mvp: true,
    shareParams: ["text"],
    seoTitle: "Free QR Code Generator — Create & Download PNG",
    seoPriority: 1,
    keywords: [
      "qr code generator",
      "free qr code",
      "create qr code",
      "qr code maker",
      "generate qr code",
      "download qr code png",
    ],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    tagline: "Words · characters · reading time",
    description:
      "Count words, characters, sentences, and paragraphs as you type. See reading time instantly — free, no signup.",
    category: "utility",
    icon: "wordcount",
    accent: "#30D158",
    mvp: true,
    seoTitle: "Word Counter — Characters, Words & Reading Time",
    seoPriority: 1,
    keywords: [
      "word counter",
      "character counter",
      "word count",
      "character count",
      "online word counter",
      "reading time",
    ],
  },
  {
    slug: "text-diff",
    name: "Text Diff",
    tagline: "Compare two texts",
    description:
      "Paste two versions of text and see what changed line by line. Green for additions, red for removals — all in your browser.",
    category: "utility",
    icon: "diff",
    accent: "#BF5AF2",
    mvp: true,
    seoTitle: "Text Diff — Compare Two Texts Online",
    seoPriority: 1,
    keywords: [
      "text diff",
      "compare text",
      "diff checker",
      "text comparison",
      "find differences",
      "online diff",
    ],
  },
  {
    slug: "seven-up-down",
    name: "7 Up 7 Down",
    tagline: "Online dice game",
    description:
      "Play 7 Up 7 Down online free — pick 7 Down, 7, or 7 Up, roll two dice, and see if you win. Fast classic dice prediction game in your browser.",
    category: "games",
    icon: "seven",
    accent: "#BF5AF2",
    mvp: true,
    seoTitle: "7 Up 7 Down Game Online — Free Dice Prediction",
    seoPriority: 1,
    keywords: [
      "7 up 7 down",
      "7up 7down",
      "7 up 7 down game",
      "seven up seven down",
      "7 up 7 down online",
      "dice prediction game",
    ],
  },
  {
    slug: "color-code",
    name: "Color Code",
    tagline: "HEX · RGB · HSL",
    description:
      "Convert colors between HEX, RGB, HSL, and HSV instantly. Pick a color, copy any format, and share a link — all in your browser.",
    category: "utility",
    icon: "color",
    accent: "#FF375F",
    shareParams: ["hex"],
    seoTitle: "Color Code Converter — HEX, RGB, HSL, HSV",
    seoPriority: 1,
    keywords: [
      "color code",
      "hex to rgb",
      "rgb to hex",
      "hsl converter",
      "color converter",
      "color picker",
      "hex color",
    ],
  },
  // —— Rest ——
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
    slug: "whats-my-ip",
    name: "What's my IP",
    tagline: "Public IP address",
    description:
      "See your public IP address as the site sees it. Copy it in one tap — useful for networking and debugging.",
    category: "utility",
    icon: "ip",
    accent: "#5AC8FA",
    keywords: ["ip address", "whats my ip", "public ip", "network"],
  },
  {
    slug: "whats-my-location",
    name: "What's my exact location",
    tagline: "GPS coordinates",
    description:
      "Get your exact latitude and longitude from your device. Copy coordinates or open them on a map — all in your browser.",
    category: "utility",
    icon: "location",
    accent: "#34C759",
    keywords: [
      "location",
      "gps",
      "coordinates",
      "latitude",
      "longitude",
      "whats my location",
    ],
  },
  {
    slug: "dice-roller",
    name: "Dice Roller",
    tagline: "Random dice",
    description:
      "Roll 1–6 dice at once. Fair random rolls for board games, D&D warmups, or quick decisions.",
    category: "games",
    icon: "dice",
    accent: "#FF375F",
    keywords: ["dice", "roller", "random", "d6"],
  },
  {
    slug: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    tagline: "Classic showdown",
    description:
      "Pick rock, paper, or scissors and play against a fair random opponent. Track your wins and losses.",
    category: "games",
    icon: "rps",
    accent: "#64D2FF",
    keywords: ["rock paper scissors", "rps", "game"],
  },
  {
    slug: "number-guess",
    name: "Number Guessing",
    tagline: "1 to 100",
    description:
      "Guess the secret number between 1 and 100. Too high / too low hints until you nail it.",
    category: "games",
    icon: "guess",
    accent: "#30D158",
    keywords: ["number guessing", "guess", "1 to 100"],
  },
  {
    slug: "tic-tac-toe",
    name: "Tic Tac Toe",
    tagline: "X vs O",
    description:
      "Classic 3×3 tic-tac-toe for two players on the same device. Take turns and get three in a row.",
    category: "games",
    icon: "tictactoe",
    accent: "#FF9F0A",
    keywords: ["tic tac toe", "noughts crosses", "xo"],
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}

export function filterTools(category: "all" | ToolCategory) {
  if (category === "all") return tools;
  return tools.filter((t) => t.category === category);
}

export const SITE_NAME = "TinyKit";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tinykit.vercel.app";
