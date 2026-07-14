"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InstallAppButton } from "@/components/InstallApp";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TinyKitLogo } from "@/components/TinyKitLogo";
import { SITE_NAME } from "@/lib/tools";

function HeaderInner() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  if (embed) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center gap-2 rounded-md text-base font-medium tracking-tight text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:gap-2.5 sm:text-[17px]"
        >
          <TinyKitLogo size={28} className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
          <span className="truncate">{SITE_NAME}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/feedback"
            className="hidden text-sm text-text-muted hover:text-text sm:inline"
          >
            Feedback
          </Link>
          <InstallAppButton />
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
