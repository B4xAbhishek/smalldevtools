"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TinyKitLogo } from "@/components/TinyKitLogo";
import { SITE_NAME } from "@/lib/tools";

function HeaderInner() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  if (embed) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-md text-[17px] font-medium tracking-tight text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <TinyKitLogo size={28} />
          <span>{SITE_NAME}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/suggest"
            className="hidden text-sm text-text-muted hover:text-text sm:inline"
          >
            Suggest a tool
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderInner />
    </Suspense>
  );
}
