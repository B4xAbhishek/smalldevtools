"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { recentToolsAtom } from "@/state/atoms";
import { track } from "@/lib/analytics";

export function useTrackToolVisit(slug: string) {
  const setRecent = useSetAtom(recentToolsAtom);

  useEffect(() => {
    setRecent((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 4);
      return next;
    });
    track("tool_opened", { slug });
  }, [slug, setRecent]);
}
