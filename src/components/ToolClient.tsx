"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTrackToolVisit } from "@/hooks/useTrackToolVisit";
import { ToolChrome } from "@/components/ToolChrome";
import { OpusToMp3 } from "@/components/tools/OpusToMp3";
import { CoinFlip } from "@/components/tools/CoinFlip";
import { PageScreenshot } from "@/components/tools/PageScreenshot";
import { VideoCutter } from "@/components/tools/VideoCutter";
import { QrCodeGenerator } from "@/components/tools/QrCodeGenerator";
import { BackgroundRemover } from "@/components/tools/BackgroundRemover";
import { ExtractAudio } from "@/components/tools/ExtractAudio";
import { DiceRoller } from "@/components/tools/DiceRoller";
import { SevenUpDown } from "@/components/tools/SevenUpDown";
import { RockPaperScissors } from "@/components/tools/RockPaperScissors";
import { NumberGuess } from "@/components/tools/NumberGuess";
import { TicTacToe } from "@/components/tools/TicTacToe";
import { WhatsMyIp } from "@/components/tools/WhatsMyIp";
import { getTool } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";

function ToolBody({ slug }: { slug: string }) {
  switch (slug) {
    case "opus-to-mp3":
      return <OpusToMp3 />;
    case "coin-flip":
      return <CoinFlip />;
    case "page-screenshot":
      return <PageScreenshot />;
    case "video-cutter":
      return <VideoCutter />;
    case "qr-code":
      return <QrCodeGenerator />;
    case "whats-my-ip":
      return <WhatsMyIp />;
    case "background-remover":
      return <BackgroundRemover />;
    case "extract-audio":
      return <ExtractAudio />;
    case "dice-roller":
      return <DiceRoller />;
    case "seven-up-down":
      return <SevenUpDown />;
    case "rock-paper-scissors":
      return <RockPaperScissors />;
    case "number-guess":
      return <NumberGuess />;
    case "tic-tac-toe":
      return <TicTacToe />;
    default:
      return null;
  }
}

function ToolClientInner({ slug }: { slug: string }) {
  const tool = getTool(slug);
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  useTrackToolVisit(slug);

  useEffect(() => {
    document.documentElement.dataset.embed = embed ? "1" : "0";
    return () => {
      delete document.documentElement.dataset.embed;
    };
  }, [embed]);

  if (!tool) return null;

  return (
    <div
      className={
        embed
          ? "mx-auto max-w-2xl p-3 sm:p-4"
          : "mx-auto max-w-2xl px-3 py-5 sm:px-6 sm:py-10"
      }
    >
      {!embed && (
        <a
          href="/#tools"
          className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          ← Tools
        </a>
      )}

      <article
        className={`soft-card ${embed ? "border-0 shadow-none" : "mt-3 sm:mt-4"} p-4 sm:p-7`}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium capitalize tracking-wide text-text-muted">
            {tool.category}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
              style={{
                backgroundColor: `color-mix(in srgb, ${tool.accent} 16%, transparent)`,
                color: tool.accent,
              }}
              aria-hidden
            >
              <ToolIcon name={tool.icon} size={20} />
            </span>
            <h1 className="min-w-0 text-xl font-medium tracking-tight text-text sm:text-3xl">
              {tool.name}
            </h1>
          </div>
          {!embed && <ToolChrome tool={tool} />}
        </div>

        <p className="mt-2 text-sm leading-relaxed text-text-muted sm:text-[15px]">
          {tool.description}
        </p>

        {!embed && <ToolChrome tool={tool} batchOnly />}

        <div className="mt-5 border-t border-border pt-5 sm:mt-6 sm:pt-6">
          <ToolBody slug={tool.slug} />
        </div>
      </article>
    </div>
  );
}

export function ToolClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-text-muted">Loading tool…</div>}>
      <ToolClientInner slug={slug} />
    </Suspense>
  );
}
