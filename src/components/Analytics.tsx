"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/analytics";

export function Analytics() {
  useEffect(() => {
    initPostHog();
  }, []);
  return null;
}
