"use client";

import { Provider, useAtom } from "jotai";
import { useEffect } from "react";
import { themeModeAtom, type ThemeMode } from "@/state/atoms";

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function ThemeBootstrap({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useAtom(themeModeAtom);

  useEffect(() => {
    const stored = localStorage.getItem("sdt-theme") as ThemeMode | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = stored ?? (prefersDark ? "dark" : "light");
    setTheme(next);
    applyTheme(next);
  }, [setTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return children;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <ThemeBootstrap>{children}</ThemeBootstrap>
    </Provider>
  );
}

export function useTheme() {
  const [theme, setThemeState] = useAtom(themeModeAtom);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem("sdt-theme", t);
    applyTheme(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}
