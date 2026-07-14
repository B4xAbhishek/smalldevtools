export type ToolCategory =
  | "document"
  | "audio"
  | "video"
  | "utility"
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
  | "ip";

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
  { id: "games", label: "Games" },
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
    slug: "coin-flip",
    name: "Coin Flip",
    tagline: "Heads or tails",
    description:
      "Need a quick toss? Flip a fair coin for decisions, games, or settling a debate.",
    category: "games",
    icon: "coin",
    accent: "#FF9F0A",
    keywords: ["coin flip", "toss", "heads tails"],
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
    slug: "seven-up-down",
    name: "7 Up 7 Down",
    tagline: "Predict then roll",
    description:
      "Pick 7 Down (under 7), 7 (exact), or 7 Up (over 7), then roll two dice and see if you win.",
    category: "games",
    icon: "seven",
    accent: "#BF5AF2",
    keywords: ["7 up 7 down", "dice game", "predict"],
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
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://smalldevtools.vercel.app";
