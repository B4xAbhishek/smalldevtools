/** Blocked Hindi slang / abusive tokens (case-insensitive). */
const BLOCKED_WORDS = [
  "chut",
  "lund",
  "choot",
  "lawda",
  "loda",
] as const;

const BLOCKED_PATTERN = new RegExp(
  `\\b(?:${BLOCKED_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "i",
);

export const ANON_MAX_CHARS = 50;
export const ANON_MIN_CHARS = 1;

export function containsBlockedLanguage(text: string): boolean {
  const normalized = text
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return BLOCKED_PATTERN.test(normalized);
}
