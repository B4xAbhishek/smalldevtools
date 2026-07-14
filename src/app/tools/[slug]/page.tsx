import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTool, tools } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { OpusToMp3 } from "@/components/tools/OpusToMp3";
import { CoinFlip } from "@/components/tools/CoinFlip";
import { PageScreenshot } from "@/components/tools/PageScreenshot";
import { VideoCutter } from "@/components/tools/VideoCutter";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool not found" };
  return {
    title: `${tool.name} · SmallDevTools`,
    description: tool.description,
  };
}

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
    default:
      return null;
  }
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/#tools"
        className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronLeft size={16} aria-hidden />
        Tools
      </Link>

      <article className="soft-card mt-4 p-5 sm:p-7">
        <div className="mb-3 flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: `color-mix(in srgb, ${tool.accent} 16%, transparent)`,
              color: tool.accent,
            }}
          >
            <ToolIcon name={tool.icon} size={20} />
          </span>
          <span className="text-xs capitalize text-text-muted">
            {tool.category}
          </span>
        </div>

        <h1 className="text-2xl font-medium tracking-tight text-text sm:text-3xl">
          {tool.name}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
          {tool.description}
        </p>

        <div className="mt-6 border-t border-border pt-6">
          <ToolBody slug={tool.slug} />
        </div>
      </article>
    </div>
  );
}
