import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ToolCategory } from "@/lib/tools";

export type ThemeMode = "light" | "dark";
export type CoinFace = "heads" | "tails";

export const themeModeAtom = atom<ThemeMode>("dark");
export const toolCategoryAtom = atom<"all" | ToolCategory>("all");
export const toolSearchAtom = atom("");
export const coinHistoryAtom = atom<CoinFace[]>([]);

export const favoriteToolsAtom = atomWithStorage<string[]>(
  "sdt-favorites",
  [],
);

export const recentToolsAtom = atomWithStorage<string[]>("sdt-recent", []);

export const batchModeAtom = atom(false);
