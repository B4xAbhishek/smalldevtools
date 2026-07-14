import { atom } from "jotai";
import type { ToolCategory } from "@/lib/tools";

export type ThemeMode = "light" | "dark";
export type CoinFace = "heads" | "tails";

export const themeModeAtom = atom<ThemeMode>("light");
export const toolCategoryAtom = atom<"all" | ToolCategory>("all");
export const toolSearchAtom = atom("");
export const coinHistoryAtom = atom<CoinFace[]>([]);
